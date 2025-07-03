import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;


// Fallback extraction using Gemini
async function extractTitleCompanyWithGemini(jobText: string): Promise<{ title: string; company: string }> {
  const prompt = `Extract the job title and company name from this job posting. Return only JSON like: {"title": "...", "company": "..."}

Job Posting:
${jobText}`;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      title: parsed.title || "Unknown Title",
      company: parsed.company || "Unknown Company",
    };
  } catch (err) {
    console.error("Failed to parse Gemini response:", raw);
    return { title: "Unknown Title", company: "Unknown Company" };
  }
}

// POST: Save job ad
export async function POST(req: NextRequest) {
  try {
    const { userId, jobText } = await req.json();
    if (!userId || !jobText) {
      return NextResponse.json({ error: "Missing userId or jobText" }, { status: 400 });
    }

    let title = jobText.match(/(?<=Title: ).*/i)?.[0];
    let company = jobText.match(/(?<=Company: ).*/i)?.[0];

    if (!title || !company) {
      console.log("Using Gemini to extract title and company...");
      const aiExtracted = await extractTitleCompanyWithGemini(jobText);
      console.log("Gemini result:", aiExtracted);
      title ||= aiExtracted.title;
      company ||= aiExtracted.company;
    }

    const jobAd = {
      userId,
      jobText,
      title,
      company,
      createdAt: Date.now(),
    };

    const docRef = await db
      .collection("users")
      .doc(userId)
      .collection("jobAds")
      .add(jobAd);

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("POST /api/jobAd error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET: Return all job ads
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ jobAds: [] });

    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("jobAds")
      .orderBy("createdAt", "desc")
      .get();

    const jobAds = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ jobAds });
  } catch (err) {
    console.error("GET /api/jobAd error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

