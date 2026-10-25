"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { revalidatePublicSite } from "@/lib/admin/revalidate";
import { type ActionState } from "@/lib/admin/util";
import { settingsSchema } from "@/lib/admin/validation";
import { createClient } from "@/lib/supabase/server";

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const s = (k: string) => (formData.get(k) ?? "").toString();
  const names = formData.getAll("partner_name").map(String);
  const logos = formData.getAll("partner_photo").map(String);
  const partners = names.map((name, i) => ({ name, logo_url: logos[i] ?? "" })).filter((p) => p.name.trim());

  const parsed = settingsSchema.safeParse({
    stats: { members_label: s("stats.members_label"), reach_value: s("stats.reach_value"), reach_label: s("stats.reach_label"), audience_label: s("stats.audience_label") },
    contact: { email: s("contact.email"), phone: s("contact.phone"), address: s("contact.address"), hours: s("contact.hours") },
    social: { linkedin: s("social.linkedin"), twitter: s("social.twitter"), instagram: s("social.instagram"), facebook: s("social.facebook") },
    partners,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[i.path.slice(0, 2).join(".")] ??= i.message;
    if (parsed.error.issues.some((i) => i.path[0] === "partners")) fieldErrors.partners = "Check the partner list: names are required and logos must be uploaded.";
    return { fieldErrors, error: "Please fix the highlighted fields." };
  }
  const v = parsed.data;
  // Empty social links are dropped so the Contact page only shows real ones.
  const social = Object.fromEntries(Object.entries(v.social).filter(([, url]) => url));
  const items = v.partners.map((p) => ({ name: p.name, ...(p.logo_url ? { logo_url: p.logo_url } : {}) }));

  const db = await createClient();
  const { error } = await db.from("site_settings").upsert([
    { key: "stats", value: v.stats },
    { key: "contact", value: v.contact },
    { key: "social", value: social },
    { key: "partners", value: { items } },
  ]);
  if (error) {
    if (error.code === "42501" || /row-level security/.test(error.message)) return { error: "You don't have permission to do that." };
    console.error("settings save", error);
    return { error: "Couldn't save. Please try again." };
  }
  revalidatePublicSite();
  redirect("/admin/settings?saved=saved");
}
