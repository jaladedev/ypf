"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSavedState, toggleSavedJob, type SavedState } from "@/lib/saved-jobs";

/** Bookmark toggle. Looks up the visitor's state after load so the job page itself stays cacheable. */
export function SaveJobButton({ slug }: { slug: string }) {
  const [state, setState] = useState<SavedState | null>(null);
  const [pending, start] = useTransition();
  useEffect(() => {
    let live = true;
    getSavedState(slug).then((s) => live && setState(s));
    return () => {
      live = false;
    };
  }, [slug]);

  if (state && !state.signedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/jobs/${slug}`)}`}
        className="text-brand-700 text-sm font-medium hover:underline"
      >
        Sign in to save this job
      </Link>
    );
  }
  const saved = state?.saved ?? false;
  const Icon = saved ? BookmarkCheck : Bookmark;
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="w-full"
      loading={pending}
      disabled={!state}
      aria-pressed={saved}
      onClick={() => start(async () => setState(await toggleSavedJob(slug)))}
    >
      <Icon className="size-4" aria-hidden /> {saved ? "Saved" : "Save job"}
    </Button>
  );
}
