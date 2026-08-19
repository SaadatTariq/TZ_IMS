const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfigProd = {
  projectId: "tz-ims-production",
  appId: "1:455130357173:web:d53d58132c14372a698dfc",
  apiKey: "AIzaSyCjoMO3oZXMUNAGADCa6nln_t2sqxzBqag",
  authDomain: "tz-ims-production.firebaseapp.com",
};

const appProd = initializeApp(firebaseConfigProd, "prod");
const dbProd = getFirestore(appProd); 

async function run() {
  try {
    const d = await getDoc(doc(dbProd, 'erp_store', 'main'));
    if (d.exists()) {
      console.log('Doc exists. Found products:', d.data().products?.length);
    } else {
      console.log('Doc does not exist.');
    }
  } catch (e) {
    console.error('Error fetching doc:', e.message);
  }
  process.exit(0);
}
run();
