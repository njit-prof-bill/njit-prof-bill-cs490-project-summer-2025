import { initializeApp, getApps, getApp } from "firebase/app";
import { FirebaseApp } from "firebase/app";

// Firebase configuration using environment variables with NEXT_PUBLIC_ prefix
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase configuration
function validateConfig(config: Record<string, string | undefined>): void {
    for (const [key, value] of Object.entries(config)) {
        if (!value) {
            throw new Error(`Missing Firebase configuration value: ${key}`);
        }
    }
}
validateConfig(firebaseConfig);

// Initialize Firebase app (prevent multiple initializations)
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export default app;