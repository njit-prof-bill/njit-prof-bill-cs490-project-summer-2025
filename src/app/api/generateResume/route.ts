import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
  try {
    const { jobText, bio, editableResume } = await req.json();

    if (!jobText || !bio || !editableResume) {
      return NextResponse.json({ error: "Missing input data" }, { status: 400 });
    }

    const prompt = `
You are an AI resume writer. Your task is to rewrite the following resume to better match the job description and highlight relevant experience from the bio.

Please return a JSON object in the following format:
{
  "emails": [...],
  "phones": [...],
  "objective": "...",
  "skills": [...],
  "education": [...],
  "jobHistory": [...],
  "bio": "..."
}

Requirements:
- Match resume content to job description.
- Enhance and clean up grammar.
- DO NOT add Markdown, backticks, or explanations.
- Return ONLY valid JSON.

Bio:
${bio}

Original Resume JSON:
${JSON.stringify(editableResume, null, 2)}

Job Description:
${jobText}
`;

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await geminiRes.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const cleaned = raw.replace(/```json|```/g, "").trim();

    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({ resume: parsed });
    } catch (err) {
      console.error("❌ Failed to parse Gemini response:", raw);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }
  } catch (err) {
    console.error("❌ POST /api/generateResume error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

