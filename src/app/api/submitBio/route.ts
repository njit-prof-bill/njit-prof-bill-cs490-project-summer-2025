// src/app/api/submitBio/route.ts
import { NextResponse } from "next/server";
import { adminDB } from "@/lib/fireBaseAdmin";

export async function POST(req: Request) {
  const { uid, text } = await req.json();

  if (!uid || !text) {
    return NextResponse.json({ message: "Missing uid or text" }, { status: 400 });
  }

  try {
    await adminDB
      .collection("users")
      .doc(uid)
      .collection("userDocuments")
      .doc("documentTextFreeformText")
      .set({ text: text });

    return NextResponse.json({ message: "Biography saved successfully!" });
  } catch (error) {
    console.error("Error saving bio:", error);
    return NextResponse.json({ message: "Failed to save bio." }, { status: 500 });
  }
}
