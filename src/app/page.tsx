import Link from "next/link";
import { JudgesSheet } from "@/components/judges-sheet";
import { Stamp } from "@/components/stamp";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full border-[3px] border-[var(--chop)] font-display text-lg text-[var(--chop)]">
            印
          </span>
          <span className="font-display text-2xl">Chop</span>
        </div>
        <div className="flex items-center gap-2">
          <JudgesSheet />
          <Link
            href="/desk"
            className="rounded-full bg-foreground px-4 py-2 text-sm text-background"
          >
            Open the desk
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20">
        <section className="grid items-center gap-10 pt-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:pt-16">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-muted-foreground uppercase">
              JAPAC · BFSI · Google Cloud AI Builder Cup
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] tracking-tight md:text-7xl">
              Don&apos;t pay until it&apos;s chopped.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Across Southeast Asia, a company chop is still how you prove a
              document is real. Helios Trading&apos;s clerks now stamp outbound
              payments the same way: Gemini reads the slip, checks the vendor
              master, and writes the callback — in Bahasa, Japanese, or Thai —
              before a dollar leaves Singapore.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/desk/CHOP-1042"
                className="rounded-full bg-[var(--chop)] px-5 py-2.5 text-sm text-white"
              >
                See the Penang fraud
              </Link>
              <Link
                href="/intake"
                className="rounded-full border border-foreground/20 px-5 py-2.5 text-sm"
              >
                Drop your own slip
              </Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <Stamp recommendation="hold" score={86} className="size-[180px]" />
          </div>
        </section>

        <section className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            {
              kicker: "01",
              title: "The money is already walking out",
              body: "APAC BEC and vendor-account swaps hide in messy invoices, WhatsApp voice notes, and lookalike domains. Banks see them. A 12-person importer does not.",
            },
            {
              kicker: "02",
              title: "Chop is the missing stamp",
              body: "Not a chatbot. A four-step desk: extract, match the vendor chop, reason the risk, draft a human callback on the number you already trust.",
            },
            {
              kicker: "03",
              title: "Local first, then everywhere",
              body: "Built for Penang, Solo, Osaka, Bengaluru. The same graph works for any mid-market AP team that still pays from email.",
            },
          ].map((card) => (
            <article key={card.kicker} className="rounded-3xl border bg-card p-6">
              <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground">
                {card.kicker}
              </p>
              <h2 className="mt-3 font-display text-2xl">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {card.body}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border bg-card p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
                Live desk
              </p>
              <h2 className="mt-2 font-display text-3xl">
                Six slips. Two should never be chopped.
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Work as Priya Menon, AP lead at Helios Trading. Start with the
                HSBC Hong Kong redirect or the Jakarta “boss said pay now”
                WhatsApp.
              </p>
            </div>
            <Link
              href="/desk"
              className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background"
            >
              Sit at the desk
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
