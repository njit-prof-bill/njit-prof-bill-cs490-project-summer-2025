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

  // Prevent reparsing already-parsed JSON
  try {
    const maybeJson = JSON.parse(text);
    if (typeof maybeJson === 'object' && maybeJson !== null) {
      return NextResponse.json({ error: "Input appears to be already-parsed JSON. Please provide raw resume text." }, { status: 400 });
    }
  } catch (e) {
    // Not JSON, continue as normal
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
      "gpa": string // GPA should be extracted if present, in any of the following formats: "3.5", "3.50/4.00", "GPA: 3.7", etc. GPA may appear as a number, a fraction, or with the label 'GPA'.
    }
  ]
}

If a career objective or summary statement is present, extract it as the value for "objective". Only extract what's available. If something is missing, return it as an empty string or empty array.

For GPA extraction:
- Look for GPA in both the education section and anywhere else in the resume text.
- GPA may appear in formats such as: 3.5, 3.50/4.00, GPA: 3.7, GPA 3.8, etc.
- If multiple GPAs are found, include the most relevant or recent one for each education entry.

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

    // GPA regex fallback: look for GPA patterns in the text if missing in parsed JSON
    function extractGPA(text: string): string[] {
      // Only match if 'GPA' label is present
      const regex = /GPA[:\s]*([0-3](?:\.\d{1,2})?|4(?:\.0{1,2})?|5(?:\.0{1,2})?)(?:\s*\/\s*([45](?:\.0{1,2})?))?/gi;
      const matches = [];
      let match;
      while ((match = regex.exec(text)) !== null) {
        let value = '';
        if (match[2]) {
          value = `${match[1]}/${match[2]}`;
        } else {
          value = match[1];
        }
        // Validate GPA: must be between 0 and 4.0 or 5.0 (or valid fraction)
        const num = parseFloat(match[1]);
        const denom = match[2] ? parseFloat(match[2]) : null;
        if (
          (denom && num >= 0 && num <= denom && (denom === 4 || denom === 4.0 || denom === 5 || denom === 5.0)) ||
          (!denom && num >= 0 && num <= 4.0)
        ) {
          matches.push(value);
        }
      }
      return matches;
    }

    // Fill in missing GPA for each education entry if not present
    if (parsed.education && Array.isArray(parsed.education)) {
      const gpas = extractGPA(text);
      parsed.education = parsed.education.map((edu: any, idx: number) => {
        if (!edu.gpa || edu.gpa === "") {
          // Assign a found GPA if available and valid
          edu.gpa = gpas[idx] || gpas[0] || "";
        }
        // If GPA is not valid, set to empty string
        if (edu.gpa && !/^([0-3](\.\d{1,2})?|4(\.0{1,2})?|5(\.0{1,2})?|[0-4](\.\d{1,2})?\/[45](\.0{1,2})?)$/.test(edu.gpa)) {
          edu.gpa = "";
        }
        return edu;
      });
    }

    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to parse Gemini output as JSON", details: e.message },
      { status: 500 }
    );
  }
}
