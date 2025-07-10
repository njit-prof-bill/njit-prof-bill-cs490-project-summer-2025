// src/lib/parser.ts
import mammoth            from "mammoth";
import OpenAI             from "openai";
import type { Readable }  from "stream";
import type { ProfileData } from "@/context/profileContext";

const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  throw new Error("Missing GITHUB_TOKEN");
}

const client = new OpenAI({ apiKey: TOKEN });
const MODEL  = "openai/gpt-4o-mini";

/** 
 * Given a Buffer and its MIME type, extract text (PDF/Word/plain),
 * call GPT-4o-mini to parse into JSON, and return a Partial<ProfileData>.
 */
export async function parseBufferToProfileData(
  buffer: Buffer,
  contentType: string
): Promise<Partial<ProfileData>> {
  // 1) extract raw text
  let text: string;
  if (contentType === "application/pdf") {
    // dynamic import after stubbing in your route
    const { default: pdfParse } = await import("pdf-parse");
    text = (await pdfParse(buffer)).text;
  } else if (
    contentType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    text = (await mammoth.extractRawText({ buffer })).value;
  } else {
    text = buffer.toString("utf-8");
  }

  // 2) craft a JSON-only system prompt
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

  // 3) call the model
  const res = await client.chat.completions.create({
    model: MODEL,
    temperature: 0,
    top_p: 1,
    max_tokens: 2000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: text },
    ],
  });

  const raw = res.choices[0].message.content ?? "";
  const match = raw.match(/\{[\s\S]*\}$/);
  if (!match) {
    throw new Error("No JSON object found in AI response");
  }

  // 4) parse it
  return JSON.parse(match[0]) as Partial<ProfileData>;
}
