// src/app/api/parse-document/route.ts

import fs from "fs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import mammoth from "mammoth";
import type { ProfileData, ContactInfo } from "@/context/profileContext";

// 1) Capture the original
const originalReadFileSync = fs.readFileSync;

// 2) Stub that matches an overload returning Buffer|string
const stubbedReadFileSync: (
  path: fs.PathOrFileDescriptor,
  options?: BufferEncoding | fs.ObjectEncodingOptions | null
) => Buffer | string = (path, options) => {
  // intercept pdf-parse’s test-data load
  if (typeof path === "string" && path.includes("/test/data/")) {
    return Buffer.alloc(0);
  }
  // delegate everything else
  return originalReadFileSync(path, options as fs.ObjectEncodingOptions);
};

// 3) Install the stub
fs.readFileSync = stubbedReadFileSync as typeof fs.readFileSync;

// 4) Turn off Next’s built-in body parser
export const config = { api: { bodyParser: false } };

// 5) OpenAI client
const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) throw new Error("Missing GITHUB_TOKEN");
const client = new OpenAI({ baseURL: "https://models.github.ai/inference", apiKey: TOKEN });
const MODEL = "openai/gpt-4o-mini";

// 6) Merge helper
function mergeProfiles(a: Partial<ProfileData>, b: Partial<ProfileData>): Partial<ProfileData> {
  const result: Partial<ProfileData> = {};

  if (a.contactInfo || b.contactInfo) {
    const email = b.contactInfo?.email ?? a.contactInfo?.email ?? "";
    const phone = b.contactInfo?.phone ?? a.contactInfo?.phone ?? "";
    const extraEmails = Array.from(new Set([...(a.contactInfo?.additionalEmails ?? []), ...(b.contactInfo?.additionalEmails ?? [])]));
    const extraPhones = Array.from(new Set([...(a.contactInfo?.additionalPhones ?? []), ...(b.contactInfo?.additionalPhones ?? [])]));
    const ci: ContactInfo = { email, phone };
    if (extraEmails.length) ci.additionalEmails = extraEmails;
    if (extraPhones.length) ci.additionalPhones = extraPhones;
    result.contactInfo = ci;
  }

  if (a.careerObjective || b.careerObjective) {
    result.careerObjective = b.careerObjective ?? a.careerObjective;
  }

  if ((a.skills?.length ?? 0) + (b.skills?.length ?? 0) > 0) {
    result.skills = Array.from(new Set([...(a.skills ?? []), ...(b.skills ?? [])]));
  }

  if ((a.jobHistory?.length ?? 0) + (b.jobHistory?.length ?? 0) > 0) {
    result.jobHistory = [...(a.jobHistory ?? []), ...(b.jobHistory ?? [])];
  }

  if ((a.education?.length ?? 0) + (b.education?.length ?? 0) > 0) {
    result.education = [...(a.education ?? []), ...(b.education ?? [])];
  }

  return result;
}

// 7) The handler
export async function POST(request: Request) {
  // a) parse FormData
  const form = await request.formData();
  const file = form.get("file");
  const type = form.get("type");
  if (!(file instanceof Blob) || (type !== "document" && type !== "biography")) {
    return NextResponse.json({ error: "Missing file or invalid type" }, { status: 400 });
  }

  // b) into Uint8Array
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  // c) extract text
  let text: string;
  if (file.type === "application/pdf") {
    const { default: pdfParse } = await import("pdf-parse");
    const { text: pdfText } = await pdfParse(Buffer.from(uint8));
    text = pdfText;
  } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(uint8) });
    text = value;
  } else {
    text = new TextDecoder("utf-8").decode(uint8);
  }

  // d) prompt
  const systemPrompt = `
You are an expert resume parser.
Respond with NOTHING but a single, valid JSON object matching this interface exactly:

interface ProfileData {
  contactInfo: { email: string; phone: string; additionalEmails?: string[]; additionalPhones?: string[] };
  careerObjective: string;
  skills: string[];
  jobHistory: { company: string; title: string; description: string; startDate: string; endDate: string; accomplishments: string[] }[];
  education: { school: string; degree: string; dates: string; gpa?: string }[];
}

Output only the JSON, no explanation.
  `.trim();

  // e) call model
  const ai = await client.chat.completions.create({
    model: MODEL,
    temperature: 0,
    top_p: 1,
    max_tokens: 2000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
  });

  // f) parse JSON
  const raw = ai.choices[0].message.content ?? "";
  const match = raw.match(/\{[\s\S]*\}$/);
  if (!match) {
    return NextResponse.json({ error: "Invalid JSON from parser", raw }, { status: 502 });
  }
  let parsed: Partial<ProfileData>;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return NextResponse.json({ error: "JSON.parse failed", raw }, { status: 502 });
  }

  // g) merge & return
  const merged = mergeProfiles({}, parsed);
  return NextResponse.json(merged);
}
