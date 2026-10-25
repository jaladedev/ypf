import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { requireEditor } from "@/lib/auth/session";
import { LeaderForm } from "../leader-form";

export const metadata: Metadata = { title: "Add leader | Admin", robots: { index: false } };

export default async function NewLeader() {
  await requireEditor();
  return (
    <>
      <PageHeader title="Add leader" back={{ href: "/admin/leadership", label: "Leadership" }} />
      <LeaderForm initial={{ name: "", role_title: "", group: "national_executive", photo_url: "", bio: "", is_active: true }} />
    </>
  );
}
