// app/api/groq-chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });



import { promises as fs } from 'fs';
import path from 'path';




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
    const systemPrompt = "You are a helpful resume building assistant.\nYou will assist in receiving user resume text, and filling in the json\nobject format below with the user's extracted data. Please provide only the JSON object, with no explanations, code fences, or extra text. Return only the raw JSON data. \nStriclty use the format provided in this prompt.\nDo not rearrange any of the json object.\nDo not include any extra comments, strictly return the json file. The fullname of a person\nis usually found in the first couple of lines.\nDo not forget to include the full name of a person in the output. Sometimes the name is ambiguous but include anyway.Respond with only the JSON data, no code fences, no explanations, just the raw JSON object.\n\nUse This Example json object, and populate a similar json with the data from the input:\n\n{\n  \"fullName\": \"\",\n  \"contact\": {\n    \"email\": \"\",\n    \"phone\": \"\",\n    \"location\": \"\"\n  },\n  \"summary\": \"\": [\n    {\n      \"jobTitle\": \"\",\n      \"company\": \"\",\n      \"startDate\": \"\",\n      \"endDate\": \"\",\n      \"responsibilities\": [\n        \"\",\n        \"\",\n        \"\"\n      ]\n    },\n    {\n      \"jobTitle\": \"\",\n      \"company\": \"\",\n      \"startDate\": \"\",\n      \"endDate\": \"\",\n      \"responsibilities\": [\n        \"\",\n        \"\",\n        \"\"\n      ]\n    }\n  ],\n  \"education\": [\n    {\n      \"degree\": \"\",\n      \"institution\": \"\",\n      \"startDate\": \"\",\n      \"endDate\": \"\",\n      \"gpa\": \"\"\n    }\n  ],\n  \"skills\": [\n    \"\",\n    \"\",\n    \"\",\n    \"\",\n    \"\",\n    \"\"\n  ]\n}\n\nImportant: Do not call work items as 'achievements', call it 'responsibilities'. Follow the above example strictly. Do not add any extra characters or text around the json Do not add ```json``` or anything like that.";
   
    // const systemPrompt = prompt || "You are a helpful resume building assistant.\nYou will assist in receiving user resume text, and filling in the json\nobject format below with the user's extracted data. \nStriclty use the format provided in this prompt.\nDo not rearrange any of the json object.\nDo not include any extra comments, strictly return the json file. The fullname of a person\nis usually found in the first couple of lines.\nDo not forget to include the full name of a person in the output.\n\nUse This Example json object, and populate a similar json with the data from the input:\n\n```json\n{\n  \"fullName\": \"\",\n  \"contact\": {\n    \"email\": \"\",\n    \"phone\": \"\",\n    \"location\": \"\"\n  },\n  \"summary\": \"\": [\n    {\n      \"jobTitle\": \"\",\n      \"company\": \"\",\n      \"startDate\": \"\",\n      \"endDate\": \"\",\n      \"responsibilities\": [\n        \"\",\n        \"\",\n        \"\"\n      ]\n    },\n    {\n      \"jobTitle\": \"\",\n      \"company\": \"\",\n      \"startDate\": \"\",\n      \"endDate\": \"\",\n      \"responsibilities\": [\n        \"\",\n        \"\",\n        \"\"\n      ]\n    }\n  ],\n  \"education\": [\n    {\n      \"degree\": \"\",\n      \"institution\": \"\",\n      \"startDate\": \"\",\n      \"endDate\": \"\",\n      \"gpa\": \"\"\n    }\n  ],\n  \"skills\": [\n    \"\",\n    \"\",\n    \"\",\n    \"\",\n    \"\",\n    \"\"\n  ]\n}\n```\n\nImportant: Do not call work items as 'achievements', call it 'responsibilities'. Follow the above example strictly.";
    // const systemPrompt = prompt;


    // const filePath = path.join(process.cwd(), 'public', 'prompts', 'extract-data-prompt.txt');
    // const fileContents = await fs.readFile(filePath, 'utf-8'); // read file as string
    // const systemPrompt = fileContents;




    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: message }
    ];

    // Get AI response
    const groqResponse = await groq.chat.completions.create({
      messages,
      // model: "llama-3.3-70b-versatile",
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
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