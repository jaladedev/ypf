import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { SiteShell } from "@/components/layout/site-shell";

// Temporary admin chrome; Phase 5 replaces this with the full admin shell.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell>
      <div className="border-line bg-surface border-b">
        <Container className="flex gap-6 py-3 text-sm font-medium">
          <Link href="/admin" className="text-ink hover:text-brand-700">
            Admin
          </Link>
          <Link href="/admin/applications" className="text-ink hover:text-brand-700">
            Applications
          </Link>
        </Container>
      </div>
      <Container className="py-8">{children}</Container>
    </SiteShell>
  );
}
