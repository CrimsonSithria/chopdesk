import { geminiConfigured } from "@/lib/gemini";

export function GET() {
  return Response.json({
    ok: true,
    service: "chopdesk",
    geminiConfigured: geminiConfigured(),
  });
}
