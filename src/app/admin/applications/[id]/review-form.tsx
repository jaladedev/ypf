"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Textarea } from "@/components/ui/form-controls";
import { reviewApplication, type ReviewState } from "./actions";

export function ReviewForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(
    reviewApplication,
    {},
  );
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <Textarea
        label="Note to applicant"
        name="note"
        rows={3}
        hint="Required when rejecting. Included in the email."
      />
      <FormAlert error={state.error} />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="decision" value="approved" loading={pending}>
          Approve
        </Button>
        <Button
          type="submit"
          name="decision"
          value="rejected"
          variant="danger"
          loading={pending}
        >
          Reject
        </Button>
      </div>
    </form>
  );
}
