import type { Metadata } from "next";
import { Flash } from "@/components/admin/flash";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm, type SettingsValues } from "./settings-form";

export const metadata: Metadata = { title: "Settings | Admin", robots: { index: false } };

const str = (o: unknown, k: string, d = "") => {
  const v = o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined;
  return typeof v === "string" ? v : d;
};

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  await requireAdmin();
  const sp = await searchParams;
  const db = await createClient();
  const { data } = await db.from("site_settings").select("key,value");
  const m = new Map((data ?? []).map((r) => [r.key, r.value]));
  const stats = m.get("stats"), contact = m.get("contact"), social = m.get("social");
  const items = (m.get("partners") as { items?: { name?: string; logo_url?: string }[] } | undefined)?.items;

  const initial: SettingsValues = {
    stats: {
      members_label: str(stats, "members_label", "Growing Network"),
      reach_value: str(stats, "reach_value", "36+"),
      reach_label: str(stats, "reach_label", "States & FCT"),
      audience_label: str(stats, "audience_label", "Students - Graduates MNITP/RTP"),
    },
    contact: { email: str(contact, "email"), phone: str(contact, "phone"), address: str(contact, "address"), hours: str(contact, "hours") },
    social: { linkedin: str(social, "linkedin"), twitter: str(social, "twitter"), instagram: str(social, "instagram"), facebook: str(social, "facebook") },
    partners: Array.isArray(items)
      ? items.filter((p) => p?.name).map((p) => ({ name: p.name!, logo_url: p.logo_url ?? "" }))
      : ["Nigerian Institute of Town Planners", "Town Planners Registration Council of Nigeria", "Commonwealth Association of Planners", "UN-Habitat"].map((name) => ({ name, logo_url: "" })),
  };
  return (
    <>
      <PageHeader title="Site settings" description="Details shown on the home and contact pages." />
      <Flash code={sp.saved} />
      <SettingsForm initial={initial} />
    </>
  );
}
