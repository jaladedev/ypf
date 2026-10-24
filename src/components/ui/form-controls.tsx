import { useId, type ComponentProps, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Form controls with built-in label, hint and error text, wired up with the
 * right aria attributes. They work with react-hook-form (`{...register("x")}`)
 * and with plain server-action forms.
 */

const controlBase =
  "block w-full rounded-control border bg-white px-3.5 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus-visible:border-brand-600 focus-visible:outline-2 focus-visible:outline-brand-600/40 focus-visible:outline-offset-0 disabled:bg-surface disabled:text-ink-muted";

function controlClass(error?: string, extra?: string) {
  return cn(
    controlBase,
    error ? "border-danger-600" : "border-line hover:border-brand-300",
    extra,
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  /** Visually mark the field as required (the input should also have `required`). */
  requiredMark?: boolean;
};

function FieldShell({
  id,
  label,
  hint,
  error,
  requiredMark,
  children,
}: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-ink block text-sm font-medium">
        {label}
        {requiredMark ? (
          <span className="text-danger-600 ml-0.5" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-ink-muted text-xs">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-danger-700 text-xs font-medium"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export function Input({
  label,
  hint,
  error,
  requiredMark,
  className,
  id: idProp,
  ...props
}: FieldProps & ComponentProps<"input">) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      requiredMark={requiredMark}
    >
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={controlClass(error, cn("h-11", className))}
        {...props}
      />
    </FieldShell>
  );
}

export function Textarea({
  label,
  hint,
  error,
  requiredMark,
  className,
  id: idProp,
  rows = 5,
  ...props
}: FieldProps & ComponentProps<"textarea">) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      requiredMark={requiredMark}
    >
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={controlClass(error, cn("py-2.5", className))}
        {...props}
      />
    </FieldShell>
  );
}

export function Select({
  label,
  hint,
  error,
  requiredMark,
  className,
  id: idProp,
  children,
  ...props
}: FieldProps & ComponentProps<"select">) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      requiredMark={requiredMark}
    >
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={controlClass(error, cn("h-11 appearance-none pr-10", className))}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="text-ink-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
          aria-hidden
        />
      </div>
    </FieldShell>
  );
}

export function Checkbox({
  label,
  error,
  className,
  id: idProp,
  ...props
}: { label: ReactNode; error?: string } & Omit<ComponentProps<"input">, "type">) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <div className="space-y-1">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "border-line accent-brand-700 mt-0.5 size-5 shrink-0 cursor-pointer rounded",
            className,
          )}
          {...props}
        />
        <label htmlFor={id} className="text-ink cursor-pointer text-sm leading-5">
          {label}
        </label>
      </div>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-danger-700 text-xs font-medium"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
