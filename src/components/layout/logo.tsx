import Link from "next/link";
import { cn } from "@/lib/cn";

/** Simple skyline mark. Replace with the official YPF logo file when available. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-9", className)} aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-brand-800" />
      <path
        d="M7 25V15h4.5v10H7Zm6.75 0V7h4.5v18h-4.5ZM20.5 25v-7H25v7h-4.5Z"
        fill="#4ade80"
      />
    </svg>
  );
}

export function Logo({
  tone = "dark",
  className,
}: {
  /** "dark" = for light backgrounds; "light" = for dark green backgrounds. */
  tone?: "dark" | "light";
  className?: string;
}) {
  const light = tone === "light";
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={light ? "[&_rect]:fill-white/10" : undefined} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-lg font-bold tracking-tight",
            light ? "text-white" : "text-brand-900",
          )}
        >
          YPF
        </span>
        {/* Keeps the link's accessible name "YPF Young Planners Forum" at every width. */}
        <span className="sr-only sm:hidden"> Young Planners Forum</span>
        <span
          className={cn(
            "mt-1 hidden text-[0.65rem] sm:block",
            light ? "text-white/70" : "text-ink-muted",
          )}
        >
          {" "}
          Young Planners Forum
        </span>
      </span>
    </Link>
  );
}
