import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/cn";

/** Shown when a list has no items (no events, no jobs match the filters, etc.). */
export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border-line bg-surface flex flex-col items-center gap-3 border border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      <span className="bg-brand-50 text-brand-700 grid size-12 place-items-center rounded-full">
        {icon ?? <Inbox className="size-6" aria-hidden />}
      </span>
      <h3 className="text-h3 text-ink">{title}</h3>
      {description ? (
        <p className="text-ink-muted max-w-md text-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
