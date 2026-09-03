"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function JudgesSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          For judges
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">
            Why this exists
          </SheetTitle>
          <SheetDescription>
            AI Builder Cup 2026 · BFSI: Intelligent Risk, Fraud &amp; Financial
            Experiences
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 px-4 pb-8 text-sm leading-6 text-muted-foreground">
          <p>
            JAPAC SMEs still pay suppliers from WhatsApp forwards and PDF
            invoices. Banks have SOC tools. A Penang hardware house does not.
            They have a company chop and a clerk named Priya.
          </p>
          <p>
            Chop is that clerk&apos;s copilot. Gemini reads the slip, compares
            it to the vendor graph, writes an investigator brief, and drafts the
            callback in Bahasa, Japanese, or Thai. Money does not leave until
            someone chops it.
          </p>
          <ol className="list-decimal space-y-2 pl-4">
            <li>
              Open <strong className="text-foreground">CHOP-1042</strong> — a
              lookalike domain plus a Hong Kong HSBC account.
            </li>
            <li>
              Open <strong className="text-foreground">CHOP-1043</strong> — CEO
              fraud over WhatsApp, the most common APAC BEC pattern.
            </li>
            <li>
              Paste a new invoice on <strong className="text-foreground">New slip</strong>.
              Without a Gemini key the local vendor graph still decides; with{" "}
              <code className="font-mono text-foreground">GEMINI_API_KEY</code>{" "}
              the brief is generated live.
            </li>
          </ol>
          <p>
            Required stack: Gemini 2.5 Flash when keyed, Cloud Run Dockerfile in
            the repo. Local fallback is intentional so the demo never dies in
            front of a panel.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
