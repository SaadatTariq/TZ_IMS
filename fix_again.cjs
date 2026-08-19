const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfigProd = {
  projectId: "tz-ims-production",
  appId: "1:455130357173:web:d53d58132c14372a698dfc",
  apiKey: "AIzaSyCjoMO3oZXMUNAGADCa6nln_t2sqxzBqag",
  authDomain: "tz-ims-production.firebaseapp.com",
};

const appProd = initializeApp(firebaseConfigProd, "prod");
// Firebase sometimes uses the project ID as the default database name internally in some regions
const dbProd = getFirestore(appProd, "ai-studio-tzdistributioner-215c7673-7841-4460-be6c-6378252ba9af"); 

async function run() {
  try {
    const d = await getDoc(doc(dbProd, 'erp_store', 'main'));
    console.log(d.exists());
  } catch (e) {
    console.error(e.code);
  }
  process.exit(0);
}
run();
