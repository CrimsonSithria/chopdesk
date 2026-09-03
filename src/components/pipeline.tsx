import { cn } from "@/lib/utils";

const steps = [
  { id: "read", label: "Read the slip", hint: "Extract payee, bank, amount" },
  { id: "chop", label: "Check the chop", hint: "Match the vendor master" },
  { id: "reason", label: "Reason the risk", hint: "Write the brief" },
  { id: "callback", label: "Draft the callback", hint: "Local language, real number" },
];

export function Pipeline({
  active = 4,
  pulsing = false,
}: {
  active?: number;
  pulsing?: boolean;
}) {
  return (
    <ol className="grid gap-2 sm:grid-cols-4">
      {steps.map((step, index) => {
        const done = index < active;
        return (
          <li
            key={step.id}
            className={cn(
              "rounded-2xl border px-3 py-3",
              done
                ? "border-foreground/15 bg-card"
                : "border-dashed border-border bg-transparent text-muted-foreground",
              pulsing && index === active - 1 && "animate-pulse",
            )}
          >
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase">
              0{index + 1}
            </p>
            <p className="mt-1 font-medium text-foreground">{step.label}</p>
            <p className="text-xs text-muted-foreground">{step.hint}</p>
          </li>
        );
      })}
    </ol>
  );
}
