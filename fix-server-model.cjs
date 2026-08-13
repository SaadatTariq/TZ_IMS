const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  "import { GoogleGenAI } from '@google/genai';",
  "import { GoogleGenAI, Type } from '@google/genai';"
);

code = code.replace(
  /const response = await ai\.models\.generateContent\(\{[\s\S]*?const parsed = JSON\.parse\(jsonStr\);/,
  `const interaction = await ai.interactions.create({
        model: 'gemini-3.6-flash',
        input: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image",
            data: base64Data,
            mime_type: mime,
          }
        ],
      });

      const lastStep = interaction.steps.at(-1);
      let jsonStr = '[]';
      if (lastStep?.type === 'model_output') {
        const textContent = lastStep.content?.find(c => c.type === 'text');
        if (textContent) {
          jsonStr = textContent.text.trim();
        }
      }
      
      jsonStr = jsonStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      const parsed = JSON.parse(jsonStr);`
);

fs.writeFileSync('server.ts', code);
