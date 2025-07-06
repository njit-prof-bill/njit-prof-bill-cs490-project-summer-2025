// src/app/api/profiles/route.ts
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

const EMPTY_DATA = {
  contactInfo: { email: "", phone: "" },
  careerObjective: "",
  skills: [] as string[],
  jobHistory: [] as object[],
  education: [] as object[],
};

interface ProfileRecord {
  _id: ObjectId;
  userId: string;
  name: string;
  data: unknown;
  createdAt: Date;
}

// GET /api/profiles
export async function GET(request: Request) {
  const bearer = request.headers.get("Authorization")?.slice(7);
  if (!bearer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let decoded: admin.auth.DecodedIdToken;
  try {
    decoded = await admin.auth().verifyIdToken(bearer);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // fetch existing
  let docs = await db
    .collection<ProfileRecord>("profiles")
    .find({ userId: decoded.uid })
    .sort({ createdAt: 1 })
    .toArray();

  // lazy-create a first profile if none
  if (docs.length === 0) {
    const name = "Profile 1";
    const res = await db.collection("profiles").insertOne({
      userId: decoded.uid,
      name,
      data: EMPTY_DATA,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    docs = [
      {
        _id: res.insertedId,
        userId: decoded.uid,
        name,
        data: EMPTY_DATA,
        createdAt: new Date(),
      },
    ];
  }

  return NextResponse.json(
    docs.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      data: d.data,
    }))
  );
}

// POST /api/profiles
export async function POST(request: Request) {
  const bearer = request.headers.get("Authorization")?.slice(7);
  if (!bearer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let decoded: admin.auth.DecodedIdToken;
  try {
    decoded = await admin.auth().verifyIdToken(bearer);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // how many they already have?
  const count = await db
    .collection("profiles")
    .countDocuments({ userId: decoded.uid });

  const newName = `Profile ${count + 1}`;
  const insert = await db.collection("profiles").insertOne({
    userId: decoded.uid,
    name: newName,
    data: EMPTY_DATA,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json({
    id: insert.insertedId.toString(),
    name: newName,
  });
}
