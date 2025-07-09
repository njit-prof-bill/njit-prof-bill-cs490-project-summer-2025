import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;


// Fallback extraction using Gemini
async function extractJobAdFieldsWithGemini(jobText: string): Promise<{ title: string; company: string; location: string; pay: string; overview: string; expectations: string }> {
  const prompt = `Extract the following fields from this job posting. Return only JSON like: {"title": "...", "company": "...", "location": "...", "pay": "...", "overview": "...", "expectations": "..."}

Job Posting:\n${jobText}`;

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
      location: parsed.location || "Unknown Location",
      pay: parsed.pay || "Unknown Pay",
      overview: parsed.overview || "",
      expectations: parsed.expectations || ""
    };
  } catch (err) {
    console.error("Failed to parse Gemini response:", raw);
    return { title: "Unknown Title", company: "Unknown Company", location: "Unknown Location", pay: "Unknown Pay", overview: "", expectations: "" };
  }
}

// POST: Save job ad
export async function POST(req: NextRequest) {
  try {
    const { userId, jobText } = await req.json();
    if (!userId || !jobText) {
      return NextResponse.json({ error: "Missing userId or jobText" }, { status: 400 });
    }

    // Try to extract with regex for title and company, but always use Gemini for all fields
    let title = jobText.match(/(?<=Title: ).*/i)?.[0];
    let company = jobText.match(/(?<=Company: ).*/i)?.[0];

    // Always use Gemini for all fields
    let aiExtracted = await extractJobAdFieldsWithGemini(jobText);
    // Post-process pay/location if Gemini combined them
    let location = aiExtracted.location;
    let pay = aiExtracted.pay;
    // If pay contains a colon and a dollar sign, split
    if (pay && pay.includes(":") && pay.match(/\$/)) {
      const idx = pay.lastIndexOf(":");
      if (idx !== -1) {
        // If location is empty or matches the left part, update both
        const left = pay.slice(0, idx).trim();
        const right = pay.slice(idx + 1).trim();
        if (!location || location === pay) location = left;
        pay = right;
      }
    }
    title ||= aiExtracted.title;
    company ||= aiExtracted.company;
    const overview = aiExtracted.overview;
    const expectations = aiExtracted.expectations;

    const jobAd = {
      userId,
      jobText,
      title,
      company,
      location,
      pay,
      overview,
      expectations,
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

// DELETE: Delete a job ad by id
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const id = searchParams.get("id");
    if (!userId || !id) {
      return NextResponse.json({ error: "Missing userId or id" }, { status: 400 });
    }
    await db
      .collection("users")
      .doc(userId)
      .collection("jobAds")
      .doc(id)
      .delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/jobAd error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}