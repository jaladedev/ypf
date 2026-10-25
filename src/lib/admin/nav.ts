import type { AppRole } from "@/types/database";

export type AdminNavItem = {
  href: string;
  label: string;
  /** Lowest role that can see it. */
  min: "editor" | "admin";
  icon:
    | "dashboard"
    | "members"
    | "events"
    | "jobs"
    | "news"
    | "leadership"
    | "media"
    | "messages"
    | "settings"
    | "audit";
  badge?: "applications" | "messages";
};

export const adminNav: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", min: "editor", icon: "dashboard" },
  { href: "/admin/members", label: "Members", min: "admin", icon: "members", badge: "applications" },
  { href: "/admin/events", label: "Events", min: "editor", icon: "events" },
  { href: "/admin/jobs", label: "Jobs", min: "editor", icon: "jobs" },
  { href: "/admin/news", label: "News", min: "editor", icon: "news" },
  { href: "/admin/leadership", label: "Leadership", min: "editor", icon: "leadership" },
  { href: "/admin/media", label: "Pages & Media", min: "editor", icon: "media" },
  { href: "/admin/messages", label: "Messages", min: "admin", icon: "messages", badge: "messages" },
  { href: "/admin/settings", label: "Settings", min: "admin", icon: "settings" },
  { href: "/admin/audit", label: "Audit log", min: "admin", icon: "audit" },
];

export function navFor(role: AppRole | null) {
  return adminNav.filter((i) => (i.min === "editor" ? role === "editor" || role === "admin" : role === "admin"));
}
