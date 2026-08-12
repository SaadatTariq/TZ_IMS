import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjoMO3oZXMUNAGADCa6nln_t2sqxzBqag",
  authDomain: "tz-ims-production.firebaseapp.com",
  projectId: "tz-ims-production"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "default");

async function test() {
  const snapshot = await getDocs(collection(db, 'erp_store'));
  snapshot.forEach(doc => console.log(doc.id, Object.keys(doc.data())));
  process.exit(0);
}

test();
