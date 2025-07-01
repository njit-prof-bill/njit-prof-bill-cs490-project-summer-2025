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
// Cast to satisfy all overloads of fs.readFileSync
fs.readFileSync = stubbedReadFileSync as unknown as typeof fs.readFileSync;

export const config = { api: { bodyParser: false } };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_ADMIN_KEY!)
    ),
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
      // fallback: raw UTF-8
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
  contactInfo: { email: string; phone: string; additionalEmails?: string[]; additionalPhones?: string[] };
  careerObjective: string;
  skills: string[];
  jobHistory: { company: string; title: string; description: string; startDate: string; endDate: string; accomplishments: string[] }[];
  education: { school: string; degree: string; dates: string; gpa?: string }[];
}

Output only the JSON, no explanation.
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
  { params }: { params: { id: string } }
) {
  const { id: profileId } = await params;

  // 1) Auth
  const bearer = request.headers.get("Authorization")?.replace(/^Bearer\s+/, "");
  if (!bearer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const decoded = await admin.auth().verifyIdToken(bearer).catch(() => null);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // 2) Validate profileId
  if (!ObjectId.isValid(profileId)) {
    return NextResponse.json({ error: "Bad profile ID" }, { status: 400 });
  }

  // 3) Parse JSON body
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

  // 4) Lookup filename
  const fileMeta = await db
    .collection("uploads.files")
    .findOne<{ filename: string }>({ _id: new ObjectId(fileId) });
  if (!fileMeta?.filename) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // 5) Stream file
  const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    downloadStream.on("data", (c: Buffer) => chunks.push(c));
    downloadStream.on("error", reject);
    downloadStream.on("end", () => resolve());
  });
  const buffer = Buffer.concat(chunks);

  // 6) Extract text
  const text = await extractText(buffer, fileMeta.filename);

  // 7) Call AI parser
  let parsed: Partial<ProfileData>;
  try {
    parsed = await parseWithAI(text);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 }
    );
  }

  // 8) Save to Mongo
  await db.collection("profiles").updateOne(
    { _id: new ObjectId(profileId), userId: decoded.uid },
    { $set: { data: parsed, updatedAt: new Date() } }
  );

  // 9) Return parsed JSON
  return NextResponse.json(parsed);
}
