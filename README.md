# RejectLess — AI-Assisted Waste Readiness & Recipient Matching Platform

RejectLess is an AI-assisted circular waste recovery, readiness certification, recipient matching, and chain-of-custody tracking platform designed to end gate rejections before waste travels.

---

## Key Features

1. **Gemini AI Waste Assistant (`gemini-3.8-flash`)**
   - Live intelligent chatbot powered by the official `@google/genai` TypeScript SDK.
   - Available via a floating widget on all pages and as a dedicated full-page view (`/assistant`).
   - Advises on segregation, moisture prevention, avoiding organic contamination, packaging formats, and recipient intake standards.
   - Grounded in circular recovery domain knowledge (Reuse vs Repair vs Recycling; explainable matching; mandatory human verification at loading docks).
   - Server-side proxy (`/api/gemini/chat`) prevents exposing client API keys to the browser.

2. **Interactive Leaflet & OpenStreetMap Geospatial Network (`/map`)**
   - Full interactive map of verified regional paper mills, polymer plants, and pickup bays.
   - Distinct custom SVG pins for Recipient Facilities (Emerald) and Waste Batch Pickups (Amber).
   - Recipient service radius circle visualization (`maxServiceRadiusKm`).
   - Pairwise eligibility evaluation and straight-line Haversine distance connection lines between batches and candidate recyclers.
   - Filter by material stream, facility type, and location layer.
   - OpenStreetMap tiles with complete license and attribution.

3. **AI Vision Material Triage (`/ai-triage`)**
   - Open-weight Vision Transformer (ViT) classification proposes material categories (Cardboard, Paper, Plastic, Glass, Metal).
   - Adheres to the core principle: *AI suggests, humans confirm*.

4. **6-Point Readiness Gate (`/readiness`)**
   - Quality certification enforcing single-stream sorting, moisture sheltering, zero food/organic contamination, packaging format (baled, boxed, pallets), and quantity verification.

5. **Deterministic Explainable Matching (`/recipients`)**
   - Transparent scoring comparing material streams, intake capacity bounds, packaging format, and collection radius against mill constraints.

6. **Chain-of-Custody Handover Tracking (`/handovers` & `/history`)**
   - Immutable audit logging of driver dispatch, dock inspection, weighbridge slips, and mandatory rejection reason logging.

---

## Environment Setup

### 1. Configure Gemini API Key
To enable live AI assistant responses, configure your Gemini API key:

Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Set your API key in `.env` (or via AI Studio Secrets):
```env
GEMINI_API_KEY="your_google_gemini_api_key"
PORT=3000
```

> **Note:** If `GEMINI_API_KEY` is not set, RejectLess displays a clear, friendly "API Key Required" notification with setup instructions instead of silently failing or fabricating fake responses.

---

## Development & Testing

### Install Dependencies
```bash
npm install
```

### Run the Full-Stack Dev Server (Express + Vite)
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

### Run Test Suites
```bash
npm test
```
Runs all 18 unit tests covering readiness evaluation, deterministic matching rules, and handover custody transition logs.

### Lint & TypeScript Validation
```bash
npm run lint
```
