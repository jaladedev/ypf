import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary" // deep green: default call to action on light backgrounds
  | "accent" // bright green: call to action on dark backgrounds
  | "secondary" // outlined green
  | "outline-light" // outlined white, for dark backgrounds
  | "ghost" // text-only
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold transition-colors disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-800 text-white hover:bg-brand-900 active:bg-brand-950",
  accent: "bg-highlight text-brand-950 hover:bg-highlight-hover",
  secondary: "border border-brand-800 text-brand-800 hover:bg-brand-50",
  "outline-light": "border border-white/70 text-white hover:bg-white/10",
  ghost: "text-brand-800 hover:bg-brand-50",
  danger: "bg-danger-600 text-white hover:bg-danger-700",
};

// Minimum 40px tall on phones for "md", 44px for "lg" (comfortable tap targets).
const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type Shared = { variant?: ButtonVariant; size?: ButtonSize; children?: ReactNode };

export function Button({
  variant,
  size,
  loading,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: Shared & { loading?: boolean } & ComponentProps<"button">) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

/** A link that looks like a button. Use for navigation; use Button for actions. */
export function ButtonLink({
  variant,
  size,
  className,
  children,
  ...props
}: Shared & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonStyles({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
