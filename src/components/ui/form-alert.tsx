import { CheckCircle2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

/** Form-level success or error message (for server action results). Renders nothing when empty. */
export function FormAlert({ error, message }: { error?: string; message?: string }) {
  if (!error && !message) return null;
  const isError = Boolean(error);
  const Icon = isError ? TriangleAlert : CheckCircle2;
  return (
    <p
      role={isError ? "alert" : "status"}
      className={cn(
        "rounded-control flex items-start gap-2 p-3 text-sm",
        isError ? "bg-danger-50 text-danger-700" : "bg-brand-50 text-brand-900",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{error ?? message}</span>
    </p>
  );
}
