// src/app/api/download/route.ts
import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { ObjectId, GridFSBucket } from "mongodb";
import { Readable } from "stream";
import { db as sharedDb } from "@/lib/mongodb";

export const config = { api: { bodyParser: false } };

// init Firebase Admin once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_ADMIN_KEY!)
    ),
  });
}

export async function GET(request: Request) {
  const url   = new URL(request.url);
  const id    = url.searchParams.get("id");
  const type  = url.searchParams.get("type");
  const token =
    url.searchParams.get("token") ||
    request.headers.get("Authorization")?.replace(/^Bearer\s*/, "") ||
    "";

  if (!id || !type || !token) {
    return NextResponse.json({ error: "Missing id, type or token" }, { status: 400 });
  }

  // 1) Verify and extract uid
  let uid: string;
  try {
    ({ uid } = await admin.auth().verifyIdToken(token));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Pick the bucket name
  const bucketName =
    type === "upload" ? "uploads" :
    type === "resume" ? "resumes" :
    null;
  if (!bucketName) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // 3) Build ObjectId
  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "Bad file ID" }, { status: 400 });
  }

  // 4) Look up metadata, enforcing metadata.userId = uid
  const filesColl = sharedDb.collection(`${bucketName}.files`);
  const fileDoc = await filesColl.findOne({
    _id:               oid,
    "metadata.userId": uid
  });
  if (!fileDoc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 5) Stream back via GridFS
  const bucketStream = new GridFSBucket(sharedDb, { bucketName });
  const downloadNode = bucketStream.openDownloadStream(oid);
  const downloadWeb  = Readable.toWeb(downloadNode);

  return new NextResponse(downloadWeb as BodyInit, {
    headers: {
      "Content-Type":        fileDoc.contentType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${fileDoc.filename}"`,
      "Cache-Control":       "no-cache, no-transform",
      Connection:            "keep-alive",
    },
  });
}
