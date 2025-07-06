// src/app/api/profiles/[id]/parse/route.ts

import fs from "fs";
import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { ObjectId } from "mongodb";
import { db, bucket } from "@/lib/mongodb";
import OpenAI from "openai";
import mammoth from "mammoth";
import type { ProfileData } from "@/context/profileContext";

// === Stub out pdf-parse's test-data loader ===
const originalReadFileSync = fs.readFileSync;
function stubbedReadFileSync(
  path: fs.PathOrFileDescriptor,
  options?: BufferEncoding | fs.ObjectEncodingOptions | null
): Buffer | string {
  if (typeof path === "string" && path.includes("/test/data/")) {
    return Buffer.alloc(0);
  }
  return originalReadFileSync(path, options as fs.ObjectEncodingOptions);
}
fs.readFileSync = stubbedReadFileSync as unknown as typeof fs.readFileSync;

export const config = { api: { bodyParser: false } };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const TOKEN = process.env.GITHUB_TOKEN!;
const aiClient = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: TOKEN,
});
const MODEL = "openai/gpt-4o-mini";

// Extract text with PDF fallback
async function extractText(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") {
    try {
      const { default: pdfParse } = await import("pdf-parse");
      const { text } = await pdfParse(buffer);
      return text;
    } catch {
      return buffer.toString("utf-8");
    }
  } else if (ext === "docx") {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  } else {
    return buffer.toString("utf-8");
  }
}

async function parseWithAI(text: string): Promise<Partial<ProfileData>> {
  const systemPrompt = `
You are an expert resume parser.
Respond with NOTHING but a single, valid JSON object matching this interface exactly:

interface ProfileData {
  contactInfo: {
    email: string;
    phone: string; // MUST include the full international format with "+" prefix (e.g., "+56XXXXXXXXX")
    additionalEmails?: string[];
    additionalPhones?: string[];
  };
  careerObjective: string;
  skills: string[];
  jobHistory: {
    company: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    accomplishments: string[];
  }[];
  education: {
    school: string;
    degree: string;
    dates: string;
    gpa?: string;
  }[];
}

VERY IMPORTANT:
- Format contactInfo.phone as "+[countrycode][restofnumber]" with NO spaces after the "+" (e.g., "+56123456789").
- Do not include any explanations or formatting outside of the JSON.
`.trim();

  const completion = await aiClient.chat.completions.create({
    model: MODEL,
    temperature: 0,
    top_p: 1,
    max_tokens: 2000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
  });

  const raw = completion.choices[0].message.content ?? "";
  const match = raw.match(/\{[\s\S]*\}$/);
  if (!match) throw new Error("Invalid JSON from parser");
  return JSON.parse(match[0]) as Partial<ProfileData>;
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  // IMPORTANT: Await params to avoid Next.js error
  const { id: profileId } = await context.params;

  const bearer = request.headers.get("Authorization")?.replace(/^Bearer\s+/, "");
  if (!bearer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const decoded = await admin.auth().verifyIdToken(bearer).catch(() => null);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!ObjectId.isValid(profileId)) {
    return NextResponse.json({ error: "Bad profile ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as Record<string, unknown>).fileId !== "string"
  ) {
    return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
  }
  const fileId = (body as { fileId: string }).fileId;
  if (!ObjectId.isValid(fileId)) {
    return NextResponse.json({ error: "Bad fileId" }, { status: 400 });
  }

  const fileMeta = await db
    .collection("uploads.files")
    .findOne<{ filename: string }>({ _id: new ObjectId(fileId) });
  if (!fileMeta?.filename) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    downloadStream.on("data", (c: Buffer) => chunks.push(c));
    downloadStream.on("error", reject);
    downloadStream.on("end", () => resolve());
  });
  const buffer = Buffer.concat(chunks);

  const text = await extractText(buffer, fileMeta.filename);

  let parsed: Partial<ProfileData>;
  try {
    parsed = await parseWithAI(text);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 }
    );
  }

  await db.collection("profiles").updateOne(
    { _id: new ObjectId(profileId), userId: decoded.uid },
    { $set: { data: parsed, updatedAt: new Date() } }
  );

  return NextResponse.json(parsed);
}
