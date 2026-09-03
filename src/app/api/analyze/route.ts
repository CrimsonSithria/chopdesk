import { analyzePayment } from "@/lib/analyze";
import { geminiConfigured } from "@/lib/gemini";
import type { Channel } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    sourceText?: string;
    channel?: Channel;
    vendorHint?: string;
  } | null;

  const sourceText = body?.sourceText?.trim() ?? "";
  if (sourceText.length < 20) {
    return Response.json(
      { error: "Paste the email, WhatsApp thread, or invoice text — at least a few lines." },
      { status: 400 },
    );
  }

  const analysis = await analyzePayment({
    sourceText,
    channel: body?.channel,
    vendorHint: body?.vendorHint,
  });

  return Response.json({
    analysis,
    engine: analysis.engine,
    geminiConfigured: geminiConfigured(),
  });
}

export async function GET() {
  return Response.json({
    ok: true,
    geminiConfigured: geminiConfigured(),
    model: geminiConfigured() ? "gemini-2.5-flash" : "chop-local-graph",
  });
}
