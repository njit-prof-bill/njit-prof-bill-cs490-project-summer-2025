// src/app/api/submitBio/route.ts
import { NextResponse } from "next/server";
import { adminDB } from "@/lib/fireBaseAdmin";

export async function POST(req: Request) {
  const { uid, text } = await req.json();

  if (!uid || !text) {
    return NextResponse.json({ message: "Missing uid or text" }, { status: 400 });
  }

  // Generate fileName as first 40 characters of text
  const fileName = text.substring(0, 40);

  try {
    await adminDB
      .collection("users")
      .doc(uid)
      .collection("userDocuments")
      .doc("documentTextFreeformText")
      .set({ 
        text: text,
        uploadedAt: new Date(),
        fileName: fileName,
        fileType: 'free-form-text',
      });

    return NextResponse.json({ message: "Biography saved successfully!" });
  } catch (error) {
    console.error("Error saving bio:", error);
    return NextResponse.json({ message: "Failed to save bio." }, { status: 500 });
  }
}