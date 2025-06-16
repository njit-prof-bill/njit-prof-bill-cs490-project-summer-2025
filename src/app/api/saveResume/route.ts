import { NextRequest, NextResponse } from 'next/server';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export async function POST(req: NextRequest) {
  try {
    console.log("🟡 Saving resume...");
    const resume = await req.json();
    console.log("🟢 Resume payload:", resume);

    const docRef = await db.collection("resumes").add({
      ...resume,
      createdAt: new Date().toISOString(),
    });

    console.log("✅ Saved to Firestore with ID:", docRef.id);
    return NextResponse.json({ success: true, id: docRef.id });

  } catch (error: any) {
    console.error("❌ Error saving resume:", error);
    return NextResponse.json({ error: "Failed to save resume" }, { status: 500 });
  }
}

