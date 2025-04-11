import { initializeApp, getApps, getApp } from 'firebase/app';
import { FirebaseApp } from 'firebase/app';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

const firebaseConfig = {
    apiKey: publicRuntimeConfig.FIREBASE_API_KEY,
    authDomain: publicRuntimeConfig.FIREBASE_AUTH_DOMAIN,
    projectId: publicRuntimeConfig.FIREBASE_PROJECT_ID,
    storageBucket: publicRuntimeConfig.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: publicRuntimeConfig.FIREBASE_MESSAGING_SENDER_ID,
    appId: publicRuntimeConfig.FIREBASE_APP_ID,
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