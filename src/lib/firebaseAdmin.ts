import { initializeApp, cert, getApps, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Ensure the environment variable is present
if (!process.env.FIREBASE_ADMIN_KEY) {
  throw new Error("Missing FIREBASE_ADMIN_KEY environment variable");
}

// Parse and cast the JSON string into a ServiceAccount object
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY) as ServiceAccount;

// Only initialize if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

// Export Firestore instance
export const db = getFirestore();
