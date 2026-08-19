const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "gen-lang-client-0026243833",
  appId: "1:274762624954:web:0fb4811ccc810ae756f783",
  apiKey: "AIzaSyAfU-eT0vDUdhY6KFMU9HSx5w8jqX2uSIs",
  authDomain: "gen-lang-client-0026243833.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-tzdistributioner-215c7673-7841-4460-be6c-6378252ba9af");

async function run() {
  try {
    const d = await getDoc(doc(db, 'erp_store', 'main'));
    if (d.exists()) {
      console.log('Old Doc exists. Products:', d.data().products?.length);
    } else {
      console.log('Old Doc does not exist');
    }
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
