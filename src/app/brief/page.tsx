import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const criteria = [
  {
    weight: "40%",
    title: "Technical merit & Gen AI",
    body: "Gemini 2.5 Flash writes the investigator brief, vendor match, and local-language callback. A deterministic vendor graph runs first so the desk still works without a key, then Gemini reasons over that graph — not a blank chat box.",
  },
  {
    weight: "25%",
    title: "Problem alignment & impact",
    body: "Vendor-account takeover and CEO WhatsApp fraud are the payments losses JAPAC SMEs actually eat. Chop sits where the clerk already works: email, PDF, chat.",
  },
  {
    weight: "25%",
    title: "Innovation",
    body: "The company chop is the interface, not a dashboard of scores. The product is a stamp: extract, match, reason, callback. The metaphor is the differentiator.",
  },
  {
    weight: "10%",
    title: "Experience",
    body: "A paper ledger, a vermillion seal, and a queue a finance lead can run in three minutes. Built to be demoed standing up.",
  },
];

export default function BriefPage() {
  return (
    <AppShell>
      <article className="mx-auto w-full max-w-3xl px-4 py-10">
        <p className="font-mono text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
          Submission brief · one theme only
        </p>
        <h1 className="mt-3 font-display text-5xl tracking-tight">
          Chop, for the Google Cloud AI Builder Cup
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Theme: <strong className="text-foreground">BFSI — Intelligent Risk, Fraud &amp; Financial Experiences</strong>.
          A working prototype. Not a deck.
        </p>

        <section className="mt-10 space-y-4 text-[15px] leading-7">
          <p>
            Helios Trading is a composite of the mid-market importers that still
            move money from a shared inbox. Their suppliers sit in Penang, Solo,
            Osaka, Bengaluru, and Samut Songkhram. Their fraud looks like a
            helpful email: new bank, urgent port charges, please don&apos;t call
            the old number.
          </p>
          <p>
            Chop gives that inbox a stamp. The clerk drops the slip. The desk
            extracts payee, bank, amount, and domain; compares them to the
            vendor master; writes findings a human can defend; and drafts the
            verification in the language the supplier actually answers.
          </p>
        </section>

        <section className="mt-10 grid gap-3">
          {criteria.map((item) => (
            <div key={item.title} className="rounded-3xl border bg-card p-5">
              <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
                Judging · {item.weight}
              </p>
              <h2 className="mt-1 font-display text-2xl">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border bg-card p-5 text-sm leading-6">
          <h2 className="font-display text-2xl">What you still need for October 4</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Team of 2–4 working professionals, all 21+, all based in JAPAC.</li>
            <li>
              Deploy this app to Cloud Run or Firebase. The Dockerfile is in the
              repo. Set <code className="text-foreground">GEMINI_API_KEY</code>.
            </li>
            <li>Public GitHub, a 3-minute demo video, and this brief exported to PDF.</li>
            <li>One theme only. Do not also file this under Future of Work.</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/desk" className="rounded-full bg-foreground px-4 py-2 text-background">
              Run the prototype
            </Link>
            <Link href="/intake" className="rounded-full border px-4 py-2">
              Analyze a slip
            </Link>
          </div>
        </section>
      </article>
    </AppShell>
  );
}
