// src/app/api/job-ads/route.ts
import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { db } from "@/lib/mongodb";
import OpenAI from "openai";

// 1) Initialize Firebase Admin if needed
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_ADMIN_KEY!)
    ),
  });
}

// 2) OpenAI client using your GitHub token
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error("Missing GITHUB_TOKEN");
}
const openai = GITHUB_TOKEN
  ? new OpenAI({
      baseURL: "https://models.github.ai/inference",
      apiKey: GITHUB_TOKEN,
    })
  : null;

// 3) Record shape
interface JobAdRecord {
  userId: string;
  url?: string;
  rawText?: string;
  companyName: string;
  jobTitle: string;
  postedAt: Date;
  previewHtml: string;
  createdAt: Date;
  updatedAt: Date;
}

// 4) GET /api/job-ads → list this user’s job ads
export async function GET(request: Request) {
  const auth = request.headers.get("Authorization")?.split(" ")[1];
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decoded: admin.auth.DecodedIdToken;
  try {
    decoded = await admin.auth().verifyIdToken(auth);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const records = await db
    .collection<JobAdRecord>("jobAds")
    .find({ userId: decoded.uid })
    .sort({ createdAt: -1 })
    .toArray();

  const payload = records.map((r) => ({
    id: r._id.toString(),
    url: r.url,
    rawText: r.rawText,
    companyName: r.companyName,
    jobTitle: r.jobTitle,
    postedAt: r.postedAt.toISOString(),
    previewHtml: r.previewHtml,
  }));

  return NextResponse.json(payload);
}

// 5) POST /api/job-ads → extract & save a new job ad
export async function POST(request: Request) {
  if (!openai) {
    return NextResponse.json(
      { error: "Server misconfiguration: missing GITHUB_TOKEN" },
      { status: 500 }
    );
  }

  const auth = request.headers.get("Authorization")?.split(" ")[1];
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decoded: admin.auth.DecodedIdToken;
  try {
    decoded = await admin.auth().verifyIdToken(auth);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = (await request.json()) as { url?: string; rawText?: string };
  if (!body.url && !body.rawText) {
    return NextResponse.json(
      { error: "Provide a URL or rawText" },
      { status: 400 }
    );
  }

  // Build the AI prompt
  const source = body.url
    ? `Fetch and parse this job ad: ${body.url}`
    : `Parse this job ad text:\n\n${body.rawText}`;

  const systemPrompt = `
You are a job‐ad extractor. Return ONLY JSON with these fields:
{
  "companyName": string,
  "jobTitle": string,
  "postedAt": string,     // ISO date
  "previewHtml": string   // short HTML snippet
}
Respond with nothing else, no markdown fences.
`.trim();

  const ai = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: source },
    ],
  });

  // strip any markdown fences & trim
  let raw = ai.choices[0].message.content ?? "";
  raw = raw
    .trim()
    .replace(/^```(?:json)?\s*/, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: {
    companyName: string;
    jobTitle: string;
    postedAt: string;
    previewHtml: string;
  };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON from AI", raw },
      { status: 502 }
    );
  }

  // Save to MongoDB
  const now = new Date();
  const record: JobAdRecord = {
    userId: decoded.uid,
    url: body.url,
    rawText: body.rawText,
    companyName: parsed.companyName,
    jobTitle: parsed.jobTitle,
    postedAt: new Date(parsed.postedAt),
    previewHtml: parsed.previewHtml,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection<JobAdRecord>("jobAds").insertOne(record);

  return NextResponse.json({
    id: result.insertedId.toString(),
    url: body.url,
    rawText: body.rawText,
    companyName: parsed.companyName,
    jobTitle: parsed.jobTitle,
    postedAt: parsed.postedAt,
    previewHtml: parsed.previewHtml,
  });
}
