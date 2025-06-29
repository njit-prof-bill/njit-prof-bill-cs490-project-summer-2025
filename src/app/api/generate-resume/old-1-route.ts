// app/api/generate-resume/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface JobDescription {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  extractedAt: string;
  createdAt: any;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { jobData, userData, userId }: {
      jobData: JobDescription;
      userData: any;
      userId: string;
    } = await request.json();

    // Validate required data
    if (!jobData || !userData || !userId) {
      return NextResponse.json(
        { error: 'Missing required data: jobData, userData, or userId' },
        { status: 400 }
      );
    }

    // Prepare the resume generation prompt for Groq
    const prompt = `You are an expert resume writer and career counselor. Create a professional, tailored resume that maximally aligns with the job requirements.

JOB DESCRIPTION TO MATCH:
Title: ${jobData.jobTitle}
Company: ${jobData.companyName}
Full Description: ${jobData.jobDescription}

USER PROFILE DATA:
${JSON.stringify(userData, null, 2)}

INSTRUCTIONS:
1. Create a complete, professional resume in a clean, ATS-friendly format
2. Tailor the resume specifically to match the job requirements and keywords from the job description
3. Highlight relevant skills, experience, and achievements that align with the position
4. Use action verbs and quantify achievements where possible
5. Ensure the resume is compelling and positions the candidate as an ideal fit
6. Include appropriate sections: Contact Info, Professional Summary, Experience, Skills, Education, etc.
7. Keep the resume concise but comprehensive (1-2 pages worth of content)
8. Use the user's actual data but present it in the most favorable light for this specific job

Format the resume in clean, professional text format with clear section headers and bullet points.`;

    // Call Groq API to generate the resume
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama3-70b-8192', // Using the same model as your reference
      temperature: 0.7,
      max_tokens: 1000,
    });

    const generatedResume = completion.choices[0]?.message?.content;

    if (!generatedResume) {
      return NextResponse.json(
        { error: 'No resume generated from Groq' },
        { status: 500 }
      );
    }

    // Prepare resume data to return (and potentially store client-side)
    const resumeData = {
      resumeContent: generatedResume,
      jobTitle: jobData.jobTitle,
      companyName: jobData.companyName,
      jobId: jobData.id,
      generatedAt: new Date().toISOString(),
      userId: userId,
      metadata: {
        model: 'llama3-70b-8192',
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      }
    };

    // Return success response with resume data
    return NextResponse.json({
      success: true,
      data: resumeData,
      message: 'Resume generated successfully',
    });

  } catch (error) {
    console.error('Resume Generation Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate resume',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}