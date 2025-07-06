// src/app/api/job-ads/parse/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

interface ParseRequest {
  url?: string;
  rawText?: string;
}

interface ParsedJob {
  jobTitle: string;
  companyName: string;
  postedAt: string;
  description: string;
  requirements: string[];
  location?: string;
  [key: string]: unknown;
}

const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) throw new Error("Missing GITHUB_TOKEN");

const openai = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: TOKEN,
});

const SYSTEM_PROMPT = `
You are an expert recruiter assistant.  Given the full text of a job posting, extract and return EXACTLY the following JSON shape, with no extra keys or commentary:

{
  "jobTitle": string,
  "companyName": string,
  "postedAt": string,         // e.g. "2023-09-30"
  "location": string,         // if available
  "description": string,      // a concise paragraph
  "requirements": string[]    // bullet points
}
`;

export async function POST(request: Request) {
  let body: ParseRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const textSource =
    body.rawText ||
    (body.url
      ? `FETCHED CONTENT FROM: ${body.url}\n\n---\nPlease parse this HTML/text.`
      : "");
  if (!textSource) {
    return NextResponse.json(
      { error: "Must provide url or rawText" },
      { status: 400 }
    );
  }

  // call OpenAI
  const ai = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT.trim() },
      { role: "user", content: textSource },
    ],
  });

  const content = ai.choices[0].message.content ?? "";
  // extract the JSON block
  const match = content.match(/\{[\s\S]*\}$/);
  if (!match) {
    return NextResponse.json(
      { error: "AI did not return valid JSON", raw: content },
      { status: 502 }
    );
  }

  try {
    const parsed = JSON.parse(match[0]) as ParsedJob;
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse JSON", raw: match[0] },
      { status: 502 }
    );
  }
}
