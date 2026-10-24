"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const tabClass = (active: boolean) =>
  cn(
    "relative -mb-px whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors",
    active
      ? "border-brand-700 text-brand-800"
      : "border-transparent text-ink-muted hover:text-ink",
  );

/** Tabs that switch content on the client (e.g. Leadership groups). */
export function Tabs({
  tabs,
  defaultId,
  label,
}: {
  tabs: { id: string; label: string; content: ReactNode }[];
  defaultId?: string;
  /** Accessible name for the tab list. */
  label: string;
}) {
  const [active, setActive] = useState(defaultId ?? tabs[0]?.id);
  const uid = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(e: KeyboardEvent, index: number) {
    const last = tabs.length - 1;
    let next = index;
    if (e.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (e.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    setActive(tabs[next].id);
    refs.current[tabs[next].id]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="border-line flex gap-6 overflow-x-auto border-b"
      >
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[t.id] = el;
            }}
            role="tab"
            id={`${uid}-tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`${uid}-panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={tabClass(active === t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${uid}-panel-${t.id}`}
          aria-labelledby={`${uid}-tab-${t.id}`}
          hidden={active !== t.id}
          className="pt-6"
        >
          {active === t.id ? t.content : null}
        </div>
      ))}
    </div>
  );
}

/** Tabs that are links (filters stored in the URL, e.g. Upcoming / Past events). */
export function LinkTabs({
  items,
  label,
}: {
  items: { href: string; label: string; active: boolean }[];
  label: string;
}) {
  return (
    <nav aria-label={label} className="border-line flex gap-6 overflow-x-auto border-b">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={tabClass(item.active)}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
