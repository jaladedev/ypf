import type { ReactNode } from "react";

/** Icon + big value + label, used in the home page stats strip. */
export function StatTile({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-brand-50 text-brand-700 grid size-11 shrink-0 place-items-center rounded-full">
        {icon}
      </span>
      <div>
        <p className="text-ink text-lg leading-tight font-bold">{value}</p>
        <p className="text-ink-muted text-xs">{label}</p>
      </div>
    </div>
  );
}
