import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { jobText } = await request.json();

    if (!jobText || typeof jobText !== "string") {
      return NextResponse.json(
        { error: "Invalid job text provided" },
        { status: 400 }
      );
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a job description analyzer. Extract the following information from job descriptions and return ONLY a valid JSON object with these exact keys:
          - jobTitle: The job title/position name
          - companyName: The company name
          - jobDescription: The full job description text (cleaned up)
          - timestamp: Current ISO timestamp

         - jobDescription should remain mostly the original size of the full job description text after cleanup

          If any information is not found, use "Not specified" for that field. Always return valid JSON only.`
        },
        {
          role: "user",
          content: `Please extract the job details from this job description:\n\n${jobText}`
        }
      ],
      model: "llama3-70b-8192",
      temperature: 0.1,
      max_tokens: 2048,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error("No response from Groq API");
    }

    // Parse the JSON response from Groq
    let extractedData;
    try {
      extractedData = JSON.parse(responseContent);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response from AI");
      }
    }

    // Ensure all required fields are present
    const result = {
      jobTitle: extractedData.jobTitle || "Not specified",
      companyName: extractedData.companyName || "Not specified",
      jobDescription: extractedData.jobDescription || jobText,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in groq-jobDescExtract:", error);
    return NextResponse.json(
      { error: "Failed to process job description" },
      { status: 500 }
    );
  }
}