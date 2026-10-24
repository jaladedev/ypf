import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { Container } from "./container";
import { CoverImage } from "./cover-image";

/**
 * Banner at the top of a page: image (or skyline placeholder) with a dark green
 * overlay, title, subtitle and optional actions. `size="lg"` is the home page hero.
 */
export function PageHero({
  title,
  subtitle,
  image,
  imageAlt,
  breadcrumbs,
  actions,
  size = "md",
  as: Tag = "h1",
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  image?: string | null;
  imageAlt?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  size?: "md" | "lg";
  as?: "h1" | "h2";
  /** Extra content under the subtitle (e.g. event meta). */
  children?: ReactNode;
}) {
  const large = size === "lg";
  return (
    <div className="on-dark bg-brand-950 relative isolate overflow-hidden text-white">
      <CoverImage src={image} alt={imageAlt} priority />
      <div
        aria-hidden
        className="from-brand-950/90 via-brand-950/70 to-brand-950/25 absolute inset-0 bg-linear-to-r"
      />
      <Container className={cn("relative", large ? "py-20 md:py-28" : "py-12 md:py-16")}>
        {breadcrumbs ? (
          <Breadcrumbs items={breadcrumbs} tone="light" className="mb-4" />
        ) : null}
        <Tag className={cn("max-w-3xl text-balance", large ? "text-display" : "text-h1")}>
          {title}
        </Tag>
        {subtitle ? (
          <p
            className={cn(
              "mt-4 max-w-2xl text-white/85",
              large ? "text-lead" : "text-base",
            )}
          >
            {subtitle}
          </p>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
        {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
      </Container>
    </div>
  );
}
