"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input, Textarea } from "@/components/ui/form-controls";
import { sendContactMessage, type ContactState } from "./actions";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(
    sendContactMessage,
    {},
  );

  if (state.ok) {
    return (
      <div
        role="status"
        className="bg-brand-50 text-brand-900 rounded-control flex gap-3 p-5"
      >
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div>
          <p className="font-semibold">Message sent</p>
          <p className="mt-1 text-sm">
            Thank you. We&apos;ll reply to your email address soon.
          </p>
        </div>
      </div>
    );
  }
  const e = state.fieldErrors;
  return (
    <form action={action} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Name"
          name="name"
          autoComplete="name"
          required
          requiredMark
          error={e?.name}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          requiredMark
          error={e?.email}
        />
      </div>
      <Input label="Subject" name="subject" error={e?.subject} />
      <Textarea
        label="Message"
        name="message"
        rows={6}
        required
        requiredMark
        error={e?.message}
      />
      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <FormAlert error={state.error} />
      <Button type="submit" loading={pending}>
        Send message
      </Button>
    </form>
  );
}
