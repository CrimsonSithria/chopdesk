export type Recommendation = "block" | "hold" | "verify" | "release";
export type FindingSeverity = "critical" | "high" | "medium" | "low";
export type Channel = "email" | "whatsapp" | "pdf" | "portal";
export type Engine = "gemini" | "local";
export type CaseStatus = Recommendation | "open";

export type BankAccount = {
  name: string;
  accountName: string;
  accountLast4: string;
  swift: string;
  country: string;
};

export type Vendor = {
  id: string;
  name: string;
  aliases: string[];
  country: string;
  city: string;
  typicalCurrency: string;
  typicalAmountMin: number;
  typicalAmountMax: number;
  bank: BankAccount;
  emails: string[];
  domains: string[];
  phones: string[];
  poPrefix: string;
  relationshipYears: number;
  notes: string;
};

export type ExtractedPayment = {
  vendorName: string;
  invoiceNumber: string;
  poNumber: string;
  amount: number;
  currency: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  dueDate: string;
  language: string;
  sender: string;
  domain: string;
};

export type Finding = {
  severity: FindingSeverity;
  title: string;
  detail: string;
  evidence: string;
};

export type VendorMatch = {
  status: "mismatch" | "partial" | "match" | "unknown";
  vendorId: string | null;
  expectedName: string;
  notes: string;
};

export type Verification = {
  channel: "whatsapp" | "phone" | "email";
  language: string;
  languageLabel: string;
  script: string;
  askFor: string[];
};

export type Analysis = {
  recommendation: Recommendation;
  riskScore: number;
  confidence: number;
  summary: string;
  extracted: ExtractedPayment;
  findings: Finding[];
  vendorMatch: VendorMatch;
  verification: Verification;
  memo: string;
  engine: Engine;
  model: string;
};

export type PaymentCase = {
  id: string;
  title: string;
  submittedAt: string;
  amount: number;
  currency: string;
  vendorName: string;
  country: string;
  channel: Channel;
  sourceLabel: string;
  sourceBody: string;
  status: CaseStatus;
  analysis: Analysis;
  decidedAt?: string;
};
