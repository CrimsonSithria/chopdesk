import { recommendationCopy } from "@/lib/format";
import type { Recommendation } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Stamp({
  recommendation,
  score,
  className,
}: {
  recommendation: Recommendation;
  score: number;
  className?: string;
}) {
  const copy = recommendationCopy(recommendation);
  const tone =
    recommendation === "release"
      ? "border-emerald-800 text-emerald-900"
      : recommendation === "verify"
        ? "border-amber-800 text-amber-950"
        : "border-[var(--chop)] text-[var(--chop)]";

  return (
    <div
      className={cn(
        "relative grid size-[148px] place-items-center rounded-full border-[6px] border-double bg-transparent text-center uppercase tracking-[0.22em]",
        "rotate-[-8deg] shadow-[0_0_0_1px_color-mix(in_oklch,var(--chop),transparent_70%)]",
        tone,
        className,
      )}
      aria-label={`${copy.label}, risk ${score}`}
    >
      <div className="absolute inset-2 rounded-full border border-current/40" />
      <div className="px-4">
        <p className="font-display text-[11px] leading-none">Helios · SG</p>
        <p className="mt-2 font-display text-[22px] leading-none tracking-[0.08em] normal-case">
          {copy.label}
        </p>
        <p className="mt-2 font-mono text-[10px] tracking-[0.28em]">
          RISK {score}
        </p>
      </div>
    </div>
  );
}
