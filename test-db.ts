import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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
    console.log("Attempting to write...");
    await setDoc(doc(db, 'erp_store', 'test_doc'), { test: "Hello from AI Studio" });
    console.log("Write successful!");
    process.exit(0);
  } catch (e) {
    console.error("Write failed:", e);
    process.exit(1);
  }
}

test();
