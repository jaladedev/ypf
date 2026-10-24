import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { Json, LeaderRow } from "@/types/database";

export type SiteStats = {
  members_label: string;
  reach_value: string;
  reach_label: string;
  audience_label: string;
};
export type ContactInfo = {
  email: string;
  phone: string;
  address: string;
  hours: string;
};
export type SocialLinks = Partial<
  Record<"linkedin" | "twitter" | "instagram" | "facebook", string>
>;

const defaults = {
  stats: {
    members_label: "Growing Network",
    reach_value: "36+",
    reach_label: "States & FCT",
    audience_label: "Students - Graduates MNITP/RTP",
  } satisfies SiteStats,
  contact: { email: "", phone: "", address: "", hours: "" } satisfies ContactInfo,
  social: {} satisfies SocialLinks,
};

/** Reads site_settings; missing keys fall back to defaults so pages never break. */
export async function getSiteSettings() {
  const db = createPublicClient();
  const { data, error } = await db.from("site_settings").select("key,value");
  if (error) throw new Error(`site settings: ${error.message}`);
  const map = new Map<string, Json>(data.map((r) => [r.key, r.value]));
  const pick = <T extends object>(key: string, fallback: T): T => {
    const v = map.get(key);
    return v && typeof v === "object" && !Array.isArray(v)
      ? { ...fallback, ...(v as object) }
      : fallback;
  };
  return {
    stats: pick<SiteStats>("stats", defaults.stats),
    contact: pick<ContactInfo>("contact", defaults.contact),
    social: pick<SocialLinks>("social", defaults.social),
  };
}

export type Leader = Pick<
  LeaderRow,
  "name" | "role_title" | "group" | "photo_url" | "bio"
>;

export async function getLeaders(): Promise<Leader[]> {
  const db = createPublicClient();
  const { data, error } = await db
    .from("leaders")
    .select("name,role_title,group,photo_url,bio")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`leaders: ${error.message}`);
  return data as Leader[];
}
