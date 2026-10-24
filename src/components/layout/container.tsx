import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Centred page-width wrapper with responsive side gutters. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("max-w-page mx-auto w-full px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
