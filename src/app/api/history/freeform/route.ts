import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text } = body;
  const user = getAuth().currentUser;

  if (!user || !text) {
    return NextResponse.json({ status: "error" }, { status: 400 });
  }

  await addDoc(collection(db, "users", user.uid, "history_freeform"), {
    text: text.trim(),
    source: "freeform",
    timestamp: serverTimestamp(),
  });

  return NextResponse.json({ status: "processing" });
}