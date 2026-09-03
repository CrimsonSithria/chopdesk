"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCases } from "@/components/cases-provider";
import { JudgesSheet } from "@/components/judges-sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/desk", label: "Payment desk" },
  { href: "/intake", label: "New slip" },
  { href: "/brief", label: "The brief" },
];

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cases } = useCases();
  const waiting = cases.filter(
    (item) => item.status === "block" || item.status === "hold" || item.status === "verify",
  ).length;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-[color-mix(in_oklch,var(--background),white_35%)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full border-[3px] border-[var(--chop)] font-display text-[15px] leading-none text-[var(--chop)]">
              印
            </span>
            <span>
              <span className="block font-display text-lg leading-none">Chop</span>
              <span className="block font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                Helios Trading · SG
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  pathname === link.href ||
                    (link.href !== "/desk" && pathname.startsWith(link.href)) ||
                    (link.href === "/desk" && pathname.startsWith("/desk"))
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {link.label}
                {link.href === "/desk" ? (
                  <span className="ml-2 font-mono text-[10px]">{waiting}</span>
                ) : null}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <JudgesSheet />
            <Link
              href="/intake"
              className="rounded-full bg-[var(--chop)] px-3 py-1.5 text-sm text-white md:hidden"
            >
              New slip
            </Link>
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return <ShellInner>{children}</ShellInner>;
}
