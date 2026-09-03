# Chop

**Don't pay until it's chopped.**

A payment-integrity desk for JAPAC finance teams. Built for the [Google Cloud AI Builder Cup 2026](https://aibuildercup.com) under **BFSI: Intelligent Risk, Fraud & Financial Experiences**.

Clerks at mid-market importers still pay suppliers from email, PDF, and WhatsApp. Vendor-account swaps and CEO-fraud threads are how the money leaves. Chop reads the slip, checks it against the vendor master, and drafts a callback in the language the supplier actually answers — before anyone stamps the payment.

The working company in the demo is **Helios Trading Pte Ltd**, a Singapore importer. You sit as Priya Menon, AP lead.

## Run locally

```bash
npm install
cp .env.example .env.local
# optional: paste a Gemini API key from https://aistudio.google.com/apikey
npm run dev
```

Open [http://127.0.0.1:43147](http://127.0.0.1:43147).

Without `GEMINI_API_KEY`, Chop still analyzes every slip with the local vendor graph. With the key, Gemini 2.5 Flash writes the brief, findings, and callback.

## What to click

1. **CHOP-1042** — Penang hardware house, lookalike domain, new HSBC Hong Kong account.
2. **CHOP-1043** — WhatsApp “boss said pay now” CEO fraud.
3. **New slip** — paste your own invoice or load a sample.

`/brief` is the one-page submission note you can export to PDF.

## Deploy to Cloud Run

The hackathon requires Google Cloud (Cloud Run or Firebase) and a Gemini / Gemma / agentic model.

```bash
gcloud run deploy chopdesk \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key
```

Or build the included Dockerfile and run it on port 8080.

## Stack

- Next.js + TypeScript
- Gemini 2.5 Flash via `@google/genai` when a key is present
- Local vendor-graph fallback so the demo never dies
- shadcn/ui on Tailwind

## Eligibility reminder

This edition is for working professionals, entrepreneurs, and startups. Teams are 2–4 people, age 21+, all based in JAPAC. Students are not eligible. Only one theme per team. Fresh work only — started after program launch.
