import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { requireEditor } from "@/lib/auth/session";
import { JobForm } from "../job-form";

export const metadata: Metadata = { title: "New job | Admin", robots: { index: false } };

export default async function NewJob() {
  await requireEditor();
  return (
    <>
      <PageHeader title="New job" back={{ href: "/admin/jobs", label: "All jobs" }} />
      <JobForm initial={{ title: "", slug: "", organisation: "", description: "", requirements: "", location: "", job_type: "", experience_level: "", specialisation: "", apply_url: "", apply_email: "", deadline: "", status: "draft" }} />
    </>
  );
}
