import type { Vendor } from "@/lib/types";

export const vendors: Vendor[] = [
  {
    id: "cheong",
    name: "Cheong Hardware Sdn Bhd",
    aliases: ["Cheong Hardware", "CH Hardware", "Cheong Hardware Malaysia"],
    country: "MY",
    city: "Penang",
    typicalCurrency: "MYR",
    typicalAmountMin: 12000,
    typicalAmountMax: 140000,
    bank: {
      name: "Maybank",
      accountName: "CHEONG HARDWARE SDN BHD",
      accountLast4: "4412",
      swift: "MBBEMYKL",
      country: "MY",
    },
    emails: [
      "accounts@cheonghardware.com.my",
      "ah.beng@cheonghardware.com.my",
    ],
    domains: ["cheonghardware.com.my"],
    phones: ["+60 4 281 2200"],
    poPrefix: "HH-CH",
    relationshipYears: 9,
    notes:
      "Industrial fasteners. Always paid to Maybank Penang. Never used an overseas account.",
  },
  {
    id: "batik",
    name: "PT Batik Sentosa",
    aliases: ["Batik Sentosa", "Sentosa Textiles"],
    country: "ID",
    city: "Solo",
    typicalCurrency: "IDR",
    typicalAmountMin: 180_000_000,
    typicalAmountMax: 620_000_000,
    bank: {
      name: "Bank Central Asia",
      accountName: "PT BATIK SENTOSA",
      accountLast4: "9081",
      swift: "CENAIDJA",
      country: "ID",
    },
    emails: ["finance@batiksentosa.co.id", "ibu.ratna@batiksentosa.co.id"],
    domains: ["batiksentosa.co.id"],
    phones: ["+62 271 744 190"],
    poPrefix: "HH-BS",
    relationshipYears: 6,
    notes: "Print runs billed per PO. Spikes usually come with a revised PO.",
  },
  {
    id: "tanaka",
    name: "Tanaka Bussan Co., Ltd.",
    aliases: ["Tanaka Bussan", "田中物産"],
    country: "JP",
    city: "Osaka",
    typicalCurrency: "JPY",
    typicalAmountMin: 2_400_000,
    typicalAmountMax: 18_000_000,
    bank: {
      name: "MUFG Bank",
      accountName: "TANAKA BUSSAN CO LTD",
      accountLast4: "7730",
      swift: "BOTKJPJT",
      country: "JP",
    },
    emails: ["kaikei@tanaka-bussan.co.jp", "s.tanaka@tanaka-bussan.co.jp"],
    domains: ["tanaka-bussan.co.jp"],
    phones: ["+81 6 6441 2208"],
    poPrefix: "HH-TB",
    relationshipYears: 11,
    notes:
      "Precision parts. Bank last-4 has been 7730 for the entire relationship.",
  },
  {
    id: "cloudkatha",
    name: "CloudKatha Soft Pvt Ltd",
    aliases: ["CloudKatha", "Cloud Katha"],
    country: "IN",
    city: "Bengaluru",
    typicalCurrency: "USD",
    typicalAmountMin: 4200,
    typicalAmountMax: 5200,
    bank: {
      name: "HDFC Bank",
      accountName: "CLOUDKATHA SOFT PRIVATE LIMITED",
      accountLast4: "1166",
      swift: "HDFCINBB",
      country: "IN",
    },
    emails: ["billing@cloudkatha.com"],
    domains: ["cloudkatha.com"],
    phones: ["+91 80 4122 8800"],
    poPrefix: "HH-CK",
    relationshipYears: 3,
    notes: "Monthly SaaS. Invoice is USD 4,800 ± tax on the 1st.",
  },
  {
    id: "mae",
    name: "Mae Klong Rice Mill Co.",
    aliases: ["Mae Klong", "แม่กลองโรงสี"],
    country: "TH",
    city: "Samut Songkhram",
    typicalCurrency: "THB",
    typicalAmountMin: 420000,
    typicalAmountMax: 980000,
    bank: {
      name: "Kasikornbank",
      accountName: "MAE KLONG RICE MILL CO",
      accountLast4: "5529",
      swift: "KASITHBK",
      country: "TH",
    },
    emails: ["export@maeklongrice.co.th"],
    domains: ["maeklongrice.co.th"],
    phones: ["+66 34 711 440"],
    poPrefix: "HH-MK",
    relationshipYears: 4,
    notes: "Seasonal rice. Payment terms 14 days. Never urgent.",
  },
  {
    id: "harbour",
    name: "Harbour Crane Services Pte Ltd",
    aliases: ["Harbour Crane", "HCS"],
    country: "SG",
    city: "Singapore",
    typicalCurrency: "SGD",
    typicalAmountMin: 8000,
    typicalAmountMax: 46000,
    bank: {
      name: "DBS Bank",
      accountName: "HARBOUR CRANE SERVICES PTE LTD",
      accountLast4: "3391",
      swift: "DBSSSGSG",
      country: "SG",
    },
    emails: ["accounts@harbourcrane.sg"],
    domains: ["harbourcrane.sg"],
    phones: ["+65 6861 1044"],
    poPrefix: "HH-HC",
    relationshipYears: 5,
    notes: "Yard contractor. Invoices come from the portal, never WhatsApp.",
  },
];

export function findVendor(query: string): Vendor | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return vendors.find(
    (vendor) =>
      vendor.id === q ||
      vendor.name.toLowerCase() === q ||
      vendor.aliases.some((alias) => alias.toLowerCase() === q) ||
      vendor.aliases.some((alias) => q.includes(alias.toLowerCase())) ||
      q.includes(vendor.name.toLowerCase()),
  );
}

export function vendorDirectoryBrief() {
  return vendors.map((vendor) => ({
    id: vendor.id,
    name: vendor.name,
    city: vendor.city,
    country: vendor.country,
    domains: vendor.domains,
    emails: vendor.emails,
    bank: vendor.bank,
    typical: `${vendor.typicalCurrency} ${vendor.typicalAmountMin}–${vendor.typicalAmountMax}`,
    poPrefix: vendor.poPrefix,
    notes: vendor.notes,
  }));
}
