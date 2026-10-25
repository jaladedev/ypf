"use client";

import { DraftBanner } from "@/components/admin/draft-banner";
import { ImageUpload } from "@/components/admin/image-upload";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { PersonRows } from "@/components/admin/repeat-rows";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/form-alert";
import { Input, Textarea } from "@/components/ui/form-controls";
import { saveEvent } from "./actions";

export type EventFormValues = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  starts_at: string;
  ends_at: string;
  venue: string;
  city: string;
  cover_image: string;
  registration_deadline: string;
  capacity: string;
  features: string;
  status: "draft" | "published" | "archived";
  speakers: { name: string; title: string; photo: string }[];
};

export function EventForm({ initial }: { initial: EventFormValues }) {
  const f = useAdminForm(saveEvent, `event:${initial.id ?? "new"}`);
  const e = f.state.fieldErrors ?? {};
  return (
    <form {...f.formProps} className="space-y-6">
      <DraftBanner draftAt={f.draftAt} savedAt={f.savedAt} onRestore={f.restore} onDiscard={f.discard} />
      <input type="hidden" name="id" value={initial.id ?? ""} />
      <Card>
        <CardBody className="space-y-5">
          <h2 className="text-h3 text-ink">Details</h2>
          <Input label="Title" name="title" requiredMark defaultValue={initial.title} error={e.title} maxLength={200} />
          <Input label="Web address (optional)" name="slug" defaultValue={initial.slug} error={e.slug} hint="Made from the title if left empty. Example: annual-general-meeting" />
          <Textarea label="Short summary" name="summary" rows={3} defaultValue={initial.summary} error={e.summary} maxLength={500} hint="Shown on cards and in search results (up to 500 characters)." />
          <MarkdownEditor name="body" label="Full description" defaultValue={initial.body} error={e.body} rows={12} />
          <ImageUpload name="cover_image" label="Cover image" bucket="media" folder="uploads" defaultValue={initial.cover_image} hint="Wide image works best (for example 1600 x 900). JPG, PNG or WebP, up to 5 MB." />
        </CardBody>
      </Card>
      <Card>
        <CardBody className="space-y-5">
          <h2 className="text-h3 text-ink">When and where</h2>
          <p className="text-ink-muted text-sm">All times are Nigerian time (WAT).</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Starts" name="starts_at" type="datetime-local" requiredMark defaultValue={initial.starts_at} error={e.starts_at} />
            <Input label="Ends" name="ends_at" type="datetime-local" defaultValue={initial.ends_at} error={e.ends_at} />
            <Input label="Venue" name="venue" defaultValue={initial.venue} error={e.venue} />
            <Input label="City" name="city" defaultValue={initial.city} error={e.city} />
            <Input label="Registration closes" name="registration_deadline" type="datetime-local" defaultValue={initial.registration_deadline} error={e.registration_deadline} hint="Leave empty to close registration when the event starts." />
            <Input label="Capacity" name="capacity" inputMode="numeric" defaultValue={initial.capacity} error={e.capacity} hint="Leave empty for unlimited places." />
          </div>
          <Textarea label="Highlights" name="features" rows={4} defaultValue={initial.features} hint="One per line, for example: Networking opportunities" />
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <PersonRows prefix="speaker" legend="Speakers" addLabel="Add speaker" nameLabel="Speaker" titleLabel="Title or organisation" initial={initial.speakers} />
        </CardBody>
      </Card>
      <FormAlert error={f.state.error} />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" name="intent" value="save" variant="secondary" loading={f.pending}>
          {initial.status === "published" ? "Save changes" : "Save as draft"}
        </Button>
        {initial.status !== "published" ? (
          <Button type="submit" name="intent" value="publish" loading={f.pending}>
            Publish
          </Button>
        ) : null}
        <p className="text-ink-muted text-sm">
          Status: <strong className="capitalize">{initial.status}</strong>
        </p>
      </div>
    </form>
  );
}
