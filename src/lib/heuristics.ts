import { findVendor, vendors } from "@/lib/vendors";
import type {
  Analysis,
  Channel,
  ExtractedPayment,
  Finding,
  Recommendation,
  Vendor,
} from "@/lib/types";

const urgency =
  /\b(urgent|today only|pay now|immediately|asap|within the hour|boss said|ceo said|do not call|wire now|sekarang|segera|今日中|すぐ)\b/i;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokens(value: string) {
  return new Set(normalize(value).split(" ").filter((part) => part.length > 2));
}

function overlap(a: string, b: string) {
  const left = tokens(a);
  const right = tokens(b);
  if (!left.size || !right.size) return 0;
  let hit = 0;
  for (const token of left) if (right.has(token)) hit += 1;
  return hit / Math.max(left.size, right.size);
}

function last4(account: string) {
  const digits = account.replace(/\D/g, "");
  return digits.slice(-4);
}

function extractAmount(text: string): { amount: number; currency: string } {
  const labeled = text.match(
    /\b(MYR|RM|IDR|Rp|JPY|¥|USD|US\$|SGD|S\$|THB|฿|INR|₹)\s*([0-9]{1,3}(?:[,\s][0-9]{3})+(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i,
  );
  if (labeled) {
    const raw = labeled[1].toUpperCase();
    const currency =
      raw === "RM"
        ? "MYR"
        : raw === "RP"
          ? "IDR"
          : raw === "¥"
            ? "JPY"
            : raw === "US$"
              ? "USD"
              : raw === "S$"
                ? "SGD"
                : raw === "฿"
                  ? "THB"
                  : raw === "₹"
                    ? "INR"
                    : raw;
    return {
      amount: Number(labeled[2].replace(/[,\s]/g, "")),
      currency,
    };
  }
  return { amount: 0, currency: "USD" };
}

function extractField(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

function guessVendor(text: string, hint?: string): Vendor | undefined {
  if (hint) {
    const hinted = findVendor(hint);
    if (hinted) return hinted;
  }
  const ranked = vendors
    .map((vendor) => ({
      vendor,
      score: Math.max(
        overlap(text, vendor.name),
        ...vendor.aliases.map((alias) => overlap(text, alias)),
        ...vendor.domains.map((domain) =>
          text.toLowerCase().includes(domain) ? 1 : 0,
        ),
      ),
    }))
    .sort((a, b) => b.score - a.score);
  return ranked[0] && ranked[0].score >= 0.18 ? ranked[0].vendor : undefined;
}

function extractDomain(text: string) {
  const match = text.match(/[\w.+-]+@([a-z0-9.-]+\.[a-z]{2,})/i);
  return match?.[1]?.toLowerCase() ?? "";
}

function extractSender(text: string) {
  return extractField(text, [
    /From:\s*(.+)/i,
    /Sender:\s*(.+)/i,
    /—\s*(.+)$/m,
  ]);
}

export function extractPayment(
  text: string,
  vendor?: Vendor,
): ExtractedPayment {
  const { amount, currency } = extractAmount(text);
  const accountNumber = extractField(text, [
    /A\/C(?:\s*No\.?)?[:\s]+([0-9\s-]{6,})/i,
    /Account(?:\s*number)?[:\s]+([0-9\s-]{6,})/i,
    /账号[:\s]+([0-9\s-]{6,})/i,
  ]);
  return {
    vendorName:
      extractField(text, [
        /Vendor[:\s]+(.+)/i,
        /Supplier[:\s]+(.+)/i,
        /Bill from[:\s]+(.+)/i,
      ]) ||
      vendor?.name ||
      "",
    invoiceNumber: extractField(text, [
      /Invoice(?:\s*No\.?)?[:\s#]+([A-Z0-9\/-]+)/i,
      /INV[:\s#]+([A-Z0-9\/-]+)/i,
    ]),
    poNumber: extractField(text, [
      /P\.?O\.?(?:\s*No\.?)?[:\s#]+([A-Z0-9-]+)/i,
    ]),
    amount,
    currency: vendor?.typicalCurrency && !amount ? vendor.typicalCurrency : currency,
    bankName: extractField(text, [
      /^Bank:\s*(.+)$/im,
      /Beneficiary bank[:\s]+(.+)/i,
    ]),
    accountNumber,
    accountName: extractField(text, [
      /Account name[:\s]+(.+)/i,
      /Beneficiary[:\s]+(.+)/i,
    ]),
    dueDate: extractField(text, [
      /Due[:\s]+(.+)/i,
      /Pay by[:\s]+(.+)/i,
    ]),
    language: /[぀-ヿ一-龯]/.test(text)
      ? "ja"
      : /[ก-๙]/.test(text)
        ? "th"
        : /\b(yang|dari|rekening|segera)\b/i.test(text)
          ? "id"
          : "en",
    sender: extractSender(text),
    domain: extractDomain(text),
  };
}

export function analyzeLocally(input: {
  sourceText: string;
  channel?: Channel;
  vendorHint?: string;
}): Analysis {
  const vendor = guessVendor(input.sourceText, input.vendorHint);
  const extracted = extractPayment(input.sourceText, vendor);
  const findings: Finding[] = [];
  const text = input.sourceText;

  if (vendor && extracted.domain && !vendor.domains.includes(extracted.domain)) {
    findings.push({
      severity: "critical",
      title: "Sender domain is not on file",
      detail: `This request arrived from ${extracted.domain}. Helios has only ever paid ${vendor.name} at ${vendor.domains.join(", ")}.`,
      evidence: extracted.sender || extracted.domain,
    });
  }

  if (vendor && extracted.accountNumber) {
    const incoming = last4(extracted.accountNumber);
    if (incoming && incoming !== vendor.bank.accountLast4) {
      findings.push({
        severity: "critical",
        title: "Beneficiary account does not match the chop on file",
        detail: `${vendor.name} is paid to ${vendor.bank.name} ···${vendor.bank.accountLast4} (${vendor.bank.country}). This slip asks for ···${incoming}.`,
        evidence: extracted.accountNumber,
      });
    }
  }

  if (vendor && extracted.amount > vendor.typicalAmountMax * 1.6) {
    findings.push({
      severity: "high",
      title: "Amount is far outside the usual band",
      detail: `Nine years of history for this vendor sit between ${vendor.typicalCurrency} ${vendor.typicalAmountMin.toLocaleString()} and ${vendor.typicalAmountMax.toLocaleString()}. This ask is ${extracted.amount.toLocaleString()}.`,
      evidence: `${extracted.currency} ${extracted.amount}`,
    });
  }

  if (vendor && extracted.poNumber && !extracted.poNumber.startsWith(vendor.poPrefix)) {
    findings.push({
      severity: "high",
      title: "Purchase order prefix is wrong",
      detail: `Helios issues ${vendor.poPrefix}-* to this supplier. The slip cites ${extracted.poNumber}.`,
      evidence: extracted.poNumber,
    });
  }

  if (urgency.test(text)) {
    findings.push({
      severity: "critical",
      title: "Urgency language typical of CEO / BEC fraud",
      detail:
        "The message pressures a same-day wire and discourages a callback — the most common pattern in JAPAC business-email compromise.",
      evidence: text.match(urgency)?.[0] ?? "urgent",
    });
  }

  if (input.channel === "whatsapp" && vendor) {
    findings.push({
      severity: "high",
      title: "Payment instruction arrived off-channel",
      detail: `${vendor.name} invoices Helios through ${vendor.emails[0]}. A WhatsApp pay-now is not how this relationship works.`,
      evidence: "whatsapp",
    });
  }

  if (
    vendor &&
    extracted.bankName &&
    !normalize(extracted.bankName).includes(normalize(vendor.bank.name).split(" ")[0] ?? "")
  ) {
    findings.push({
      severity: "high",
      title: "Bank name does not match the registered chop",
      detail: `On file: ${vendor.bank.name}. On this slip: ${extracted.bankName}.`,
      evidence: extracted.bankName,
    });
  }

  const critical = findings.some((finding) => finding.severity === "critical");
  const high = findings.some((finding) => finding.severity === "high");
  let recommendation: Recommendation = "release";
  if (critical && (urgency.test(text) || findings.length >= 2)) recommendation = "block";
  else if (critical) recommendation = "hold";
  else if (high) recommendation = "verify";

  if (!findings.length && vendor) {
    findings.push({
      severity: "low",
      title: "Matches the vendor chop on file",
      detail: `Domain, beneficiary, and amount sit inside the ${vendor.relationshipYears}-year pattern for ${vendor.name}.`,
      evidence: vendor.bank.accountLast4,
    });
  }

  if (!vendor) {
    findings.push({
      severity: "medium",
      title: "No vendor chop on file",
      detail:
        "Helios has no approved beneficiary for this name. Treat as a new supplier onboarding, not a payment.",
      evidence: extracted.vendorName || "unknown vendor",
    });
    recommendation = recommendation === "release" ? "verify" : recommendation;
  }

  const riskScore = Math.min(
    98,
    findings.reduce((sum, finding) => {
      return (
        sum +
        (finding.severity === "critical"
          ? 28
          : finding.severity === "high"
            ? 16
            : finding.severity === "medium"
              ? 8
              : 2)
      );
    }, recommendation === "release" ? 8 : 18),
  );

  const language =
    extracted.language === "ja"
      ? { code: "ja", label: "Japanese" }
      : extracted.language === "id"
        ? { code: "id", label: "Bahasa Indonesia" }
        : extracted.language === "th"
          ? { code: "th", label: "Thai" }
          : vendor?.country === "MY"
            ? { code: "ms", label: "Bahasa Melayu" }
            : { code: "en", label: "English" };

  const verificationChannel =
    input.channel === "whatsapp" || vendor?.country === "ID" || vendor?.country === "MY"
      ? "whatsapp"
      : vendor?.country === "JP"
        ? "phone"
        : "email";

  const script = buildScript({
    vendor,
    extracted,
    language: language.code,
    recommendation,
  });

  return {
    recommendation,
    riskScore,
    confidence: vendor ? 86 : 62,
    summary: buildSummary(recommendation, vendor, findings),
    extracted: {
      ...extracted,
      vendorName: extracted.vendorName || vendor?.name || "Unknown supplier",
    },
    findings,
    vendorMatch: {
      status: !vendor
        ? "unknown"
        : findings.some((finding) => finding.title.includes("account") || finding.title.includes("domain"))
          ? "mismatch"
          : findings.some((finding) => finding.severity === "high")
            ? "partial"
            : "match",
      vendorId: vendor?.id ?? null,
      expectedName: vendor?.name ?? "No chop on file",
      notes: vendor?.notes ?? "Unknown beneficiary. Do not pay from this desk.",
    },
    verification: {
      channel: verificationChannel,
      language: language.code,
      languageLabel: language.label,
      script,
      askFor: [
        "Call-back on the number already on the vendor master",
        "Confirm bank name, SWIFT, and last 4",
        "A stamped invoice from the registered domain",
      ],
    },
    memo: buildMemo(recommendation, vendor, findings, extracted),
    engine: "local",
    model: "chop-local-graph",
  };
}

function buildSummary(
  recommendation: Recommendation,
  vendor: Vendor | undefined,
  findings: Finding[],
) {
  const top = findings[0]?.title ?? "No material exceptions";
  if (recommendation === "block") {
    return `Block this wire. ${top}. Paying now is how Helios loses the money.`;
  }
  if (recommendation === "hold") {
    return `Hold the chop. ${vendor ? vendor.name + " " : ""}${top.toLowerCase()}.`;
  }
  if (recommendation === "verify") {
    return `Call the number on the vendor master before anyone chops this. ${top}.`;
  }
  return `${vendor?.name ?? "This vendor"} matches the chop on file. Safe to release after a two-eye check.`;
}

function buildMemo(
  recommendation: Recommendation,
  vendor: Vendor | undefined,
  findings: Finding[],
  extracted: ExtractedPayment,
) {
  const lines = [
    `Decision: ${recommendation.toUpperCase()}`,
    `Beneficiary claimed: ${extracted.vendorName || vendor?.name || "unknown"}`,
    `Amount: ${extracted.currency} ${extracted.amount || "—"}`,
    ...findings.slice(0, 3).map((finding) => `• ${finding.title}`),
    vendor
      ? `On-file chop: ${vendor.bank.name} ···${vendor.bank.accountLast4} / ${vendor.domains[0]}`
      : "On-file chop: none",
  ];
  return lines.join("\n");
}

function buildScript(input: {
  vendor?: Vendor;
  extracted: ExtractedPayment;
  language: string;
  recommendation: Recommendation;
}) {
  const name = input.vendor?.name ?? input.extracted.vendorName ?? "the supplier";
  const last = input.vendor?.bank.accountLast4 ?? "the account on file";
  if (input.language === "id") {
    return `Bu/Pak, Helios Trading di Singapura. Kami terima instruksi bayar ${input.extracted.invoiceNumber || "tagihan ini"} ke rekening baru. Tolong konfirmasi nama bank dan 4 digit terakhir rekening yang terdaftar di kontrak kita. Kami tidak akan transfer sebelum dikonfirmasi di nomor ini.`;
  }
  if (input.language === "ms") {
    return `Encik/Puan, Helios Trading Singapore. Kami terima arahan bayaran untuk ${name} ke akaun baharu. Sila sahkan nama bank dan 4 digit terakhir akaun yang kami ada dalam fail (${last}). Kami tidak akan hantar wang sebelum pengesahan ini.`;
  }
  if (input.language === "ja") {
    return `お世話になっております。Helios Trading（シンガポール）経理です。本日、${name}宛の支払先口座変更の案内を受領しました。契約上の口座（下4桁 ${last}）と相違がないか、この番号にてご確認をお願いいたします。確認前の送金はいたしません。`;
  }
  if (input.language === "th") {
    return `สวัสดีค่ะ บัญชี Helios Trading สิงคโปร์ เราได้รับคำสั่งโอนเงินของ ${name} ไปยังบัญชีใหม่ กรุณายืนยันธนาคารและเลขท้าย 4 ตัวที่อยู่ในสัญญา (${last}) เราจะยังไม่โอนจนกว่าจะยืนยันทางเบอร์นี้`;
  }
  return `Hi — this is Helios Trading AP in Singapore. We received a request to pay ${name} ${input.extracted.invoiceNumber ? `(${input.extracted.invoiceNumber}) ` : ""}to a beneficiary that does not match our vendor master (last 4 ${last}). Please confirm the bank name and last four on the account in our contract. We will not release funds until you confirm on this number.`;
}
