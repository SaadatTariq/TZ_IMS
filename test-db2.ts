import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjoMO3oZXMUNAGADCa6nln_t2sqxzBqag",
  authDomain: "tz-ims-production.firebaseapp.com",
  projectId: "tz-ims-production",
  storageBucket: "tz-ims-production.firebasestorage.app",
  messagingSenderId: "455130357173",
  appId: "1:455130357173:web:d53d58132c14372a698dfc",
  measurementId: "G-HXMNJMYDXC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    console.log("Attempting to read...");
    const snapshot = await getDocs(collection(db, 'erp_store'));
    console.log("Read successful, count:", snapshot.size);
    process.exit(0);
  } catch (e) {
    console.error("Read failed:", e);
    process.exit(1);
  }
}

test();
