import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { ReviewForm } from "./review-form";

export const metadata: Metadata = {
  title: "Review application | Admin",
  robots: { index: false },
};

const labels: Record<string, string> = {
  full_name: "Full name",
  phone: "Phone",
  lga: "Local government area",
  state: "State",
  institution: "Institution",
  career_stage: "Current stage",
  qualification: "Course / qualification",
  graduation_year: "Graduation year",
  specialisation: "Specialisation",
  organisation: "Organisation",
  linkedin_url: "LinkedIn",
  nitp_number: "NITP number",
  motivation: "Why join",
};

export default async function ReviewPage({
  params,
}: PageProps<"/admin/applications/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = await createClient();
  const { data: app } = await db
    .from("membership_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!app) notFound();
  const { data: auth } = await createAdminClient().auth.admin.getUserById(app.user_id);
  const answers = (app.answers ?? {}) as Record<string, unknown>;

  return (
    <div className="max-w-3xl space-y-6">
      <p>
        <Link
          href="/admin/applications"
          className="text-brand-700 text-sm font-medium hover:underline"
        >
          ← All applications
        </Link>
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-h1 text-ink">{String(answers.full_name ?? "Applicant")}</h1>
        <Badge
          tone={
            app.status === "approved"
              ? "brand"
              : app.status === "rejected"
                ? "danger"
                : "warning"
          }
        >
          {app.status}
        </Badge>
      </div>
      <Card>
        <CardBody>
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-ink-muted text-xs">Email</dt>
              <dd className="text-ink text-sm break-all">
                {auth.user?.email ?? "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted text-xs">Applied</dt>
              <dd className="text-ink text-sm">{formatDate(app.created_at)}</dd>
            </div>
            {Object.entries(labels)
              .filter(([k]) => k !== "motivation" && answers[k])
              .map(([k, label]) => (
                <div key={k}>
                  <dt className="text-ink-muted text-xs">{label}</dt>
                  <dd className="text-ink text-sm break-words">{String(answers[k])}</dd>
                </div>
              ))}
            {answers.motivation ? (
              <div className="sm:col-span-2">
                <dt className="text-ink-muted text-xs">{labels.motivation}</dt>
                <dd className="text-ink text-sm whitespace-pre-line">
                  {String(answers.motivation)}
                </dd>
              </div>
            ) : null}
          </dl>
        </CardBody>
      </Card>
      {app.status === "pending" ? (
        <Card>
          <CardBody className="space-y-3">
            <h2 className="text-h3 text-ink">Decision</h2>
            <ReviewForm id={app.id} />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="space-y-1 text-sm">
            <p>Decided {app.reviewed_at ? formatDate(app.reviewed_at) : ""}.</p>
            {app.review_note ? (
              <p className="text-ink-muted">Note: {app.review_note}</p>
            ) : null}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
