"use client";

import { DraftBanner } from "@/components/admin/draft-banner";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/form-alert";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import { experienceLabels, jobTypeLabels } from "@/lib/format";
import { saveJob } from "./actions";

export type JobFormValues = {
  id?: string;
  title: string;
  slug: string;
  organisation: string;
  description: string;
  requirements: string;
  location: string;
  job_type: string;
  experience_level: string;
  specialisation: string;
  apply_url: string;
  apply_email: string;
  deadline: string;
  status: "draft" | "published" | "archived";
};

export function JobForm({ initial }: { initial: JobFormValues }) {
  const f = useAdminForm(saveJob, `job:${initial.id ?? "new"}`);
  const e = f.state.fieldErrors ?? {};
  return (
    <form {...f.formProps} className="space-y-6">
      <DraftBanner draftAt={f.draftAt} savedAt={f.savedAt} onRestore={f.restore} onDiscard={f.discard} />
      <input type="hidden" name="id" value={initial.id ?? ""} />
      <Card>
        <CardBody className="space-y-5">
          <h2 className="text-h3 text-ink">The role</h2>
          <Input label="Job title" name="title" requiredMark defaultValue={initial.title} error={e.title} maxLength={200} />
          <Input label="Organisation" name="organisation" requiredMark defaultValue={initial.organisation} error={e.organisation} maxLength={200} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Job type" name="job_type" requiredMark defaultValue={initial.job_type} error={e.job_type}>
              <option value="">Choose…</option>
              {Object.entries(jobTypeLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </Select>
            <Select label="Experience level" name="experience_level" defaultValue={initial.experience_level} error={e.experience_level}>
              <option value="">Not specified</option>
              {Object.entries(experienceLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </Select>
            <Input label="Location" name="location" defaultValue={initial.location} error={e.location} hint="For example: Ibadan, Oyo State, or Remote" />
            <Input label="Specialisation" name="specialisation" defaultValue={initial.specialisation} error={e.specialisation} hint="For example: Urban design" />
          </div>
          <MarkdownEditor name="description" label="Description" required defaultValue={initial.description} error={e.description} rows={10} />
          <Textarea label="Requirements" name="requirements" rows={5} defaultValue={initial.requirements} error={e.requirements} hint="One requirement per line." />
        </CardBody>
      </Card>
      <Card>
        <CardBody className="space-y-5">
          <h2 className="text-h3 text-ink">How to apply</h2>
          <p className="text-ink-muted text-sm">Applications happen outside this site. Add a link, an email address, or both.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Application link" name="apply_url" type="url" defaultValue={initial.apply_url} error={e.apply_url} placeholder="https://" />
            <Input label="Application email" name="apply_email" type="email" defaultValue={initial.apply_email} error={e.apply_email} />
            <Input label="Closing date" name="deadline" type="date" defaultValue={initial.deadline} error={e.deadline} hint="The job hides itself after this date. Leave empty for no deadline." />
            <Input label="Web address (optional)" name="slug" defaultValue={initial.slug} error={e.slug} hint="Made from the title if left empty." />
          </div>
        </CardBody>
      </Card>
      <FormAlert error={f.state.error} />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" name="intent" value="save" variant="secondary" loading={f.pending}>
          {initial.status === "published" ? "Save changes" : "Save as draft"}
        </Button>
        {initial.status !== "published" ? <Button type="submit" name="intent" value="publish" loading={f.pending}>Publish</Button> : null}
        <p className="text-ink-muted text-sm">Status: <strong className="capitalize">{initial.status}</strong></p>
      </div>
    </form>
  );
}
