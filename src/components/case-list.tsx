"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCases } from "@/components/cases-provider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatMoney, formatWhen, recommendationCopy } from "@/lib/format";
import type { CaseStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const filters: { id: "all" | CaseStatus; label: string }[] = [
  { id: "all", label: "All slips" },
  { id: "block", label: "Do not chop" },
  { id: "hold", label: "Hold" },
  { id: "verify", label: "Verify" },
  { id: "release", label: "Ready" },
];

export function CaseList() {
  const { cases, ready } = useCases();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");

  const visible = useMemo(() => {
    return cases.filter((item) => {
      const haystack = `${item.id} ${item.title} ${item.vendorName}`.toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      const matchesFilter = filter === "all" || item.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [cases, filter, query]);

  const critical = cases.filter(
    (item) => item.status === "block" || item.status === "hold",
  ).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
            Helios AP · Priya Menon
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">
            Today&apos;s desk
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            {ready
              ? `${critical} slip${critical === 1 ? "" : "s"} should not leave the building yet.`
              : "Opening the ledger…"}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-right">
          <Stat label="On the desk" value={String(cases.length)} />
          <Stat label="Need a chop" value={String(critical)} />
          <Stat
            label="Waiting"
            value={String(cases.filter((item) => item.status !== "release").length)}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search vendor, case, or city"
          className="md:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                filter === item.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border bg-card">
        {visible.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-display text-2xl">Nothing matches that cut.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Clear the search, or drop a new slip on the intake desk.
            </p>
            <Link href="/intake" className="mt-4 inline-block text-sm underline">
              New slip
            </Link>
          </div>
        ) : (
          <ul>
            {visible.map((item, index) => {
              const copy = recommendationCopy(
                item.status === "open" ? item.analysis.recommendation : item.status,
              );
              return (
                <li key={item.id} className={cn(index > 0 && "border-t")}>
                  <Link
                    href={`/desk/${item.id}`}
                    className="grid gap-3 px-5 py-4 transition-colors hover:bg-accent/60 md:grid-cols-[140px_1fr_auto] md:items-center"
                  >
                    <div>
                      <p className="font-mono text-xs tracking-[0.16em]">
                        {item.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatWhen(item.submittedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.vendorName} · {item.country} · {item.channel}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 md:justify-end">
                      <p className="font-mono text-sm">
                        {item.amount
                          ? formatMoney(item.amount, item.currency)
                          : "—"}
                      </p>
                      <Badge
                        variant={
                          item.status === "release" ? "secondary" : "destructive"
                        }
                        className={cn(
                          "rounded-full",
                          item.status === "verify" &&
                            "bg-amber-100 text-amber-950",
                          item.status === "release" &&
                            "bg-emerald-100 text-emerald-950",
                        )}
                      >
                        {copy.label}
                      </Badge>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="font-display text-2xl leading-none">{value}</p>
    </div>
  );
}
