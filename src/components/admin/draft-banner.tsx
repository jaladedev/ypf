"use client";

import { Button } from "@/components/ui/button";

const fmt = (t: number) =>
  new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(t));

/** "You have an unsaved draft from this browser" + a quiet "Draft saved" note. */
export function DraftBanner({
  draftAt,
  savedAt,
  onRestore,
  onDiscard,
}: {
  draftAt: number | null;
  savedAt: number | null;
  onRestore: () => void;
  onDiscard: () => void;
}) {
  if (draftAt) {
    return (
      <div
        role="status"
        className="rounded-control border-warning-700/30 bg-warning-50 text-warning-700 flex flex-wrap items-center gap-3 border p-3 text-sm"
      >
        <span className="flex-1">
          Unsaved changes from {fmt(draftAt)} were found on this device.
        </span>
        <Button size="sm" variant="secondary" onClick={onRestore}>
          Restore
        </Button>
        <Button size="sm" variant="ghost" onClick={onDiscard}>
          Discard
        </Button>
      </div>
    );
  }
  return savedAt ? (
    <p role="status" className="text-ink-muted text-xs">
      Autosaved on this device at {fmt(savedAt)}. This is not saved to the site until you press Save.
    </p>
  ) : null;
}
