"use client";

import { usePathname } from "next/navigation";
import { LinkTabs } from "@/components/ui/tabs";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/saved", label: "Saved jobs" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardNav() {
  const path = usePathname();
  return (
    <LinkTabs
      label="Member area"
      items={items.map((i) => ({ ...i, active: path === i.href }))}
    />
  );
}
