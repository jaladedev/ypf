"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  CalendarDays,
  Briefcase,
  History,
  Image as ImageIcon,
  LayoutDashboard,
  Mail,
  Menu,
  Newspaper,
  Settings,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

const icons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  members: Users,
  events: CalendarDays,
  jobs: Briefcase,
  news: Newspaper,
  leadership: UserRound,
  media: ImageIcon,
  messages: Mail,
  settings: Settings,
  audit: History,
};

export type SidebarItem = { href: string; label: string; icon: string; count?: number };

export function AdminSidebar({ items, footer }: { items: SidebarItem[]; footer?: ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu after navigating.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset UI state on route change
    setOpen(false);
  }, [path]);

  const isActive = (href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(`${href}/`));

  return (
    <>
      <button
        type="button"
        className="rounded-control border-line text-ink flex h-10 items-center gap-2 border bg-white px-3 text-sm font-semibold lg:hidden"
        aria-expanded={open}
        aria-controls="admin-nav"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
        Menu
      </button>
      <div id="admin-nav" className={cn("w-full flex-1 flex-col gap-6 lg:flex", open ? "flex" : "hidden")}>
      <nav aria-label="Admin">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = icons[item.icon] ?? LayoutDashboard;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-control flex min-h-11 items-center gap-3 px-3 text-sm font-medium transition-colors",
                    active ? "bg-brand-800 text-white" : "text-ink hover:bg-brand-50",
                  )}
                >
                  <Icon className="size-[18px] shrink-0" aria-hidden />
                  <span className="flex-1">{item.label}</span>
                  {item.count ? (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        active ? "bg-white/20 text-white" : "bg-highlight text-brand-950",
                      )}
                    >
                      <span aria-hidden>{item.count > 99 ? "99+" : item.count}</span>
                      <span className="sr-only">{item.count} waiting</span>
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {footer}
      </div>
    </>
  );
}
