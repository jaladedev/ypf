"use client";

import { useId, useRef, type ReactNode } from "react";
import { Button, type ButtonVariant } from "@/components/ui/button";

/**
 * A button that asks "are you sure?" in a modal before running a server action.
 * Uses the native <dialog>, which traps focus and closes on Escape.
 */
export function ConfirmForm({
  action,
  fields,
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "danger",
  triggerVariant = "secondary",
  size = "sm",
  className,
}: {
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  variant?: ButtonVariant;
  triggerVariant?: ButtonVariant;
  size?: "sm" | "md";
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const uid = useId();
  return (
    <>
      <Button
        variant={triggerVariant}
        size={size}
        className={className}
        onClick={() => ref.current?.showModal()}
        aria-haspopup="dialog"
      >
        {trigger}
      </Button>
      <dialog
        ref={ref}
        aria-labelledby={`${uid}-t`}
        className="rounded-card shadow-pop m-auto w-[min(28rem,calc(100vw-2rem))] p-0 backdrop:bg-black/40"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <form action={action} className="space-y-4 p-6">
          {Object.entries(fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <h2 id={`${uid}-t`} className="text-h3 text-ink">
            {title}
          </h2>
          <div className="text-ink-muted text-sm">{description}</div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => ref.current?.close()}>
              Cancel
            </Button>
            <Button type="submit" variant={variant}>
              {confirmLabel}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
