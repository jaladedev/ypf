"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Check, Copy, Loader2, Upload } from "lucide-react";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { IMAGE_TYPES, uniqueFileName } from "@/lib/admin/util";
import { deleteMedia } from "./actions";

export type MediaItem = { name: string; url: string; size: number };

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState<string>();

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const errs: string[] = [];
    const supabase = createClient();
    for (const f of Array.from(files)) {
      if (!(IMAGE_TYPES as readonly string[]).includes(f.type)) { errs.push(`${f.name}: use a JPG, PNG, WebP or GIF image.`); continue; }
      if (f.size > 5 * 1024 * 1024) { errs.push(`${f.name}: larger than 5 MB.`); continue; }
      const { error } = await supabase.storage.from("media").upload(`uploads/${uniqueFileName(f.name)}`, f, { contentType: f.type, cacheControl: "31536000" });
      if (error) errs.push(`${f.name}: upload failed.`);
    }
    setErrors(errs);
    setBusy(false);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(undefined), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => input.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />} Upload images
        </Button>
        <p className="text-ink-muted text-sm">JPG, PNG, WebP or GIF, up to 5 MB each.</p>
        <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" tabIndex={-1} aria-label="Choose images to upload" data-testid="media-file" onChange={(e) => upload(e.target.files)} />
      </div>
      {errors.length ? (
        <div role="alert" className="bg-danger-50 text-danger-700 rounded-control space-y-1 p-3 text-sm">
          {errors.map((e) => <p key={e}>{e}</p>)}
        </div>
      ) : null}
      {items.length ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <li key={m.name} className="rounded-card border-line shadow-card overflow-hidden border bg-white">
              <div className="bg-surface aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of a stored file */}
                <img src={m.url} alt="" loading="lazy" className="size-full object-cover" />
              </div>
              <div className="space-y-2 p-3">
                <p className="text-ink-muted truncate text-xs" title={m.name}>{m.name} · {Math.max(1, Math.round(m.size / 1024))} KB</p>
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="secondary" onClick={() => copy(m.url)}>
                    {copied === m.url ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                    {copied === m.url ? "Copied" : "Copy link"}
                  </Button>
                  <ConfirmForm action={deleteMedia} fields={{ name: m.name }} trigger={<>Delete<span className="sr-only"> {m.name}</span></>} triggerVariant="ghost" title="Delete this image?" description="Pages that use it will show a broken image. This can't be undone." confirmLabel="Delete" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-muted rounded-card border-line bg-surface border border-dashed p-10 text-center text-sm">No images yet. Upload some to reuse them across pages.</p>
      )}
    </div>
  );
}
