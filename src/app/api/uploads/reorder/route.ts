// src/app/api/uploads/reorder/route.ts
import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { db } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_ADMIN_KEY!)
    ),
  });
}

export async function POST(request: Request) {
  // authenticate
  const auth = request.headers.get("Authorization") || "";
  const idToken = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!idToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let decoded: admin.auth.DecodedIdToken;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const uid = decoded.uid;

  // parse body
  const { orderedIds } = (await request.json()) as {
    orderedIds: string[];
  };
  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const filesColl = db.collection("uploads.files");
  // update each file’s metadata.order
  await Promise.all(
    orderedIds.map((id, idx) =>
      filesColl.updateOne(
        { _id: new ObjectId(id), "metadata.userId": uid },
        { $set: { "metadata.order": idx } }
      )
    )
  );

  return NextResponse.json({ success: true });
}
