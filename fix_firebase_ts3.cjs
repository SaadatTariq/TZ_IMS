const fs = require('fs');
let code = `import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Vite handles import with fallback.
// In Vercel, this file might exist because it's committed to Git.
import config from '../../firebase-applet-config.json';

// Your web app's Firebase configuration using environment variables
// (Fall back to AI Studio's config if env vars are missing)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || config?.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || config?.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || config?.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || config?.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || config?.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || config?.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || config?.measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in production
let analytics: any = null;
if (import.meta.env.PROD) {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Failed to initialize Analytics:", e);
  }
}

// Get the specific database ID if we are using the managed sandbox
const dbId = import.meta.env.VITE_FIREBASE_DATABASE_ID || config?.firestoreDatabaseId || "(default)";
const db = getFirestore(app, dbId);

const auth = getAuth(app);
export { app, analytics, db, auth };
`;

fs.writeFileSync('src/lib/firebase.ts', code);
