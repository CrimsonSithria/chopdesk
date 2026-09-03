"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { seedCases } from "@/lib/cases";
import { nextCaseId } from "@/lib/format";
import { findVendor } from "@/lib/vendors";
import type { Analysis, CaseStatus, Channel, PaymentCase } from "@/lib/types";

const STORAGE_KEY = "chopdesk.cases.v1";

type CasesContextValue = {
  cases: PaymentCase[];
  ready: boolean;
  upsert: (item: PaymentCase) => void;
  decide: (id: string, status: CaseStatus) => void;
  createFromAnalysis: (input: {
    sourceText: string;
    channel: Channel;
    analysis: Analysis;
  }) => PaymentCase;
};

const CasesContext = createContext<CasesContextValue | null>(null);

function readStorage(): PaymentCase[] {
  if (typeof window === "undefined") return seedCases;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedCases;
    const parsed = JSON.parse(raw) as PaymentCase[];
    if (!Array.isArray(parsed) || parsed.length === 0) return seedCases;
    const extras = parsed.filter(
      (item) => !seedCases.some((seed) => seed.id === item.id),
    );
    return [...extras, ...seedCases];
  } catch {
    return seedCases;
  }
}

const caseStore = {
  listeners: new Set<() => void>(),
  cases: seedCases as PaymentCase[],
  hydrated: false,
  snapshot() {
    if (typeof window !== "undefined" && !this.hydrated) {
      this.cases = readStorage();
      this.hydrated = true;
    }
    return this.cases;
  },
  set(next: PaymentCase[]) {
    this.cases = next;
    this.hydrated = true;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    this.listeners.forEach((listen) => listen());
  },
  subscribe(listen: () => void) {
    this.listeners.add(listen);
    return () => {
      this.listeners.delete(listen);
    };
  },
};

function useCaseList() {
  return useSyncExternalStore(
    caseStore.subscribe.bind(caseStore),
    () => caseStore.snapshot(),
    () => seedCases,
  );
}

export function CasesProvider({ children }: { children: React.ReactNode }) {
  const cases = useCaseList();
  const ready = caseStore.hydrated || typeof window === "undefined";

  const value = useMemo<CasesContextValue>(
    () => ({
      cases,
      ready,
      upsert: (item) => {
        caseStore.set([
          item,
          ...caseStore.snapshot().filter((entry) => entry.id !== item.id),
        ]);
      },
      decide: (id, status) => {
        caseStore.set(
          caseStore.snapshot().map((entry) =>
            entry.id === id
              ? { ...entry, status, decidedAt: new Date().toISOString() }
              : entry,
          ),
        );
      },
      createFromAnalysis: ({ sourceText, channel, analysis }) => {
        const vendor = analysis.vendorMatch.vendorId
          ? findVendor(analysis.vendorMatch.vendorId)
          : undefined;
        const current = caseStore.snapshot();
        const item: PaymentCase = {
          id: nextCaseId(current.map((entry) => entry.id)),
          title:
            analysis.extracted.vendorName ||
            vendor?.name ||
            "Unmatched payment request",
          submittedAt: new Date().toISOString(),
          amount: analysis.extracted.amount,
          currency: analysis.extracted.currency,
          vendorName: analysis.extracted.vendorName || vendor?.name || "Unknown",
          country: vendor?.country ?? "SG",
          channel,
          sourceLabel:
            channel === "whatsapp"
              ? "WhatsApp intake"
              : channel === "pdf"
                ? "Invoice intake"
                : "Email intake",
          sourceBody: sourceText,
          status: analysis.recommendation,
          analysis,
        };
        caseStore.set([item, ...current]);
        return item;
      },
    }),
    [cases, ready],
  );

  return (
    <CasesContext.Provider value={value}>{children}</CasesContext.Provider>
  );
}

export function useCases() {
  const context = useContext(CasesContext);
  if (!context) {
    throw new Error("useCases must be used inside CasesProvider");
  }
  return context;
}
