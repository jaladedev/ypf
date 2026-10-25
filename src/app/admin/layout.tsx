import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { AdminSidebar, type SidebarItem } from "@/components/admin/sidebar";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Logo } from "@/components/layout/logo";
import { requireEditor } from "@/lib/auth/session";
import { navFor } from "@/lib/admin/nav";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin chrome. Layouts don't re-run on every client navigation, so each page and
 * server action still checks the role itself; the database (RLS) is the real boundary.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { role, profile, user } = await requireEditor();
  const nav = navFor(role);

  let applications = 0;
  let messages = 0;
  if (role === "admin") {
    const db = await createClient();
    const [a, m] = await Promise.all([
      db.from("membership_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
      db.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
    ]);
    applications = a.count ?? 0;
    messages = m.count ?? 0;
  }

  const items: SidebarItem[] = nav.map((n) => ({
    href: n.href,
    label: n.label,
    icon: n.icon,
    count: n.badge === "applications" ? applications : n.badge === "messages" ? messages : undefined,
  }));

  return (
    <div className="bg-surface min-h-dvh lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <a
        href="#main"
        className="rounded-control text-brand-900 shadow-pop sr-only z-50 bg-white px-4 py-2 text-sm font-semibold focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to main content
      </a>
      <aside className="border-line space-y-4 border-b bg-white p-4 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:space-y-6 lg:overflow-y-auto lg:border-r lg:border-b-0 lg:p-5">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          <span className="bg-brand-50 text-brand-800 rounded-full px-2.5 py-0.5 text-xs font-semibold">Admin</span>
        </div>
        <AdminSidebar
          items={items}
          footer={
            <div className="border-line space-y-3 border-t pt-4 lg:mt-auto">
          <div className="text-sm">
            <p className="text-ink truncate font-semibold">{profile?.full_name || user.email}</p>
            <p className="text-ink-muted capitalize">{role}</p>
          </div>
          <Link href="/" className="text-brand-700 hover:text-brand-900 inline-flex items-center gap-1.5 text-sm font-medium">
            View public site <ExternalLink className="size-3.5" aria-hidden />
          </Link>
          <Link href="/dashboard" className="text-ink-muted hover:text-ink block text-sm">
            Member area
          </Link>
          <SignOutButton className="w-full" />
                    </div>
          }
        />
      </aside>
      <main id="main" className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-5xl space-y-6">{children}</div>
      </main>
    </div>
  );
}
