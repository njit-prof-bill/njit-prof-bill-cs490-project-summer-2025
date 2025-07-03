
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-04-17",
});

export async function POST() {
  try {
    const inputText = `
    I am uploading a resume. Please extract the following:
    - Full name
    - Contact information (email, phone if available)
    - Skills (as a list with skill level if stated)
    - Job history (company, role, dates)
    - Education history (school, degree, dates)
    - Career objective or summary if written
        Resume:
    Yuxing Deng
    Email: yd293@njit.edu
    Objective: To become a skilled software engineer...
    Skills: Python, JavaScript, React
    Work: Intern at Google, 2023
    Education: NJIT, B.S. Computer Science, 2025
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: inputText }] }],
    });

    const response = await result.response;
    const text = response.text();

    console.log("AI Parsed Resume:", text);

    return NextResponse.json({ status: "ok", parsed: text });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ status: "error", message: "Gemini call failed." }, { status: 500 });
  }
}


