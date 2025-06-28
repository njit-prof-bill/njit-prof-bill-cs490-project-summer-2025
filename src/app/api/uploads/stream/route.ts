// src/app/api/uploads/stream/route.ts
import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { db } from "@/lib/mongodb";

export const config = { api: { bodyParser: false } };
export const runtime = "nodejs";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_ADMIN_KEY!)
    ),
  });
}

export async function GET(request: Request) {
  // 1) grab token from header OR query param
  let idToken = "";
  const authHeader = request.headers.get("Authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    idToken = authHeader.slice(7);
  } else {
    const url = new URL(request.url);
    idToken = url.searchParams.get("token") || "";
  }
  if (!idToken) {
    return new NextResponse(null, { status: 401 });
  }

  // 2) verify
  let decoded: admin.auth.DecodedIdToken;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch {
    return new NextResponse(null, { status: 401 });
  }
  const uid = decoded.uid;

  // 3) set up change stream
  const changeStream = db
    .collection("uploads.files")
    .watch(
      [{ $match: { "fullDocument.metadata.userId": uid } }],
      { fullDocument: "updateLookup" }
    );

  const encoder = new TextEncoder();

  return new NextResponse(
    new ReadableStream({
      async start(controller) {
        // ask client to retry if we drop
        controller.enqueue(encoder.encode("retry:10000\n\n"));

        // pull all existing docs once
        const existing = await db
          .collection("uploads.files")
          .find({ "metadata.userId": uid })
          .sort({ uploadDate: -1 })
          .toArray();

        // send INIT event with full array
        const initPayload = existing.map((f) => ({
          id:        f._id.toString(),
          filename:  f.filename,
          createdAt: f.uploadDate,
          type:      f.contentType,
        }));
        controller.enqueue(
          encoder.encode(`event:init\ndata:${JSON.stringify(initPayload)}\n\n`)
        );

        // then push new inserts
        changeStream.on("change", (change) => {
          if (change.operationType === "insert") {
            const f = change.fullDocument!;
            const payload = {
              id:        f._id.toString(),
              filename:  f.filename,
              createdAt: f.uploadDate,
              type:      f.contentType,
            };
            controller.enqueue(
              encoder.encode(`event:insert\ndata:${JSON.stringify(payload)}\n\n`)
            );
          }
        });
      },
      async cancel() {
        await changeStream.close();
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    }
  );
}
