import type { Recommendation } from "@/lib/types";

const currencyLocales: Record<string, string> = {
  MYR: "en-MY",
  IDR: "id-ID",
  JPY: "ja-JP",
  USD: "en-US",
  THB: "th-TH",
  SGD: "en-SG",
  INR: "en-IN",
};

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(currencyLocales[currency] ?? "en-SG", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" || currency === "IDR" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function recommendationCopy(value: Recommendation) {
  switch (value) {
    case "block":
      return { label: "Do not chop", verb: "Block payment" };
    case "hold":
      return { label: "Hold the chop", verb: "Hold" };
    case "verify":
      return { label: "Verify, then chop", verb: "Request verify" };
    case "release":
      return { label: "Ready to chop", verb: "Chop & release" };
  }
}

export function nextCaseId(existing: string[]) {
  const nums = existing
    .map((id) => Number(id.replace(/^\D+/, "")))
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 1043) + 1;
  return `CHOP-${next}`;
}
