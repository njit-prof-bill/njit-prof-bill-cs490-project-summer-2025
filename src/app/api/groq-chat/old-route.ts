// app/api/groq-chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { auth} from '@/lib/firebase';





//------------------------------------------------------------

    // Adding a new field and string to the user document:
    
    export const addUserNameDatabase = async (userName: string) => {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
           FirstName: userName,
        });

    };









// Firebase configuration
const firebaseConfig = {
  // Your Firebase config object
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (only if not already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Initialize Groq SDK
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

interface GroqRequest {
  message: string;
  prompt?: string;
  userId?: string;
}

interface GroqResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { message, prompt, userId }: GroqRequest = await request.json();
    const user = auth.currentUser;
    // Validate required fields
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Default prompt if none provided
    const systemPrompt = prompt || "You are a helpful assistant. Please respond to the following message:";

    // Create messages array with system prompt and user message
    const messages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      {
        role: "user" as const,
        content: message,
      },
    ];

    // Call Groq API
    const groqResponse = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Extract the response content
    const aiResponse = groqResponse.choices[0]?.message?.content || "No response generated";

    // Prepare data for Firebase
    const conversationData = {
      userId: userId || null,
      userMessage: message,
      systemPrompt: systemPrompt,
      aiResponse: aiResponse,
      model: "llama-3.3-70b-versatile",
      timestamp: serverTimestamp(),
      groqId: groqResponse.id,
      usage: groqResponse.usage || null,
      createdAt: new Date().toISOString(),
    };


    // Auth User:
    // const user = auth.currentUser;

    // if (!user) {
    //       throw new Error('User not authenticated');
    //   }

      // const userRef = doc(db, 'users', user.uid);
      //   await updateDoc(userRef, {
      //      FirstName: userName,
      //   });

// const docRef = await addDoc(collection(db, 'users', user.uid, 'pdfTexts'), {

    // Store in Firebase - use user-specific path if userId is provided
    let docRef;
    if (userId) {
      // Store as a document at the specific path you want
      const docPath = `users/${userId}/userDocuments/categoryData`;

      docRef = await setDoc(doc(db, docPath), conversationData);
      //  docRef = await addDoc(collection(db, 'users', user.uid, 'pdfTexts'), conversationData);

      // Return the document path as the ID since setDoc doesn't return a docRef with ID
      return NextResponse.json({
        success: true,
        conversationId: docPath,
        response: aiResponse,
        groqResponse: groqResponse,
      });
    } else {
      // For anonymous users, use a general conversations collection
      docRef = await addDoc(collection(db, 'conversations'), conversationData);
      
      // Return success response for anonymous users
      return NextResponse.json({
        success: true,
        conversationId: docRef.id,
        response: aiResponse,
        groqResponse: groqResponse,
      });
    }

    // This return statement is now handled above in the if/else blocks
    // Return success response - this is only reached for anonymous users
    // (The authenticated user case returns earlier)

  } catch (error) {
    console.error('Error in /api/groq-chat:', error);
    
    // Return detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to process request', 
        details: errorMessage,
        success: false 
      }, 
      { status: 500 }
    );
  }
}