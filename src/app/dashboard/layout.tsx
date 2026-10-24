import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { SiteShell } from "@/components/layout/site-shell";
import { DashboardNav } from "./nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell>
      <Container className="py-8">
        <DashboardNav />
        <div className="pt-8">{children}</div>
      </Container>
    </SiteShell>
  );
}
