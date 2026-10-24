import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireApprovedMember } from "@/lib/auth/session";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "My profile", robots: { index: false } };

export default async function ProfilePage() {
  const { profile } = await requireApprovedMember("/dashboard/profile");
  if (!profile) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-h1 text-ink">My profile</h1>
      <ProfileForm profile={profile} />
    </div>
  );
}
