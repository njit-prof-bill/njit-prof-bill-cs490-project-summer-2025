import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { ObjectId } from "mongodb";
import { db } from "@/lib/mongodb";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// GET /api/profiles/:id
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const bearer = request.headers.get("Authorization")?.replace(/^Bearer\s+/, "");
  if (!bearer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = await admin.auth().verifyIdToken(bearer).catch(() => null);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const doc = await db
    .collection("profiles")
    .findOne({ _id: new ObjectId(id), userId: decoded.uid });

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: doc._id.toString(),
    name: doc.name,
    data: doc.data,
  });
}

// PATCH /api/profiles/:id
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const bearer = request.headers.get("Authorization")?.replace(/^Bearer\s+/, "");
  if (!bearer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = await admin.auth().verifyIdToken(bearer).catch(() => null);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json();
  const update: Partial<{ name: string; data: unknown }> = {};
  if (typeof body.name === "string") update.name = body.name;
  if (body.data !== undefined) update.data = body.data;

  const result = await db.collection("profiles").updateOne(
    { _id: new ObjectId(id), userId: decoded.uid },
    { $set: update }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/profiles/:id
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const bearer = request.headers.get("Authorization")?.replace(/^Bearer\s+/, "");
  if (!bearer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = await admin.auth().verifyIdToken(bearer).catch(() => null);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const result = await db
    .collection("profiles")
    .deleteOne({ _id: new ObjectId(id), userId: decoded.uid });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
