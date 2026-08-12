import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjoMO3oZXMUNAGADCa6nln_t2sqxzBqag",
  authDomain: "tz-ims-production.firebaseapp.com",
  projectId: "tz-ims-production"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "default");

async function test() {
  try {
    const snapshot = await getDocs(collection(db, 'erp_store'));
    console.log("Read successful, count:", snapshot.size);
    process.exit(0);
  } catch (e) {
    console.error("Operation failed:", e);
    process.exit(1);
  }
}

test();
