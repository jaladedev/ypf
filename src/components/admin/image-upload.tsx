"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { IMAGE_TYPES, uniqueFileName } from "@/lib/admin/util";

const LIMITS: Record<string, number> = { avatars: 2 * 1024 * 1024, media: 5 * 1024 * 1024 };

/**
 * Uploads an image straight from the browser to Supabase Storage (the bucket's
 * policies decide who may write) and puts the public URL in a hidden form field.
 */
export function ImageUpload({
  name,
  label,
  bucket,
  folder,
  defaultValue,
  hint,
  round,
  onUploaded,
}: {
  name: string;
  label: string;
  bucket: "avatars" | "media";
  /** avatars: the user's id (required by the policy). media: "uploads". */
  folder: string;
  defaultValue?: string | null;
  hint?: string;
  round?: boolean;
  onUploaded?: (url: string) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const max = LIMITS[bucket];

  async function pick(file: File | undefined) {
    if (!file) return;
    setError(undefined);
    if (!(IMAGE_TYPES as readonly string[]).includes(file.type) || (bucket === "avatars" && file.type === "image/gif")) {
      setError(bucket === "avatars" ? "Use a JPG, PNG or WebP image." : "Use a JPG, PNG, WebP or GIF image.");
      return;
    }
    if (file.size > max) {
      setError(`That image is too large. The limit is ${max / 1024 / 1024} MB.`);
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const path = `${folder}/${uniqueFileName(file.name)}`;
      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      setUrl(data.publicUrl);
      onUploaded?.(data.publicUrl);
    } catch (e) {
      console.error("upload", e);
      setError("The upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="space-y-1.5">
      <p id={`${id}-l`} className="text-ink text-sm font-medium">
        {label}
      </p>
      <div className="flex items-center gap-4">
        <div
          className={`border-line bg-surface text-ink-muted grid size-20 shrink-0 place-items-center overflow-hidden border ${round ? "rounded-full" : "rounded-control"}`}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview of a just-uploaded file
            <img src={url} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-6" aria-hidden />
          )}
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => input.current?.click()} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {url ? "Replace image" : "Upload image"}
            </Button>
            {url && !busy ? (
              <Button size="sm" variant="ghost" onClick={() => setUrl("")}>
                <X className="size-4" aria-hidden /> Remove
              </Button>
            ) : null}
          </div>
          <p className="text-ink-muted text-xs">{hint ?? `JPG, PNG or WebP, up to ${max / 1024 / 1024} MB.`}</p>
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept={bucket === "avatars" ? "image/jpeg,image/png,image/webp" : "image/jpeg,image/png,image/webp,image/gif"}
        className="sr-only"
        tabIndex={-1}
        aria-labelledby={`${id}-l`}
        data-testid={`${name}-file`}
        onChange={(e) => pick(e.target.files?.[0])}
      />
      <input type="hidden" name={name} value={url} />
      {error ? (
        <p role="alert" className="text-danger-700 text-xs font-medium">
          {error}
        </p>
      ) : null}
    </div>
  );
}
