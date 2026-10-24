import type { ReactNode } from "react";
import { Footer } from "./footer";
import { Header } from "./header";

/** Public site shell: skip link, header, main landmark, footer. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="rounded-control text-brand-900 shadow-pop sr-only z-50 bg-white px-4 py-2 text-sm font-semibold focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
