"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedMember } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isOwnStorageUrl } from "@/lib/admin/util";
import { profileSchema } from "@/lib/validation";

export type ProfileState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const { user } = await requireApprovedMember("/dashboard/profile");
  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone") || undefined,
    institution: formData.get("institution") || undefined,
    career_stage: formData.get("career_stage") || undefined,
    specialisation: formData.get("specialisation") || undefined,
    bio: formData.get("bio") || undefined,
    linkedin_url: formData.get("linkedin_url") || undefined,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { fieldErrors };
  }
  const v = parsed.data;
  const db = await createClient();
  const { error } = await db
    .from("profiles")
    .update({
      full_name: v.full_name,
      phone: v.phone ?? null,
      institution: v.institution ?? null,
      career_stage: v.career_stage ?? null,
      specialisation: v.specialisation ?? null,
      bio: v.bio ?? null,
      linkedin_url: v.linkedin_url || null,
    })
    .eq("id", user.id);
  if (error) {
    console.error("profile update", error);
    return { error: "We couldn't save your changes. Please try again." };
  }
  revalidatePath("/dashboard", "layout");
  return { message: "Profile saved." };
}

/**
 * Saves the profile photo. The image itself was uploaded straight to the `avatars`
 * bucket by the browser (storage policy: own folder only); here we only accept a URL
 * that points into the signed-in member's own folder.
 */
export async function updateAvatar(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const { user } = await requireApprovedMember("/dashboard/profile");
  const url = String(formData.get("avatar_url") ?? "").trim();
  if (url && !isOwnStorageUrl(url, "avatars", user.id)) {
    return { error: "That photo couldn't be used. Please upload it again." };
  }
  const db = await createClient();
  const { error } = await db.from("profiles").update({ avatar_url: url || null }).eq("id", user.id);
  if (error) {
    console.error("avatar update", error);
    return { error: "We couldn't save your photo. Please try again." };
  }
  revalidatePath("/dashboard", "layout");
  return { message: url ? "Photo saved." : "Photo removed." };
}
