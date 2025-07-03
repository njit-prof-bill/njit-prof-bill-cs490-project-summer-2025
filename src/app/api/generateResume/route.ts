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
You are an AI resume generator. Your task is to rewrite and enhance the resume below based on the given job description and the user's bio.

You must return ONLY valid JSON in the following format:
{
  "emails": [...],
  "phones": [...],
  "objective": "...",
  "skills": [...],
  "education": [...],
  "jobHistory": [...],
  "bio": "..."
}

Specific requirements:
- Tailor the content to better match the job description.
- Improve grammar and formatting.
- If any job in "jobHistory" is missing a "Role Summary", generate a professional Role Summary using the company name and job title.
- The "objective" field must be customized based on the job description.
- Keep the JSON structure exactly as shown above.
- Do NOT include markdown, backticks, explanations, or formatting outside the JSON.

Here is the user's bio:
${bio}

Here is their original resume:
${JSON.stringify(editableResume, null, 2)}

Here is the job description:
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
      console.error("Failed to parse Gemini response:", raw);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }
  } catch (err) {
    console.error("POST /api/generateResume error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}