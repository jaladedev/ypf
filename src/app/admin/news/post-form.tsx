"use client";

import { DraftBanner } from "@/components/admin/draft-banner";
import { ImageUpload } from "@/components/admin/image-upload";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/form-alert";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import { postCategoryLabels } from "@/lib/format";
import { savePost } from "./actions";

export type PostFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  cover_image: string;
  published_at: string;
  status: "draft" | "published" | "archived";
};

export function PostForm({ initial }: { initial: PostFormValues }) {
  const f = useAdminForm(savePost, `post:${initial.id ?? "new"}`);
  const e = f.state.fieldErrors ?? {};
  return (
    <form {...f.formProps} className="space-y-6">
      <DraftBanner draftAt={f.draftAt} savedAt={f.savedAt} onRestore={f.restore} onDiscard={f.discard} />
      <input type="hidden" name="id" value={initial.id ?? ""} />
      <Card>
        <CardBody className="space-y-5">
          <Input label="Title" name="title" requiredMark defaultValue={initial.title} error={e.title} maxLength={200} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Category" name="category" requiredMark defaultValue={initial.category} error={e.category}>
              <option value="">Choose…</option>
              {Object.entries(postCategoryLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </Select>
            <Input label="Publish date (optional)" name="published_at" type="datetime-local" defaultValue={initial.published_at} error={e.published_at} hint="Leave empty to publish immediately. A future date schedules it." />
          </div>
          <Textarea label="Short summary" name="excerpt" rows={3} defaultValue={initial.excerpt} error={e.excerpt} maxLength={500} hint="Shown on news cards (up to 500 characters)." />
          <ImageUpload name="cover_image" label="Cover image" bucket="media" folder="uploads" defaultValue={initial.cover_image} hint="JPG, PNG or WebP, up to 5 MB." />
          <MarkdownEditor name="body" label="Article" required defaultValue={initial.body} error={e.body} rows={20} hint="Use the toolbar for headings, lists, links and images." />
          <Input label="Web address (optional)" name="slug" defaultValue={initial.slug} error={e.slug} hint="Made from the title if left empty." />
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
