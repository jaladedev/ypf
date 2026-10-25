"use client";

import { useActionState } from "react";
import { ImageUpload } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { updateAvatar, type ProfileState } from "./actions";

export function AvatarForm({ userId, current }: { userId: string; current: string | null }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateAvatar, {});
  return (
    <form action={action} className="max-w-2xl space-y-3">
      <ImageUpload name="avatar_url" label="Profile photo" bucket="avatars" folder={userId} defaultValue={current} round hint="JPG, PNG or WebP, up to 2 MB. Press “Save photo” after choosing." />
      <FormAlert error={state.error} message={state.message} />
      <Button type="submit" size="sm" variant="secondary" loading={pending}>Save photo</Button>
    </form>
  );
}
