import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireApprovedMember } from "@/lib/auth/session";
import { AvatarForm } from "./avatar-form";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "My profile", robots: { index: false } };

export default async function ProfilePage() {
  const { user, profile } = await requireApprovedMember("/dashboard/profile");
  if (!profile) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-h1 text-ink">My profile</h1>
      <AvatarForm userId={user.id} current={profile.avatar_url} />
      <ProfileForm profile={profile} />
    </div>
  );
}
