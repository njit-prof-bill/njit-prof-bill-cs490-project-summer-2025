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

    // Determine if this is a file upload or a bio upload
    let type = "file";
    let label = "";
    let fileType = "";
    if (resume.fileName) {
      // File upload
      label = resume.fileName;
      const extMatch = resume.fileName.match(/\.([a-zA-Z0-9]+)$/);
      fileType = extMatch ? extMatch[1].toLowerCase() : "unknown";
    } else if (resume.bio && typeof resume.bio === "string" && resume.bio.trim().length > 0) {
      // Bio upload
      type = "bio";
      // Use first 6 words of bio as label
      label = resume.bio.trim().split(/\s+/).slice(0, 6).join(" ") + (resume.bio.trim().split(/\s+/).length > 6 ? "..." : "");
      fileType = "bio";
    } else {
      // Fallback
      label = resume.displayName || "Resume";
      fileType = "unknown";
    }

    const timestamp = new Date().toISOString();

    await db.collection("resumes").doc(resumeId).set({
      ...resume,
      resumeId,
      updatedAt: timestamp,
      type,
      label,
      fileType,
      timestamp,
    }, { merge: true });

    // Fetch updated list of resumes for this user
    const snapshot = await db.collection("resumes").where("userId", "==", resume.userId).get();
    const resumes = snapshot.docs.map(doc => doc.data());
    return NextResponse.json({ success: true, resumeId, resumes });
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const resumeId = searchParams.get("resumeId");
    if (!userId || !resumeId) {
      return NextResponse.json({ error: "Missing userId or resumeId" }, { status: 400 });
    }
    // Check if the resume exists and belongs to the user
    const doc = await db.collection("resumes").doc(resumeId).get();
    const docData = doc.data();
    if (!doc.exists || !docData || docData.userId !== userId) {
      return NextResponse.json({ error: "Resume not found or unauthorized" }, { status: 404 });
    }
    await db.collection("resumes").doc(resumeId).delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}