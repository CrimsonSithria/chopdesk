"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pipeline } from "@/components/pipeline";
import { useCases } from "@/components/cases-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { vendors } from "@/lib/vendors";
import type { Channel } from "@/lib/types";
import { cn } from "@/lib/utils";

const samples: { label: string; channel: Channel; hint: string; body: string }[] = [
  {
    label: "Lookalike domain",
    channel: "email",
    hint: "cheong",
    body: `From: Finance <payables@cheonghardware-group.com>
Subject: Bank update INV-CH-2304

Please pay Cheong Hardware Sdn Bhd INV-CH-2304 / PO HH-CH-8844
Amount: MYR 96,400
Bank: OCBC Singapore
Account name: CHEONG HW TRADING
A/C No: 719-220188-991
Pay today, port charges are accruing.`,
  },
  {
    label: "Clean rice invoice",
    channel: "email",
    hint: "mae",
    body: `From: Export Desk <export@maeklongrice.co.th>
Vendor: Mae Klong Rice Mill Co.
Invoice No: MK-3318
PO No: HH-MK-081
Amount: THB 640,000
Bank: Kasikornbank
Account name: MAE KLONG RICE MILL CO
A/C No: 029-118-5529`,
  },
];

export function IntakeForm() {
  const router = useRouter();
  const { createFromAnalysis } = useCases();
  const [sourceText, setSourceText] = useState("");
  const [channel, setChannel] = useState<Channel>("email");
  const [vendorHint, setVendorHint] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [engine, setEngine] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceText, channel, vendorHint }),
      });
      const payload = (await response.json()) as {
        error?: string;
        analysis?: Parameters<typeof createFromAnalysis>[0]["analysis"];
        engine?: string;
      };
      if (!response.ok || !payload.analysis) {
        setError(payload.error ?? "The desk could not read that slip.");
        return;
      }
      setEngine(payload.engine ?? payload.analysis.engine);
      const created = createFromAnalysis({
        sourceText,
        channel,
        analysis: payload.analysis,
      });
      router.push(`/desk/${created.id}`);
    } catch {
      setError("Network dropped while the desk was reading. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <p className="font-mono text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
        Intake
      </p>
      <h1 className="mt-2 font-display text-4xl">Drop a slip on the desk</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Paste an email, a WhatsApp thread, or invoice text. Chop extracts the
        beneficiary, checks it against Helios&apos; vendor chops, and tells
        Priya whether to stamp it.
      </p>

      <div className="mt-6">
        <Pipeline active={busy ? 3 : 0} pulsing={busy} />
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="flex flex-wrap gap-2">
          {(["email", "whatsapp", "pdf"] as Channel[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setChannel(item)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs capitalize",
                channel === item
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <Textarea
          value={sourceText}
          onChange={(event) => setSourceText(event.target.value)}
          placeholder="From: accounts@…&#10;Invoice No: …&#10;Amount: …&#10;Bank: …"
          className="min-h-[280px] font-mono text-[13px] leading-6"
          required
        />

        <label className="block text-sm">
          <span className="text-muted-foreground">Vendor hint (optional)</span>
          <select
            value={vendorHint}
            onChange={(event) => setVendorHint(event.target.value)}
            className="mt-1 h-9 w-full rounded-lg border bg-background px-3 text-sm"
          >
            <option value="">Let Chop match it</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </label>

        {error ? (
          <p className="rounded-2xl border border-[var(--chop)]/40 bg-[var(--chop)]/8 px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={busy} className="bg-[var(--chop)] hover:bg-[var(--chop)]/90">
            {busy ? "Reading the slip…" : "Ask Chop"}
          </Button>
          <p className="text-xs text-muted-foreground">
            {engine
              ? `Last engine: ${engine}`
              : "Uses Gemini 2.5 Flash when GEMINI_API_KEY is set. Otherwise the local vendor graph."}
          </p>
        </div>
      </form>

      <div className="mt-10">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          Load a sample
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {samples.map((sample) => (
            <button
              key={sample.label}
              type="button"
              className="rounded-full border bg-card px-3 py-1.5 text-sm hover:bg-accent"
              onClick={() => {
                setSourceText(sample.body);
                setChannel(sample.channel);
                setVendorHint(sample.hint);
              }}
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
