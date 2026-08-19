const fs = require('fs');
let code = `import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Check if we are running in AI Studio with a local config file
let localConfig = {};
try {
  // We use a dynamic approach or fallback to avoid breaking Vercel builds if missing
  localConfig = require('../../firebase-applet-config.json');
} catch (e) {
  localConfig = {};
}

// Your web app's Firebase configuration using environment variables
// (Fall back to AI Studio's config if env vars are missing)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || localConfig.measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in production
let analytics = null;
if (import.meta.env.PROD) {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Failed to initialize Analytics:", e);
  }
}

// Get the specific database ID if we are using the managed sandbox
const dbId = import.meta.env.VITE_FIREBASE_DATABASE_ID || localConfig.firestoreDatabaseId || "(default)";
const db = getFirestore(app, dbId);

const auth = getAuth(app);
export { app, analytics, db, auth };
`;

fs.writeFileSync('src/lib/firebase.ts', code);
