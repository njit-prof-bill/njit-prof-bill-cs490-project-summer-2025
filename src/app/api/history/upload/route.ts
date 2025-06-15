import { NextRequest, NextResponse } from "next/server";
import * as mammoth from "mammoth";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { readFileSync } from "fs";
import { join } from "path";

//below this has no implicit type, despite being present, says error but works, so ignore error:
// ts ignore.
// @ts-ignore
import pdfParse from "pdf-parse/lib/pdf-parse.js";

// import pdfParse from 'pdf-parse';

const allowedTypes = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/pdf', // .pdf
  'text/plain', // .txt
  'text/markdown', // .md
  'text/x-markdown', // .md
];

// Function to determine the document path based on file type
function getDocumentPath(fileType: string, fileName: string): string {
  const isMarkdown = fileType === 'text/markdown' || 
                    fileType === 'text/x-markdown' || 
                    fileName.toLowerCase().endsWith('.md');

  switch (fileType) {
    case 'application/pdf':
      return 'documentTextPdf';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'documentTextDocx';
    case 'text/plain':
      // Check if it's actually a markdown file based on extension
      if (isMarkdown) {
        return 'documentTextFreeformText';
      }
      return 'documentTextTxt';
    case 'text/markdown':
    case 'text/x-markdown':
      return 'documentTextFreeformText';
    default:
      // Fallback for any unrecognized types
      return 'documentTextFreeformText';
  }
}

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
    const isMarkdown = file.type === 'text/markdown' || 
                      file.type === 'text/x-markdown' || 
                      file.name.toLowerCase().endsWith('.md');

    if (!file) {
      return NextResponse.json({ status: "error", message: "No file uploaded" }, { status: 400 });
    }

    // Enhanced file type validation
    const isValidType = allowedTypes.includes(file.type) || 
                       (file.type === 'text/plain' && isMarkdown);

    if (!isValidType) {
      return NextResponse.json({ 
        status: "error", 
        message: `Unsupported file type: ${file.type}. Supported types: PDF, DOCX, TXT, MD` 
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";
    let actualFileType = file.type;

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
      // If it's a markdown file but detected as text/plain, update the type
      if (isMarkdown && file.type === 'text/plain') {
        actualFileType = 'text/markdown';
      }
    }
    else if (file.type === 'text/markdown' || file.type === 'text/x-markdown') {
      extractedText = buffer.toString('utf-8');
    }
    else {
      return NextResponse.json({ 
        status: "error", 
        message: "Unsupported file type" 
      }, { status: 400 });
    }

    // Determine the document path based on file type
    const documentPath = getDocumentPath(actualFileType, file.name);
    
    // Store in Firestore at the appropriate document path
    const db = getFirestore();
    const docRef = db.doc(`users/${uid}/userDocuments/${documentPath}`);
    
    await docRef.set({
      text: extractedText,
      uploadedAt: new Date(),
      fileName: file.name,
      fileType: actualFileType,
      originalFileType: file.type, // Keep track of the original MIME type
      documentType: documentPath, // Store which document type this is
      textLength: extractedText.length,
    });

    return NextResponse.json({ 
      status: "success", 
      fileId: uid,
      documentPath: documentPath,
      fileName: file.name,
      fileType: actualFileType,
      textLength: extractedText.length,
      message: `File successfully processed and saved to ${documentPath}`
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      status: "error", 
      message: error instanceof Error ? error.message : "Server error" 
    }, { status: 500 });
  }
}