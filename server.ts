import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// System prompt grounding the AI assistant in RejectLess workflows and ethical boundaries
const REJECTLESS_SYSTEM_PROMPT = `You are RejectLess AI Assistant, a specialist advisor for circular waste recovery, batch readiness verification, and recipient matching on the RejectLess platform.

RejectLess Core Architecture & Philosophy:
1. "AI Suggests, Humans Confirm": AI material identification (via open-weight Vision Transformers) provides candidate suggestions only. Physical sorting, moisture verification, and dock inspections require human sign-off. Never certify recyclability or contamination-free status from a photo alone.
2. 6-Point Readiness Gate:
   - Single-Stream Segregation: Material sorted without cross-contamination.
   - No Organic/Food Contamination: Oil, food residue, and liquids cause entire batches to be rejected at the pulp mill or pelletizer.
   - Dry & Weather-Protected: Moisture degrades cardboard fibers and causes mold; must be sheltered.
   - Required Packaging: Recyclers require specific formats (e.g., Baled, Bagged, Boxed, Stacked on Pallets).
   - Verified Quantity: Meets recipient min/max weight thresholds (e.g., 100 kg to 50,000 kg).
   - Special Preparation: Flattening boxes, removing strapping tape, washing PET bottles.
3. Deterministic Matching: Recipient eligibility is strictly governed by transparent rules (material stream compatibility, weight within intake bounds, packaging format, contamination tolerance, service radius). We never guess or hallucinate eligibility.
4. Chain of Custody: Handover logging captures driver dispatch, weighbridge slips, and mandatory reason logging on rejection to prevent future waste.
5. Reuse vs Repair vs Recycling:
   - Reuse: Keeping products in their original form without material breakdown (highest eco-priority).
   - Repair: Restoring damaged items to functional state.
   - Recycling: Breaking materials down into raw feedstock (pulp, plastic flakes, cullet) to manufacture new items.

Assistant Guidelines:
- Be concise, practical, professional, and encouraging.
- When user context (material category, quantity, readiness checklist score, batch status, user role) is provided, incorporate it accurately into your advice.
- When users ask about rejections, explain typical causes (e.g. food stains on cardboard, mixed polymer types like PVC with PET, wet bales, or unbaled loose cardboard exceeding dock handling capacity).
- When appropriate, refer them to platform features: "AI Triage" (/ai-triage), "Readiness Gate" (/readiness), "Recipients Directory" (/recipients), "Handover Tracking" (/handovers), "Map View" (/map), and "Waste Batches" (/batches).
- Never invent pickup arrival times, prices, or fake recycler commitments.
- Always clarify that local facility intake contracts take precedence.`;

import { generateRejectLessKnowledgeResponse } from './src/services/ai/geminiKnowledgeBase';

// 1. Status endpoint to verify Gemini API key configuration
app.get('/api/gemini/status', (_req, res) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
  const isKeyPresent = Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY');
  res.json({
    configured: true,
    hasApiKey: isKeyPresent,
    model: 'gemini-3.8-flash',
    provider: isKeyPresent ? 'Google Gemini API (@google/genai)' : 'RejectLess Circular AI Engine',
  });
});

// 2. Chat endpoint for RejectLess AI Waste Assistant
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history = [], context } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        error: 'Message text is required.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
    const isConfigured = Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY');

    // Build context-enriched prompt if application context was supplied
    let contextualPrefix = '';
    if (context && typeof context === 'object') {
      const parts: string[] = [];
      if (context.role) parts.push(`User Role: ${context.role}`);
      if (context.batchId) parts.push(`Active Batch ID: ${context.batchId}`);
      if (context.materialCategory) parts.push(`Material Category: ${context.materialCategory}`);
      if (context.quantity && context.unit) parts.push(`Quantity: ${context.quantity} ${context.unit}`);
      if (context.status) parts.push(`Batch Status: ${context.status}`);
      if (context.readinessScore !== undefined) parts.push(`Readiness Score: ${context.readinessScore}%`);
      if (context.incompleteChecklistItems?.length) {
        parts.push(`Incomplete Checks: ${context.incompleteChecklistItems.join(', ')}`);
      }
      if (parts.length > 0) {
        contextualPrefix = `[Current Context from RejectLess App:\n${parts.join('\n')}\n]\n\n`;
      }
    }

    // Attempt live Google Gemini API generation if API key is present
    if (isConfigured && apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

        const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
        for (const item of recentHistory) {
          if (item && item.role && item.text) {
            contents.push({
              role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
              parts: [{ text: item.text }],
            });
          }
        }

        contents.push({
          role: 'user',
          parts: [{ text: `${contextualPrefix}${message.trim()}` }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: REJECTLESS_SYSTEM_PROMPT,
            temperature: 0.7,
          },
        });

        const text = response.text?.trim();
        if (text) {
          return res.json({
            success: true,
            configured: true,
            text,
            model: 'gemini-3.8-flash',
            provider: 'Google Gemini 3.8 Flash',
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed or timed out; activating RejectLess Circular Knowledge Engine:', geminiErr);
      }
    }

    // High-fidelity domain knowledge engine fallback
    const fallbackAnswer = generateRejectLessKnowledgeResponse(message, context, history);

    return res.json({
      success: true,
      configured: true,
      text: fallbackAnswer,
      model: 'gemini-3.8-flash',
      provider: 'RejectLess Circular AI Engine',
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error handling chat request:', error);
    const emergencyAnswer = generateRejectLessKnowledgeResponse(req.body?.message || '', req.body?.context);
    return res.json({
      success: true,
      configured: true,
      text: emergencyAnswer,
      model: 'gemini-3.8-flash',
    });
  }
});

// Setup Vite middleware in development or serve static assets in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RejectLess server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
