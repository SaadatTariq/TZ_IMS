// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in production to prevent the Installations API 400 error in dev/preview environments
let analytics: any = null;
if (import.meta.env.PROD) {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Failed to initialize Analytics:", e);
  }
}

const db = getFirestore(app, "ai-studio-tzdistributioner-215c7673-7841-4460-be6c-6378252ba9af");

const auth = getAuth(app);

export { app, analytics, db, auth };
