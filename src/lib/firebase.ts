// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { HarmBlockThreshold, HarmCategory, getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { getStorage } from "firebase/storage";
import { jobAdObjSchema, resumeSchema } from "@/components/objects/userProfile";

// Firebase configuration using environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize the Gemini Developer API backend service
export const ai = getAI(app, { backend: new GoogleAIBackend() });

// Put safety settings on ai input
export const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

// Create a `GenerativeModel` instance
export const model = getGenerativeModel(ai, { model: "gemini-2.0-flash-001", safetySettings });

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// For parsing user-submitted job ads
export const jobAdParseModel = getGenerativeModel(ai, { 
    model: "gemini-2.0-flash-001", 
    safetySettings,
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: jobAdObjSchema
    }
 });

 // For parsing user-submitted resume files or free-form text,
 // as well as generating new resumes in JSON format
 export const resumeModel = getGenerativeModel(ai, {
    model: "gemini-2.0-flash-001",
    safetySettings,
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: resumeSchema
    }
 });