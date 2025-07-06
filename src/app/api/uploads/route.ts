// src/app/api/uploads/route.ts
import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { bucket, db } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// disable built-in body parsing so we can stream FormData
export const config = { api: { bodyParser: false } };

// init Firebase Admin once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// our user doc interface
interface UserDoc {
  _id: string;
  email: string;
  name: string;
  updated: Date;
}

/**
 * POST /api/uploads
 *   - expects a multipart FormData with “file”
 *   - authorizes via Bearer <idToken>
 *   - upserts user profile doc
 *   - stores the file into GridFS with metadata.userId
 */
export async function POST(request: Request) {
  // 1) Authenticate
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

  // 2) Upsert user doc
  const usersColl = db.collection<UserDoc>("users");
  await usersColl.updateOne(
    { _id: uid },
    {
      $set: {
        _id: uid,
        email: decoded.email!,
        name: decoded.name ?? "",
        updated: new Date(),
      },
    },
    { upsert: true }
  );

  // 3) Parse the incoming FormData
  const form = await request.formData();
  const maybeFile = form.get("file");
  if (
    !maybeFile ||
    typeof (maybeFile as Blob).arrayBuffer !== "function"
  ) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  const blob = maybeFile as Blob;
  const buf = Buffer.from(await blob.arrayBuffer());

  // 4) Decide filename + type
  let filename: string, typeField: string;
  if (blob instanceof File) {
    filename = blob.name;
    typeField = blob.type || "application/octet-stream";
  } else {
    const txt = new TextDecoder("utf-8").decode(buf);
    filename = txt.slice(0, 10);
    typeField = "text";
  }

  // 5) Write into GridFS
  const uploadStream = bucket.openUploadStream(filename, {
    contentType: typeField,
    metadata: { userId: uid },
  });
  uploadStream.end(buf);
  await new Promise<void>((res, rej) => {
    uploadStream.on("finish", res);
    uploadStream.on("error", rej);
  });

  return NextResponse.json({
    fileId: uploadStream.id.toString(),
    filename,
    type: typeField,
  });
}

/**
 * GET /api/uploads
 *   - lists this user’s uploads in descending uploadDate
 *   - authorizes via Bearer <idToken>
 */
export async function GET(request: Request) {
  // 1) Authenticate
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

  // 2) Query GridFS `uploads.files`
  const filesColl = db.collection("uploads.files");
  const docs = await filesColl
    .find({ "metadata.userId": uid })
    .sort({ "metadata.order": 1 })
    .toArray();

  // 3) Map to lightweight shape
  const items = docs.map((f) => ({
    id: f._id.toString(),
    filename: f.filename,
    createdAt: f.uploadDate,
    type: f.contentType,
    order: f.metadata?.order ?? 0,
  }));

  return NextResponse.json(items);
}

// DELETE /api/uploads
export async function DELETE(request: Request) {
  // 1) Authenticate same as GET/POST
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

  // 2) Grab `id` from query
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // 3) Ensure user owns it
  const filesColl = db.collection("uploads.files");
  const doc = await filesColl.findOne({
    _id: new ObjectId(id),
    "metadata.userId": decoded.uid,
  });
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 4) Delete from GridFS
  await bucket.delete(new ObjectId(id));

  return NextResponse.json({ success: true });
}
