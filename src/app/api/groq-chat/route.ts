// app/api/groq-chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

interface GroqRequest {
  message: string;
  prompt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, prompt }: GroqRequest = await request.json();

    // Validate input
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Set up the conversation
    const systemPrompt = prompt || "You are a helpful resume building assistant. You will assist in receiving a resume, and extracting five categories of data which are: 1: Contact Info, 2: Career Objectives, 3: Skills, 4: Job History, 5: Education. Please return it in json format with each section named strictly named on these five titles.";
    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: message }
    ];

    // Get AI response
    const groqResponse = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = groqResponse.choices[0]?.message?.content || "No response generated";

    // Return just the AI response - let client handle storage
    return NextResponse.json({
      success: true,
      response: aiResponse,
      metadata: {
        groqId: groqResponse.id,
        usage: groqResponse.usage,
        model: "llama-3.3-70b-versatile"
      }
    });

  } catch (error) {
    console.error('Groq API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get AI response',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}