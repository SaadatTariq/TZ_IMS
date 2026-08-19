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
      const data = d.data();
      console.log('Production Doc exists. Size (bytes):', JSON.stringify(data).length);
      console.log('Products count:', data.products?.length);
    } else {
      console.log('Production Doc does not exist yet.');
    }
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
