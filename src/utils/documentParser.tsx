import OpenAI from "openai";
import { ProfileData } from "@/context/profileContext";

// 1. Read & validate the GitHub token
const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
  throw new Error("Missing GITHUB_TOKEN environment variable");
}

// 2. Initialize the OpenAI client with your GitHub token
const openai = new OpenAI({ apiKey: githubToken });

async function callParser(prompt: string): Promise<Partial<ProfileData>> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert resume parser. Extract the following fields into valid JSON matching the ProfileData interface: " +
          "contactInfo (email, phone), careerObjective, skills (array of strings), " +
          "jobHistory (array of { company, title, description, startDate, endDate, accomplishments }), " +
          "education (array of { school, degree, dates, gpa }).",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = res.choices[0].message.content;
  if (!content) {
    throw new Error("LLM returned no content");
  }

  try {
    return JSON.parse(content) as Partial<ProfileData>;
  } catch (err) {
    throw new Error("Failed to parse JSON from GPT response: " + err);
  }
}

export async function parseDocument(file: File): Promise<Partial<ProfileData>> {
  const text = await file.text();
  return callParser(text);
}

export async function parseBiographyText(
  biography: string
): Promise<Partial<ProfileData>> {
  const prompt =
    "Here is a career biography. Extract the same ProfileData fields (contactInfo, careerObjective, skills, jobHistory, education) into JSON:\n\n" +
    biography;
  return callParser(prompt);
}
