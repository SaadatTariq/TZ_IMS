import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  projectId: "gen-lang-client-0026243833",
  appId: "1:274762624954:web:0fb4811ccc810ae756f783",
  apiKey: "AIzaSyAfU-eT0vDUdhY6KFMU9HSx5w8jqX2uSIs"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-tzdistributioner-215c7673-7841-4460-be6c-6378252ba9af");

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
