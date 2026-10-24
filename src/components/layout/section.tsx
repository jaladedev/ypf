import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Container } from "./container";

const tones = {
  white: "bg-white",
  surface: "bg-surface",
  dark: "on-dark bg-brand-950 text-white",
} as const;

/** A full-width page band with consistent vertical rhythm. */
export function Section({
  tone = "white",
  className,
  containerClassName,
  children,
  ...props
}: {
  tone?: keyof typeof tones;
  containerClassName?: string;
} & ComponentProps<"section">) {
  return (
    <section className={cn("py-12 md:py-16", tones[tone], className)} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

/** Section title with an optional "View all" link on the right. */
export function SectionHeading({
  title,
  description,
  href,
  linkLabel = "View all",
  className,
  as: Tag = "h2",
}: {
  title: ReactNode;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4", className)}>
      <div className="space-y-1.5">
        <Tag className={cn("text-ink", Tag === "h3" ? "text-h3" : "text-h2")}>
          {title}
        </Tag>
        {description ? <p className="text-ink-muted max-w-2xl">{description}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="text-brand-700 hover:text-brand-900 inline-flex shrink-0 items-center gap-1 text-sm font-semibold"
        >
          {linkLabel}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
