"use client";

import { DraftBanner } from "@/components/admin/draft-banner";
import { PersonRows } from "@/components/admin/repeat-rows";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/form-alert";
import { Input, Textarea } from "@/components/ui/form-controls";
import { saveSettings } from "./actions";

export type SettingsValues = {
  stats: Record<"members_label" | "reach_value" | "reach_label" | "audience_label", string>;
  contact: Record<"email" | "phone" | "address" | "hours", string>;
  social: Record<"linkedin" | "twitter" | "instagram" | "facebook", string>;
  partners: { name: string; logo_url: string }[];
};

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const f = useAdminForm(saveSettings, "settings");
  const e = f.state.fieldErrors ?? {};
  return (
    <form {...f.formProps} className="space-y-6">
      <DraftBanner draftAt={f.draftAt} savedAt={f.savedAt} onRestore={f.restore} onDiscard={f.discard} />
      <Card>
        <CardBody className="space-y-5">
          <h2 className="text-h3 text-ink">Home page figures</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Network label" name="stats.members_label" defaultValue={initial.stats.members_label} error={e["stats.members_label"]} hint="Shown under the members tile, for example “Growing Network”." />
            <Input label="Reach figure" name="stats.reach_value" defaultValue={initial.stats.reach_value} error={e["stats.reach_value"]} hint="For example “33”." />
            <Input label="Reach label" name="stats.reach_label" defaultValue={initial.stats.reach_label} error={e["stats.reach_label"]} hint="For example “Local governments”." />
            <Input label="Audience label" name="stats.audience_label" defaultValue={initial.stats.audience_label} error={e["stats.audience_label"]} />
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="space-y-5">
          <h2 className="text-h3 text-ink">Contact details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Email" name="contact.email" type="email" defaultValue={initial.contact.email} error={e["contact.email"]} />
            <Input label="Phone" name="contact.phone" defaultValue={initial.contact.phone} error={e["contact.phone"]} />
          </div>
          <Textarea label="Address" name="contact.address" rows={2} defaultValue={initial.contact.address} error={e["contact.address"]} />
          <Input label="Office hours" name="contact.hours" defaultValue={initial.contact.hours} error={e["contact.hours"]} />
        </CardBody>
      </Card>
      <Card>
        <CardBody className="space-y-5">
          <h2 className="text-h3 text-ink">Social links</h2>
          <p className="text-ink-muted text-sm">Full links starting with https://. Leave empty to hide.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="LinkedIn" name="social.linkedin" type="url" defaultValue={initial.social.linkedin} error={e["social.linkedin"]} />
            <Input label="X (Twitter)" name="social.twitter" type="url" defaultValue={initial.social.twitter} error={e["social.twitter"]} />
            <Input label="Instagram" name="social.instagram" type="url" defaultValue={initial.social.instagram} error={e["social.instagram"]} />
            <Input label="Facebook" name="social.facebook" type="url" defaultValue={initial.social.facebook} error={e["social.facebook"]} />
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-h3 text-ink">Partners and affiliations</h2>
          <PersonRows prefix="partner" legend="Shown at the bottom of the home page" addLabel="Add partner" nameLabel="Partner" titleLabel="" showTitle={false} photoLabel="Logo (optional)" round={false} initial={initial.partners.map((p) => ({ name: p.name, title: "", photo: p.logo_url }))} />
          {e.partners ? <p role="alert" className="text-danger-700 text-xs font-medium">{e.partners}</p> : null}
        </CardBody>
      </Card>
      <FormAlert error={f.state.error} />
      <Button type="submit" loading={f.pending}>Save settings</Button>
    </form>
  );
}
