import type { ReactNode } from "react";
import { SkylineArt } from "@/components/layout/cover-image";
import { Logo } from "@/components/layout/logo";

/**
 * Auth page layout: form card on the left, brand panel on large screens
 * (like the Login mockup). Used by login, password reset and holding pages.
 */
export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-2">
      <main
        id="main"
        className="flex flex-col justify-center bg-white px-4 py-10 sm:px-10"
      >
        <div className="mx-auto w-full max-w-md space-y-8">
          <Logo />
          <div className="space-y-2">
            <h1 className="text-h1 text-ink">{title}</h1>
            {description ? <p className="text-ink-muted">{description}</p> : null}
          </div>
          {children}
        </div>
      </main>
      <aside
        aria-hidden
        className="on-dark bg-brand-950 relative hidden overflow-hidden lg:flex lg:items-end"
      >
        <SkylineArt />
        <div className="from-brand-950/90 via-brand-950/20 absolute inset-0 bg-linear-to-t to-transparent" />
        <div className="relative p-12">
          <p className="text-display text-white">
            Together for <span className="text-highlight">better cities</span>
          </p>
        </div>
      </aside>
    </div>
  );
}
