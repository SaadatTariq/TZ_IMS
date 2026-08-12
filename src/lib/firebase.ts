import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// We check if you provided your own Firebase config via Vercel Environment Variables
const isCustomSetup = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0026243833",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:274762624954:web:0fb4811ccc810ae756f783",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAfU-eT0vDUdhY6KFMU9HSx5w8jqX2uSIs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0026243833.firebaseapp.com",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0026243833.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "274762624954",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// In your own Firebase project (Vercel), Firestore uses the "(default)" database.
// AI Studio uses a specifically named isolated database.
export const db = isCustomSetup 
  ? getFirestore(app) // Your own Firebase default database
  : getFirestore(app, "ai-studio-tzdistributioner-215c7673-7841-4460-be6c-6378252ba9af"); // AI Studio database fallback
