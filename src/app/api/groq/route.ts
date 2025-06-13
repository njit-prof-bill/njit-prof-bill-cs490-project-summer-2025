// /app/api/groq/route.ts (for App Router)
// OR /pages/api/groq.ts (for Pages Router)

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Server-side only, no NEXT_PUBLIC_ prefix
});

export async function POST(request: NextRequest) {
  try {
    const { text, prompt } = await request.json();

    if (!text || !prompt) {
      return NextResponse.json(
        { error: 'Text and prompt are required' },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `${prompt}\n\n${text}`
        }
      ],
      model: "llama3-70b-8192",
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json(
        { error: 'No response from Groq' },
        { status: 500 }
      );
    }

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Groq API error:', error);
    return NextResponse.json(
      { error: 'Failed to process with Groq' },
      { status: 500 }
    );
  }
}