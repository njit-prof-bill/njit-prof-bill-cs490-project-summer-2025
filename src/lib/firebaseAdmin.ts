import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS as string);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'pisces-92cc9.firebasestorage.app'
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

export { db, bucket };
