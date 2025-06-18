import { NextRequest, NextResponse } from 'next/server';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

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
    const resume = await req.json();
    if (!resume.userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    let resumeId = resume.resumeId;
    if (!resumeId) {
      resumeId = uuidv4();
    }
    await db.collection("resumes").doc(resumeId).set({
      ...resume,
      resumeId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return NextResponse.json({ success: true, resumeId });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to save resume" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const resumeId = searchParams.get("resumeId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    if (resumeId) {
      // Fetch a specific resume
      const doc = await db.collection("resumes").doc(resumeId).get();
      if (!doc.exists) {
        return NextResponse.json({ resume: null });
      }
      return NextResponse.json({ resume: doc.data() });
    } else {
      // List all resumes for this user
      const snapshot = await db.collection("resumes").where("userId", "==", userId).get();
      const resumes = snapshot.docs.map(doc => doc.data());
      return NextResponse.json({ resumes });
    }
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch resume(s)" }, { status: 500 });
  }
}

