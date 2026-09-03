import { analyzeWithGemini, geminiConfigured } from "@/lib/gemini";
import { analyzeLocally } from "@/lib/heuristics";
import type { Analysis, Channel } from "@/lib/types";

export async function analyzePayment(input: {
  sourceText: string;
  channel?: Channel;
  vendorHint?: string;
}): Promise<Analysis> {
  const heuristic = analyzeLocally(input);
  if (!geminiConfigured()) {
    return heuristic;
  }

  try {
    return await analyzeWithGemini({ ...input, heuristic });
  } catch (error) {
    console.error("Gemini analysis failed, using local graph", error);
    return {
      ...heuristic,
      summary: `${heuristic.summary} (Gemini unreachable — local vendor graph used.)`,
    };
  }
}
