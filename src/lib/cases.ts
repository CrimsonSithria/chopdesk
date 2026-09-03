import { analyzeLocally } from "@/lib/heuristics";
import type { PaymentCase } from "@/lib/types";

const cheongMail = `From: Ah Beng <accounts@cheong-hardware-ap.com>
To: Priya Menon <priya.menon@helios.sg>
Subject: URGENT — updated bank details before Friday remittance

Priya,

Maybank is under maintenance for our export accounts this week. Please settle INV-CH-2291 to the temporary collection account below. Our auditor asked that you do not call the old Penang number.

Vendor: Cheong Hardware Sdn Bhd
Invoice No: INV-CH-2291
PO No: HH-CH-8841
Amount: MYR 384,200.00
Due: 5 Sept 2026

Beneficiary: CHEONG HARDWARE ASIA PACIFIC LTD
Bank: HSBC Hong Kong
A/C No: 451-283719-838
SWIFT: HSBCHKHHHKH

Pay now so the container is not held at Penang port.

— Ah Beng
Accounts, Cheong Hardware`;

const batikMail = `From: Ibu Ratna <finance@batiksentosa.co.id>
To: Priya Menon <priya.menon@helios.sg>
Subject: Tagihan tambahan run 14 — mohon dibayar minggu ini

Priya,

Invoice INV-BS-1408 for the additional print run.
Vendor: PT Batik Sentosa
PO No: EXT-9921
Amount: IDR 2,140,000,000
Bank: Bank Central Asia
Account name: PT BATIK SENTOSA
A/C No: 547 021 889 081

Please confirm when the remittance leaves.

Terima kasih,
Ibu Ratna`;

const tanakaMail = `From: 田中 聡 <s.tanaka@tanaka-bussan.co.jp>
To: Priya Menon <priya.menon@helios.sg>
Subject: 請求書 TB-4419 / Invoice

いつもお世話になっております。

Invoice No: TB-4419
Vendor: Tanaka Bussan Co., Ltd.
PO No: HH-TB-2204
Amount: JPY 12,400,000
Due: 18 Sept 2026

Bank: Mizuho Bank
Account name: TANAKA BUSSAN CO LTD
A/C No: 014-229188-2291

Please process as usual.

田中物産 経理`;

const cloudMail = `From: CloudKatha Billing <billing@cloudkatha.com>
To: ap@helios.sg
Subject: CloudKatha invoice CK-2026-09

Helios Trading Pte Ltd
Vendor: CloudKatha Soft Pvt Ltd
Invoice No: CK-2026-09
PO No: HH-CK-0012
Amount: USD 4,800.00
Due: 15 Sept 2026
Bank: HDFC Bank
Account name: CLOUDKATHA SOFT PRIVATE LIMITED
A/C No: 502000441166

Thank you.`;

const whatsappCeo = `WhatsApp · unknown +65 9XXX 4412 · 07:12 SGT

hi priya, david here. i am in jakarta with a customer and my laptop died.
need you to pay harbour crane SGD 91,000 today to this personal ocbc account so they release the yard.
boss said pay now. do not call the office, they are not in the loop.
Account name: DAVID LIM
Bank: OCBC
A/C No: 601-42819-229
send me the slip. urgent.`;

const riceMail = `From: Export Desk <export@maeklongrice.co.th>
To: priya.menon@helios.sg
Subject: Invoice MK-3310 — jasmine lot 8

Khun Priya,

Vendor: Mae Klong Rice Mill Co.
Invoice No: MK-3310
PO No: HH-MK-077
Amount: THB 860,000
Due: 12 Sept 2026
Bank: Kasikornbank
Account name: MAE KLONG RICE MILL CO
A/C No: 029-118-5529

Shipment left Samut Songkhram yesterday.

Kind regards`;

function seed(id: string, title: string, channel: PaymentCase["channel"], label: string, body: string, submittedAt: string, hint?: string): PaymentCase {
  const analysis = analyzeLocally({
    sourceText: body,
    channel,
    vendorHint: hint,
  });
  return {
    id,
    title,
    submittedAt,
    amount: analysis.extracted.amount,
    currency: analysis.extracted.currency,
    vendorName: analysis.extracted.vendorName,
    country: ({
      cheong: "MY",
      batik: "ID",
      tanaka: "JP",
      cloudkatha: "IN",
      mae: "TH",
      harbour: "SG",
    }[analysis.vendorMatch.vendorId ?? ""] ?? "SG"),
    channel,
    sourceLabel: label,
    sourceBody: body,
    status: analysis.recommendation,
    analysis: { ...analysis, engine: "local", model: "seed" },
  };
}

export const seedCases: PaymentCase[] = [
  seed(
    "CHOP-1042",
    "Penang fasteners — new HSBC Hong Kong account",
    "email",
    "Email from accounts@cheong-hardware-ap.com",
    cheongMail,
    "2026-09-03T01:12:00.000Z",
    "cheong",
  ),
  seed(
    "CHOP-1043",
    "CEO WhatsApp: pay Harbour Crane today",
    "whatsapp",
    "WhatsApp from +65 9XXX 4412",
    whatsappCeo,
    "2026-09-03T23:12:00.000Z",
    "harbour",
  ),
  seed(
    "CHOP-1041",
    "Solo batik mill — amount 4× usual",
    "email",
    "Email from finance@batiksentosa.co.id",
    batikMail,
    "2026-09-02T09:40:00.000Z",
    "batik",
  ),
  seed(
    "CHOP-1038",
    "Osaka parts — beneficiary last-4 changed",
    "email",
    "Email from s.tanaka@tanaka-bussan.co.jp",
    tanakaMail,
    "2026-09-01T04:18:00.000Z",
    "tanaka",
  ),
  seed(
    "CHOP-1036",
    "Bengaluru SaaS — September retainer",
    "pdf",
    "Invoice CK-2026-09.pdf",
    cloudMail,
    "2026-09-01T02:05:00.000Z",
    "cloudkatha",
  ),
  seed(
    "CHOP-1033",
    "Mae Klong jasmine lot 8",
    "email",
    "Email from export@maeklongrice.co.th",
    riceMail,
    "2026-08-31T08:22:00.000Z",
    "mae",
  ),
];
