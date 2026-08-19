const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

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
    let products = d.exists() ? d.data().products || [] : [];
    
    console.log("Current products:", products.length);
    
    // Add 250 test products
    const testProducts = [];
    for(let i=0; i<250; i++) {
      testProducts.push({
        id: "bulk-" + i,
        code: "TEST-" + i,
        description: "Bulk Product " + i,
        unit: "Box",
        cpu: i, tpCsd: i, tpCaptainsWorld: i, tpCoopers: i, tpShumis: i, tpGenius: i, tpOverseas: i, tpIferi: i,
        mrp: i, stock: i
      });
    }
    
    await setDoc(doc(db, 'erp_store', 'main'), { products: testProducts }, { merge: true });
    console.log("Successfully wrote 250 products!");
    
    // Remove the test products
    await setDoc(doc(db, 'erp_store', 'main'), { products: products }, { merge: true });
    console.log("Restored original products!");
    
  } catch (e) {
    console.error("Write failed:", e);
  }
  process.exit(0);
}
run();
