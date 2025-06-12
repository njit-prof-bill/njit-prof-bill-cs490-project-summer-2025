import { NextRequest, NextResponse } from "next/server";
import * as mammoth from "mammoth";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { readFileSync } from "fs";
import { join } from "path";


if (!getApps().length) {
  const serviceAccountPath = join(process.cwd(), "src/serviceAccountKey.json");
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

  initializeApp({
    credential: cert(serviceAccount),
  });
}

// Firebase Admin setup
if (!getApps().length) {
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY!;

  console.log("🔍 RAW ENV STRING START");
  console.log(rawKey);
  console.log("🔍 RAW ENV STRING END");

  // This is for removeing wrapping quotes and unescape inner quotes and newlines
  const jsonSafe = rawKey
    .replace(/^"(.*)"$/, '$1')
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n');

  const serviceAccount = JSON.parse(jsonSafe);

  initializeApp({
    credential: cert(serviceAccount),
  });
}

export async function POST(req: NextRequest) {
  try {
    // Verify Firebase Auth token
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ status: "error", message: "Missing auth token" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get uploaded file
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ status: "error", message: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text from DOCX
    const result = await mammoth.extractRawText({ buffer });
    const extractedText = result.value;

    // Save to Firestore
    const db = getFirestore();
    await db.doc(`users/${uid}/userDocuments/documentText`).set({
      text: extractedText,
      uploadedAt: new Date(),
    });

    return NextResponse.json({ status: "success", fileId: uid });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ status: "error", message: "Server error" }, { status: 500 });
  }
}
