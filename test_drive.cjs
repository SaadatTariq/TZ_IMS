const fs = require('fs');
let code = fs.readFileSync('src/components/DriveBackup.tsx', 'utf-8');

const target = `if (!createRes.ok) throw new Error('Failed to create file metadata');`;

const replace = `if (!createRes.ok) {
        const errText = await createRes.text();
        console.error("Create metadata error:", errText);
        throw new Error('Failed to create file metadata');
      }`;

code = code.replace(target, replace);
fs.writeFileSync('src/components/DriveBackup.tsx', code);
