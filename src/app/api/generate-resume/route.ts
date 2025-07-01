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
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const openai = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: GITHUB_TOKEN,
});

export async function POST(request: Request) {
  // — Authenticate —
  const authHeader = request.headers.get("Authorization")?.split(" ")[1];
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let decoded: admin.auth.DecodedIdToken;
  try {
    decoded = await admin.auth().verifyIdToken(authHeader);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // — Parse body —
  const { profileId, jobAdId } = (await request.json()) as {
    profileId: string;
    jobAdId: string;
  };
  if (!profileId || !jobAdId) {
    return NextResponse.json(
      { error: "Must supply profileId and jobAdId" },
      { status: 400 }
    );
  }

  // — Load profile document —
  const { ObjectId } = await import("mongodb");
  const profileDoc = await db
    .collection("profiles")
    .findOne({ _id: new ObjectId(profileId), userId: decoded.uid });
  if (!profileDoc) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // — Load job ad document —
  const jobAdDoc = await db
    .collection("jobAds")
    .findOne({ _id: new ObjectId(jobAdId), userId: decoded.uid });
  if (!jobAdDoc) {
    return NextResponse.json({ error: "Job ad not found" }, { status: 404 });
  }

  // — Build prompt —
  const prompt = `
Generate an unformatted resume tailored to this job posting using the following profile JSON and the job ad verbatim.

Profile JSON:
${JSON.stringify(profileDoc.data, null, 2)}

Job Ad (verbatim):
${jobAdDoc.rawText ?? jobAdDoc.previewHtml}

Output only the resume text, no extra commentary.
  `.trim();

  // — Call OpenAI —
  const ai = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }],
  });
  const resume = ai.choices[0].message.content?.trim() ?? "";

  return NextResponse.json({ resume });
}
