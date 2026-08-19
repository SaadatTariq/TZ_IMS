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
    let products = [];
    if (d.exists()) {
      products = d.data().products || [];
    }
    
    console.log("Current products:", products.length);
    
    // Add a test product
    const testProduct = {
      id: "test-" + Date.now(),
      code: "TEST-001",
      description: "Test Product",
      unit: "Box",
      cpu: 0, tpCsd: 0, tpCaptainsWorld: 0, tpCoopers: 0, tpShumis: 0, tpGenius: 0, tpOverseas: 0, tpIferi: 0,
      mrp: 0, stock: 0
    };
    
    const newProducts = [...products, testProduct];
    
    await setDoc(doc(db, 'erp_store', 'main'), { products: newProducts }, { merge: true });
    console.log("Successfully wrote test product!");
    
    // Remove the test product
    await setDoc(doc(db, 'erp_store', 'main'), { products: products }, { merge: true });
    console.log("Restored original products!");
    
  } catch (e) {
    console.error("Write failed:", e);
  }
  process.exit(0);
}
run();
