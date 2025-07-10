// src/lib/mongodb.ts
import { MongoClient, GridFSBucket } from "mongodb";

const {
  MONGODB_URI,
  MONGODB_USER,
  MONGODB_PASS,
  MONGODB_HOST = "cs490-project.l66ga0z.mongodb.net",
  MONGODB_DB = "CS490-Project",
} = process.env;

let uri = "";

if (MONGODB_URI) {
  uri = MONGODB_URI;
} else {
  if (!MONGODB_USER || !MONGODB_PASS) {
    throw new Error(
      "Please define either MONGODB_URI or both MONGODB_USER and MONGODB_PASS environment variables"
    );
  }
  const encodedPass = encodeURIComponent(MONGODB_PASS);
  uri = `mongodb+srv://${MONGODB_USER}:${encodedPass}@${MONGODB_HOST}/?retryWrites=true&w=majority&appName=${MONGODB_DB}`;
}

const options = {}; // Add your MongoClientOptions here if needed

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
  if (!globalThis._mongoClientPromise) {
    const mongoClient = new MongoClient(uri, options);
    globalThis._mongoClientPromise = mongoClient.connect();
  }
  client = await globalThis._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  await client.connect();
}

const db = client.db(); // default DB from URI or config

const bucket = new GridFSBucket(db, {
  bucketName: "uploads",
});

export { client, db, bucket };
