import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in environment");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "Missing resume text" }, { status: 400 });
  }

  const prompt = `
You are a resume parsing assistant. Extract the following structured data in JSON format from the resume text:

{
  "emails": string[],
  "phones": string[],
  "objective": string, // The career objective or summary statement, if present
  "skills": string[],
  "jobHistory": [
    {
      "company": string,
      "jobTitle": string,
      "summary": string,
      "startDate": string,
      "endDate": string,
      "responsibilities": string[]
    }
  ],
  "education": [
    {
      "school": string,
      "degree": string,
      "certificateOrDiploma": string,
      "datesAttended": string,
      "gpa": string
    }
  ]
}

If a career objective or summary statement is present, extract it as the value for "objective". Only extract what's available. If something is missing, return it as an empty string or empty array.
Return valid JSON only (no explanation or markdown).

Resume text:
${text}

Parsed JSON:
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const output = result.response.text().trim();

    const jsonStart = output.indexOf("{");
    const jsonEnd = output.lastIndexOf("}") + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("No JSON object found in output");
    }

    const jsonString = output.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(jsonString);

    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to parse Gemini output as JSON", details: e.message },
      { status: 500 }
    );
  }
}
