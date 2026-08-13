import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // We need to handle large payloads for base64 images
  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.post('/api/parse-po', async (req, res) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const { imageBase64, mimeType } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ error: 'No image provided' });
      }

      // We remove the data:image/jpeg;base64, prefix if it exists
      const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, "");
      const mime = mimeType || 'image/jpeg';

      const prompt = `Extract the items from this Purchase Order.
For each item, return a JSON object with EXACTLY these keys: 
- "code" (the item barcode or code, typically a string like EL74983864N found at the start of the product column)
- "description" (the exact product description text, omitting the barcode if they are joined)
- "quantity" (just the numeric ordered quantity, e.g., if it says 12x1=12 or 304~304, just return the integer quantity like 12)
- "costUnit" (the cost per unit if available)
- "totalCost" (the total cost for that line)

Return ONLY a valid JSON array of these objects. Do not include markdown formatting or \`\`\`json blocks. Just the raw JSON array.`;

      const interaction = await ai.interactions.create({
        model: 'gemini-3.6-flash',
                input: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: mime.includes('pdf') ? "document" : "image",
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
      
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      res.json({ items: parsed });
    } catch (error: any) {
      console.error('Error parsing PO:', error);
      res.status(500).json({ error: error.message || 'Failed to parse PO' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
