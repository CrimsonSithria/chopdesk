import { GoogleGenAI } from "@google/genai";
import { vendorDirectoryBrief } from "@/lib/vendors";
import type { Analysis, Channel } from "@/lib/types";

const MODEL = "gemini-2.5-flash";

export function geminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
}

export async function analyzeWithGemini(input: {
  sourceText: string;
  channel?: Channel;
  vendorHint?: string;
  heuristic: Analysis;
}): Promise<Analysis> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are Chop, the payment-integrity desk for Helios Trading Pte Ltd, a Singapore importer.

A clerk is about to send money. Read the source document. Compare it to the vendor chops on file. Return ONLY valid JSON matching this TypeScript shape:

{
  "recommendation": "block" | "hold" | "verify" | "release",
  "riskScore": number,
  "confidence": number,
  "summary": string,
  "extracted": {
    "vendorName": string,
    "invoiceNumber": string,
    "poNumber": string,
    "amount": number,
    "currency": string,
    "bankName": string,
    "accountNumber": string,
    "accountName": string,
    "dueDate": string,
    "language": string,
    "sender": string,
    "domain": string
  },
  "findings": [{"severity":"critical"|"high"|"medium"|"low","title":string,"detail":string,"evidence":string}],
  "vendorMatch": {"status":"mismatch"|"partial"|"match"|"unknown","vendorId":string|null,"expectedName":string,"notes":string},
  "verification": {"channel":"whatsapp"|"phone"|"email","language":string,"languageLabel":string,"script":string,"askFor":string[]},
  "memo": string
}

Rules:
- Prefer blocking or holding when the beneficiary, domain, or urgency pattern does not match the chop on file.
- Verification scripts must be in the vendor's working language (Bahasa Melayu, Bahasa Indonesia, Japanese, Thai, or English) and sound like a clerk, not a model.
- Do not invent a vendor id that is not in the directory.
- riskScore is 0–100. confidence is 0–100.

Vendor chops on file:
${JSON.stringify(vendorDirectoryBrief(), null, 2)}

Channel: ${input.channel ?? "unknown"}
Vendor hint: ${input.vendorHint ?? "none"}

Local graph already flagged:
${JSON.stringify(
    {
      recommendation: input.heuristic.recommendation,
      findings: input.heuristic.findings,
      vendorMatch: input.heuristic.vendorMatch,
      extracted: input.heuristic.extracted,
    },
    null,
    2,
  )}

Source document:
"""
${input.sourceText}
"""`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const parsed = JSON.parse(text) as Omit<Analysis, "engine" | "model">;
  return {
    ...parsed,
    extracted: { ...input.heuristic.extracted, ...parsed.extracted },
    findings: parsed.findings?.length ? parsed.findings : input.heuristic.findings,
    engine: "gemini",
    model: MODEL,
  };
}
