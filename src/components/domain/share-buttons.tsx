"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { cn } from "@/lib/cn";

const pill =
  "inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-sm font-medium text-ink transition-colors hover:border-brand-300 hover:bg-brand-50";

/**
 * Share links. WhatsApp is first because it's the most-used channel for our
 * audience. `url` must be absolute (e.g. built from NEXT_PUBLIC_SITE_URL).
 */
export function ShareButtons({
  url,
  title,
  className,
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const targets = [
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure context, permissions): fail quietly.
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {targets.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className={pill}
          aria-label={`Share on ${s.label} (opens in a new tab)`}
        >
          {s.label}
        </a>
      ))}
      <button type="button" onClick={copy} className={pill}>
        {copied ? (
          <Check className="text-brand-700 size-4" aria-hidden />
        ) : (
          <Link2 className="size-4" aria-hidden />
        )}
        {copied ? "Copied" : "Copy link"}
        <span className="sr-only" role="status">
          {copied ? "Link copied to clipboard" : ""}
        </span>
      </button>
    </div>
  );
}
