const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "tz-ims-production",
  appId: "1:455130357173:web:d53d58132c14372a698dfc",
  apiKey: "AIzaSyCjoMO3oZXMUNAGADCa6nln_t2sqxzBqag",
  authDomain: "tz-ims-production.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const d = await getDoc(doc(db, 'erp_store', 'main'));
    if (d.exists()) {
      const data = d.data();
      const str = JSON.stringify(data);
      console.log('Doc exists. Size (bytes):', str.length);
      console.log('Products count:', data.products?.length || 0);
      console.log('Invoices count:', data.invoices?.length || 0);
    } else {
      console.log('Doc does not exist in tz-ims-production!');
    }
  } catch (e) {
    console.error("Error accessing tz-ims-production:", e);
  }
  process.exit(0);
}
run();
