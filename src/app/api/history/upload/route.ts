<<<<<<< SCRUM-13-upload-a-docx-file-and-send-to-database-component-include-api-code
import { NextRequest, NextResponse } from "next/server";
import * as mammoth from "mammoth";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { readFileSync } from "fs";
import { join } from "path";
import pdfParse from "pdf-parse/lib/pdf-parse.js";


const allowedTypes = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/pdf', // .pdf
  'text/plain', // .txt
  'text/x-markdown', // .md
];

// Initialize Firebase Admin SDK
if (!getApps().length) {
  const serviceAccountPath = join(process.cwd(), "src/serviceAccountKey.json");
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
  
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export async function POST(req: NextRequest) {
  try {
    // 🔐 Verify Firebase Auth Token
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
    const isMarkdown = file.type === 'text/markdown' || file.type === 'text/x-markdown';
    // console.log("Received file:", file.name, file.type);

    if (!file) {
      return NextResponse.json({ status: "error", message: "No file uploaded" }, { status: 400 });
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ status: "error", message: "Unsupported file type" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    // Parse text based on type
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    }
    else if (file.type === "application/pdf") {
      const result = await pdfParse(buffer);
      extractedText = result.text;
    }
    else if (file.type === 'text/plain' || isMarkdown) {
      extractedText = buffer.toString('utf-8');
    }
    else {
      return NextResponse.json({ status: "error", message: "Unsupported file type" }, { status: 400 });
    }


    // Store in Firestore
    const db = getFirestore();
    await db.doc(`users/${uid}/userDocuments/documentText`).set({
      text: extractedText,
      uploadedAt: new Date(),
      fileName: file.name,
      fileType: file.type,
    });

    return NextResponse.json({ status: "success", fileId: uid });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ status: "error", message: "Server error" }, { status: 500 });
  }
}
=======
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
>>>>>>> Development-Branch-Main
