import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { join } from "path";
import pdfParse from "pdf-parse";

// ✅ Firebase Admin init (guarded)
try {
  if (!getApps().length) {
    const serviceAccountPath = join(process.cwd(), "src/serviceAccountKey.json");
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
    initializeApp({ credential: cert(serviceAccount) });
    console.log("✅ Firebase Admin initialized.");
  }
} catch (initErr) {
  console.error("🔥 Firebase init failed:", initErr);
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ status: "error", message: "Missing auth token" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ status: "error", message: "Invalid or missing PDF file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let parsed;
    try {
      parsed = await pdfParse(buffer);
    } catch (parseErr) {
      console.error("❌ PDF parse error:", parseErr);
      return NextResponse.json({ status: "error", message: "PDF parsing failed" }, { status: 500 });
    }

    const db = getFirestore();
    await db.doc(`users/${uid}/userDocuments/pdfText`).set({
      text: parsed.text,
      uploadedAt: new Date(),
    });

    console.log(`✅ PDF uploaded and saved for user: ${uid}`);
    return NextResponse.json({ status: "success", message: "PDF uploaded and saved!" });
  } catch (err) {
    console.error("❌ Upload handler error:", err);
    return NextResponse.json({ status: "error", message: "Server error." }, { status: 500 });
  }
}
