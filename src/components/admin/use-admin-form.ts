"use client";

import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { ActionState } from "@/lib/admin/util";

/** Fields that are never saved in a local draft (ids, buttons, images, repeated rows). */
const SKIP = /^(id|intent|cover_image|photo_url|logo_url|speaker_|partner_)/;
const PREFIX = "ypf-admin-draft:";

function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  const proto = Object.getPrototypeOf(el);
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
  el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? "change" : "input", { bubbles: true }));
}

/**
 * Wiring for admin forms:
 *  - submits through the server action WITHOUT letting React 19 reset the fields
 *    afterwards (a failed save must not wipe what someone typed);
 *  - autosaves text fields to this browser (localStorage) while typing, and offers
 *    to restore them if the page was closed or the session expired.
 */
export function useAdminForm(
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>,
  draftKey: string,
) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const ref = useRef<HTMLFormElement>(null);
  const key = PREFIX + draftKey;
  const [draftAt, setDraftAt] = useState<number | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const readStored = useCallback(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as { at: number; fields: [string, string][] }) : null;
    } catch {
      return null;
    }
  }, [key]);

  /** Writes the draft to storage; returns the timestamp, or null when nothing was stored. */
  const persist = useCallback((): number | null => {
    const form = ref.current;
    if (!form) return null;
    try {
      const fields: [string, string][] = [];
      new FormData(form).forEach((v, k) => {
        if (typeof v === "string" && !SKIP.test(k)) fields.push([k, v]);
      });
      if (!fields.some(([, v]) => v.trim())) {
        localStorage.removeItem(key);
        return null;
      }
      const at = Date.now();
      localStorage.setItem(key, JSON.stringify({ at, fields }));
      return at;
    } catch {
      /* private mode or storage full: autosave is a convenience only */
      return null;
    }
  }, [key]);

  const writeDraft = useCallback(() => {
    const at = persist();
    if (at) setSavedAt(at);
  }, [persist]);

  // Offer an existing draft once, on first load.
  useEffect(() => {
    const d = readStored();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser storage after mount
    if (d) setDraftAt(d.at);
  }, [readStored]);

  // A failed save keeps the form's values; make sure the draft matches them.
  useEffect(() => {
    if (state.error || state.fieldErrors) persist();
  }, [state, persist]);

  const onInput = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(writeDraft, 1500);
  }, [writeDraft]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const restore = useCallback(() => {
    const d = readStored();
    const form = ref.current;
    if (!d || !form) return;
    const done = new Set<string>();
    for (const [name] of d.fields) {
      if (done.has(name)) continue;
      done.add(name);
      const value = d.fields.find(([n]) => n === name)?.[1] ?? "";
      const el = form.elements.namedItem(name);
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement
      ) {
        if (!(el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio"))) {
          setNativeValue(el, value);
        }
      }
    }
    setDraftAt(null);
  }, [readStored]);

  const discard = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    setDraftAt(null);
    setSavedAt(null);
  }, [key]);

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
      const fd = new FormData(e.currentTarget, submitter);
      try {
        localStorage.removeItem(key); // re-written above if the save fails
      } catch {
        /* ignore */
      }
      clearTimeout(timer.current);
      startTransition(() => formAction(fd));
    },
    [formAction, key],
  );

  return {
    state,
    pending,
    draftAt,
    savedAt,
    restore,
    discard,
    formProps: { ref, onSubmit, onInput, noValidate: true as const },
  };
}
