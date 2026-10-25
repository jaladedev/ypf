"use client";

import { useAdminForm } from "@/components/admin/use-admin-form";
import { DraftBanner } from "@/components/admin/draft-banner";
import { ImageUpload } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/form-controls";
import { FormAlert } from "@/components/ui/form-alert";
import { saveLeader } from "./actions";

export type LeaderFormValues = { id?: string; name: string; role_title: string; group: string; photo_url: string; bio: string; is_active: boolean };

export function LeaderForm({ initial }: { initial: LeaderFormValues }) {
  const f = useAdminForm(saveLeader, `leader:${initial.id ?? "new"}`);
  const e = f.state.fieldErrors ?? {};
  return (
    <form {...f.formProps} className="space-y-6">
      <DraftBanner draftAt={f.draftAt} savedAt={f.savedAt} onRestore={f.restore} onDiscard={f.discard} />
      <input type="hidden" name="id" value={initial.id ?? ""} />
      <Card>
        <CardBody className="space-y-5">
          <Input label="Name" name="name" requiredMark defaultValue={initial.name} error={e.name} maxLength={200} />
          <Input label="Role" name="role_title" requiredMark defaultValue={initial.role_title} error={e.role_title} hint="For example: National President" maxLength={200} />
          <Select label="Group" name="group" requiredMark defaultValue={initial.group} error={e.group}>
            <option value="national_executive">National Executive</option>
            <option value="coordinator">Coordinators</option>
          </Select>
          <ImageUpload name="photo_url" label="Photo" bucket="media" folder="uploads" defaultValue={initial.photo_url} round hint="A square portrait works best. JPG, PNG or WebP, up to 5 MB." />
          <Textarea label="Short bio (optional)" name="bio" rows={4} defaultValue={initial.bio} error={e.bio} maxLength={1000} />
          <Checkbox name="is_active" label="Show on the Leadership page" defaultChecked={initial.is_active} />
        </CardBody>
      </Card>
      <FormAlert error={f.state.error} />
      <Button type="submit" loading={f.pending}>Save</Button>
    </form>
  );
}
