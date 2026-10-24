import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Loading placeholder. Pair with a route's loading.tsx or a Suspense fallback. */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-control bg-brand-100/70 relative overflow-hidden",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}
