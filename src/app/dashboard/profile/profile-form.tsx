"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import type { ProfileRow } from "@/types/database";
import { updateProfile, type ProfileState } from "./actions";

export function ProfileForm({ profile }: { profile: ProfileRow }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    {},
  );
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="max-w-2xl space-y-5" noValidate>
      <Input
        label="Full name"
        name="full_name"
        requiredMark
        defaultValue={profile.full_name}
        error={e.full_name}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Phone"
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          error={e.phone}
        />
        <Select
          label="Current stage"
          name="career_stage"
          defaultValue={profile.career_stage ?? ""}
        >
          <option value="">Not specified</option>
          <option value="student">Student</option>
          <option value="graduate">Recent graduate</option>
          <option value="early_career">Early-career professional</option>
          <option value="professional">Professional</option>
        </Select>
      </div>
      <Input
        label="Institution"
        name="institution"
        defaultValue={profile.institution ?? ""}
        error={e.institution}
      />
      <Input
        label="Specialisation"
        name="specialisation"
        defaultValue={profile.specialisation ?? ""}
        error={e.specialisation}
      />
      <Input
        label="LinkedIn"
        name="linkedin_url"
        type="url"
        defaultValue={profile.linkedin_url ?? ""}
        error={e.linkedin_url}
      />
      <Textarea
        label="Short bio"
        name="bio"
        rows={4}
        defaultValue={profile.bio ?? ""}
        error={e.bio}
      />
      <FormAlert error={state.error} message={state.message} />
      <Button type="submit" loading={pending}>
        Save changes
      </Button>
    </form>
  );
}
