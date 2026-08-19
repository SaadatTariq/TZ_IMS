const fs = require('fs');

// Hook into login
let loginContent = fs.readFileSync('src/pages/Login.tsx', 'utf-8');
if (!loginContent.includes('addAuditLog')) {
  loginContent = loginContent.replace(
    `const { users, setCurrentUser } = useStore();`,
    `const { users, setCurrentUser, addAuditLog } = useStore();`
  );
  loginContent = loginContent.replace(
    `setCurrentUser(user);`,
    `setCurrentUser(user);\n      addAuditLog({\n        userName: user.name,\n        userRole: user.role,\n        action: 'LOGIN',\n        module: 'Auth',\n        description: \`User logged in successfully.\`\n      });`
  );
  fs.writeFileSync('src/pages/Login.tsx', loginContent);
}

// Hook into Dashboard exports
let dashboardContent = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');
if (!dashboardContent.includes('addAuditLog')) {
  dashboardContent = dashboardContent.replace(
    `const { products, invoices, setInvoices, setProducts, currentUser, ledger, shipments, returns } = useStore();`,
    `const { products, invoices, setInvoices, setProducts, currentUser, ledger, shipments, returns, addAuditLog } = useStore();`
  );
  dashboardContent = dashboardContent.replace(
    `const exportAllData = () => {`,
    `const exportAllData = () => {\n    addAuditLog({\n      userName: currentUser?.name || 'System',\n      userRole: currentUser?.role || 'Unknown',\n      action: 'EXPORT',\n      module: 'System',\n      description: 'Exported all database collections to CSV.'\n    });`
  );
  fs.writeFileSync('src/pages/Dashboard.tsx', dashboardContent);
}

// Hook into Inventory Add/Edit/Delete
let inventoryContent = fs.readFileSync('src/pages/Inventory.tsx', 'utf-8');
if (!inventoryContent.includes('addAuditLog')) {
  inventoryContent = inventoryContent.replace(
    `const { products, setProducts, currentUser, invoices } = useStore();`,
    `const { products, setProducts, currentUser, invoices, addAuditLog } = useStore();`
  );
  inventoryContent = inventoryContent.replace(
    `setProducts(products.map(p => p.id === formData.id ? { ...p, ...finalFormData } as Product : p));`,
    `setProducts(products.map(p => p.id === formData.id ? { ...p, ...finalFormData } as Product : p));
        addAuditLog({
          userName: currentUser?.name || 'Unknown',
          userRole: currentUser?.role || 'Unknown',
          action: 'UPDATE',
          module: 'Inventory',
          description: \`Updated product \${finalFormData.code} (\${finalFormData.description}).\`
        });`
  );
  inventoryContent = inventoryContent.replace(
    `const newProduct: Product = { ...finalFormData, id: Date.now().toString() } as Product;
          setProducts([...products, newProduct]);`,
    `const newProduct: Product = { ...finalFormData, id: Date.now().toString() } as Product;
          setProducts([...products, newProduct]);
          addAuditLog({
            userName: currentUser?.name || 'Unknown',
            userRole: currentUser?.role || 'Unknown',
            action: 'CREATE',
            module: 'Inventory',
            description: \`Added new product \${newProduct.code} (\${newProduct.description}).\`
          });`
  );
  inventoryContent = inventoryContent.replace(
    `setProducts(products.filter(p => p.id !== productToDelete));`,
    `const p = products.find(p => p.id === productToDelete);
        setProducts(products.filter(p => p.id !== productToDelete));
        if (p) {
          addAuditLog({
            userName: currentUser?.name || 'Unknown',
            userRole: currentUser?.role || 'Unknown',
            action: 'DELETE',
            module: 'Inventory',
            description: \`Deleted product \${p.code} (\${p.description}).\`
          });
        }`
  );
  fs.writeFileSync('src/pages/Inventory.tsx', inventoryContent);
}

