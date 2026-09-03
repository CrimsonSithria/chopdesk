"use client";

import Link from "next/link";
import { useState } from "react";
import { Pipeline } from "@/components/pipeline";
import { Stamp } from "@/components/stamp";
import { useCases } from "@/components/cases-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney, formatWhen, recommendationCopy } from "@/lib/format";
import { findVendor } from "@/lib/vendors";
import type { CaseStatus, FindingSeverity, PaymentCase } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CaseView({ id }: { id: string }) {
  const { cases, decide } = useCases();
  const item = cases.find((entry) => entry.id === id);
  const [copied, setCopied] = useState(false);

  if (!item) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-display text-3xl">This slip is not on the desk.</p>
        <p className="mt-2 text-muted-foreground">
          It may have been from another browser, or the id is wrong.
        </p>
        <Button asChild className="mt-6">
          <Link href="/desk">Back to the desk</Link>
        </Button>
      </div>
    );
  }

  const vendor = item.analysis.vendorMatch.vendorId
    ? findVendor(item.analysis.vendorMatch.vendorId)
    : undefined;
  const rec = item.analysis.recommendation;
  const copy = recommendationCopy(rec);

  async function copyScript() {
    await navigator.clipboard.writeText(item!.analysis.verification.script);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/desk"
            className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground"
          >
            ← Desk
          </Link>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">{item.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {item.id} · {formatWhen(item.submittedAt)} · {item.sourceLabel}
          </p>
        </div>
        <Badge variant="outline" className="rounded-full font-mono">
          {item.analysis.engine === "gemini"
            ? item.analysis.model
            : "local vendor graph"}
        </Badge>
      </div>

      <div className="mt-6">
        <Pipeline />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <section className="rounded-3xl border bg-card p-5">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-xl">
                <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                  Investigator brief
                </p>
                <p className="mt-3 font-display text-2xl leading-snug">
                  {item.analysis.summary}
                </p>
                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                  {item.analysis.memo}
                </p>
              </div>
              <Stamp
                recommendation={rec}
                score={item.analysis.riskScore}
                className="shrink-0 self-center sm:self-start"
              />
            </div>
          </section>

          <section className="rounded-3xl border bg-card p-5">
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              Findings
            </p>
            <ul className="mt-4 space-y-3">
              {item.analysis.findings.map((finding) => (
                <li
                  key={finding.title}
                  className="rounded-2xl border border-border/80 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityMark severity={finding.severity} />
                    <p className="font-medium">{finding.title}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {finding.detail}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                    Evidence · {finding.evidence}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <CompareCard
              title="On this slip"
              rows={[
                ["Vendor", item.analysis.extracted.vendorName || "—"],
                ["Invoice", item.analysis.extracted.invoiceNumber || "—"],
                ["PO", item.analysis.extracted.poNumber || "—"],
                [
                  "Amount",
                  item.amount
                    ? formatMoney(item.amount, item.currency)
                    : "—",
                ],
                ["Bank", item.analysis.extracted.bankName || "—"],
                [
                  "Account",
                  item.analysis.extracted.accountNumber || "—",
                ],
                ["Sender", item.analysis.extracted.domain || item.analysis.extracted.sender || "—"],
              ]}
            />
            <CompareCard
              title="Chop on file"
              rows={[
                ["Vendor", vendor?.name ?? "None"],
                ["City", vendor ? `${vendor.city}, ${vendor.country}` : "—"],
                ["Years", vendor ? String(vendor.relationshipYears) : "—"],
                ["Bank", vendor ? vendor.bank.name : "—"],
                ["Last 4", vendor ? vendor.bank.accountLast4 : "—"],
                ["Domain", vendor?.domains[0] ?? "—"],
                ["Notes", vendor?.notes ?? item.analysis.vendorMatch.notes],
              ]}
              warn={item.analysis.vendorMatch.status !== "match"}
            />
          </section>

          <section className="rounded-3xl border bg-[#f7f1e4] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                Source
              </p>
              <span className="text-xs text-muted-foreground">{item.channel}</span>
            </div>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap font-mono text-[12px] leading-6 text-foreground/90">
              {item.sourceBody}
            </pre>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-3xl border bg-card p-5">
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              Callback · {item.analysis.verification.languageLabel}
            </p>
            <p className="mt-3 text-sm leading-6">
              {item.analysis.verification.script}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Send on {item.analysis.verification.channel} to the number already
              on the vendor master — never the number in the slip.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {item.analysis.verification.askFor.map((ask) => (
                <li key={ask}>• {ask}</li>
              ))}
            </ul>
            <Button variant="outline" className="mt-4 w-full" onClick={copyScript}>
              {copied ? "Copied" : "Copy script"}
            </Button>
          </section>

          <section className="rounded-3xl border bg-card p-5">
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              Desk action
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {copy.label}. Confidence {item.analysis.confidence}.
            </p>
            <div className="mt-4 grid gap-2">
              <Action
                item={item}
                status="block"
                onDecide={decide}
                label="Block payment"
              />
              <Action
                item={item}
                status="hold"
                onDecide={decide}
                label="Hold the chop"
              />
              <Action
                item={item}
                status="verify"
                onDecide={decide}
                label="Request verify"
              />
              <Action
                item={item}
                status="release"
                onDecide={decide}
                label="Chop & release"
                primary={rec === "release"}
              />
            </div>
            {item.decidedAt ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Last action {formatWhen(item.decidedAt)}
              </p>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}

function Action({
  item,
  status,
  label,
  onDecide,
  primary = false,
}: {
  item: PaymentCase;
  status: CaseStatus;
  label: string;
  onDecide: (id: string, status: CaseStatus) => void;
  primary?: boolean;
}) {
  const active = item.status === status;
  return (
    <Button
      variant={primary || active ? "default" : "outline"}
      className={cn(
        "w-full justify-between",
        status === "release" && (primary || active) && "bg-emerald-800 hover:bg-emerald-800/90",
        (status === "block" || status === "hold") &&
          (primary || active) &&
          "bg-[var(--chop)] hover:bg-[var(--chop)]/90",
      )}
      onClick={() => onDecide(item.id, status)}
    >
      {label}
      {active ? <span className="font-mono text-[10px]">DONE</span> : null}
    </Button>
  );
}

function CompareCard({
  title,
  rows,
  warn = false,
}: {
  title: string;
  rows: [string, string][];
  warn?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border bg-card p-5",
        warn && "border-[var(--chop)]/40",
      )}
    >
      <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
        {title}
      </p>
      <dl className="mt-4 space-y-2">
        {rows.map(([key, value]) => (
          <div key={key} className="grid grid-cols-[88px_1fr] gap-3 text-sm">
            <dt className="text-muted-foreground">{key}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function SeverityMark({ severity }: { severity: FindingSeverity }) {
  const tone =
    severity === "critical"
      ? "bg-[var(--chop)] text-white"
      : severity === "high"
        ? "bg-amber-200 text-amber-950"
        : severity === "medium"
          ? "bg-stone-200 text-stone-800"
          : "bg-emerald-100 text-emerald-900";
  return (
    <span className={cn("rounded-full px-2 py-0.5 font-mono text-[10px] uppercase", tone)}>
      {severity}
    </span>
  );
}
