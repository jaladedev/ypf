import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/** Progress indicator for multi-step forms (e.g. Join YPF: Personal, Education, Professional). */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center" aria-label="Progress">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className={cn("flex items-center", i < steps.length - 1 && "flex-1")}
          >
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full text-xs font-semibold ring-1 ring-inset",
                  done && "bg-brand-800 ring-brand-800 text-white",
                  active && "text-brand-800 ring-brand-800 bg-white ring-2",
                  !done && !active && "text-ink-muted ring-line bg-white",
                )}
              >
                {done ? <Check className="size-4" aria-hidden /> : i + 1}
                <span className="sr-only">
                  {done ? " (completed)" : active ? " (current)" : ""}
                </span>
              </span>
              <span
                className={cn(
                  "text-xs",
                  active ? "text-ink font-semibold" : "text-ink-muted",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "mx-2 mb-5 h-0.5 flex-1 rounded",
                  done ? "bg-brand-800" : "bg-line",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
