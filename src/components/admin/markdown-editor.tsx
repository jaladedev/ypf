"use client";

import { useId, useRef, useState } from "react";
import { Bold, Heading2, ImagePlus, Italic, Link2, List, Loader2, Quote } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { createClient } from "@/lib/supabase/client";
import { IMAGE_TYPES, uniqueFileName } from "@/lib/admin/util";
import { cn } from "@/lib/cn";

type Tool = { label: string; icon: typeof Bold; before: string; after: string; placeholder: string; block?: boolean };

const tools: Tool[] = [
  { label: "Bold", icon: Bold, before: "**", after: "**", placeholder: "bold text" },
  { label: "Italic", icon: Italic, before: "_", after: "_", placeholder: "italic text" },
  { label: "Heading", icon: Heading2, before: "## ", after: "", placeholder: "Heading", block: true },
  { label: "Bulleted list", icon: List, before: "- ", after: "", placeholder: "List item", block: true },
  { label: "Quote", icon: Quote, before: "> ", after: "", placeholder: "Quote", block: true },
  { label: "Link", icon: Link2, before: "[", after: "](https://)", placeholder: "link text" },
];

const toolBtn =
  "rounded-control text-ink-muted hover:bg-brand-50 hover:text-brand-800 grid size-9 place-items-center transition-colors disabled:opacity-50";

/** Markdown textarea with a formatting toolbar, image upload and a live preview. */
export function MarkdownEditor({
  name,
  label,
  defaultValue = "",
  error,
  hint,
  rows = 16,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
  rows?: number;
  required?: boolean;
}) {
  const id = useId();
  const ta = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string>();

  /** Replace the selection and tell React (the draft autosave listens for "input"). */
  function replace(start: number, end: number, text: string, selStart: number, selEnd: number) {
    const el = ta.current;
    if (!el) return;
    el.focus();
    el.setRangeText(text, start, end, "end");
    el.setSelectionRange(selStart, selEnd);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function apply(t: Tool) {
    const el = ta.current;
    if (!el) return;
    let { selectionStart: s, selectionEnd: e } = el;
    const selected = el.value.slice(s, e) || t.placeholder;
    if (t.block && s > 0 && el.value[s - 1] !== "\n") {
      // start block syntax on its own line
      el.setRangeText("\n", s, s, "end");
      s += 1;
      e = s + (e - s);
    }
    const text = t.before + selected + t.after;
    replace(s, e, text, s + t.before.length, s + t.before.length + selected.length);
  }

  async function upload(f: File | undefined) {
    if (!f) return;
    setUploadError(undefined);
    if (!(IMAGE_TYPES as readonly string[]).includes(f.type) || f.size > 5 * 1024 * 1024) {
      setUploadError("Use a JPG, PNG, WebP or GIF image up to 5 MB.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const path = `uploads/${uniqueFileName(f.name)}`;
      const { error: err } = await supabase.storage.from("media").upload(path, f, { contentType: f.type, cacheControl: "31536000" });
      if (err) throw err;
      const url = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
      const el = ta.current;
      if (el) {
        const alt = "Describe the image";
        const md = `\n![${alt}](${url})\n`;
        const s = el.selectionStart;
        replace(s, el.selectionEnd, md, s + 3, s + 3 + alt.length);
      }
    } catch (e) {
      console.error("editor upload", e);
      setUploadError("The upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className="text-ink block text-sm font-medium">
          {label}
          {required ? (
            <span className="text-danger-600 ml-0.5" aria-hidden>
              *
            </span>
          ) : null}
        </label>
        <div role="group" aria-label="Editor view" className="border-line flex rounded-control border text-xs font-medium">
          {(["write", "preview"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => {
                if (m === "preview") setPreview(ta.current?.value ?? "");
                setMode(m);
              }}
              className={cn(
                "px-3 py-1.5 capitalize first:rounded-l-[7px] last:rounded-r-[7px]",
                mode === m ? "bg-brand-800 text-white" : "text-ink-muted hover:bg-brand-50",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("rounded-control border bg-white", error ? "border-danger-600" : "border-line")}>
        <div className={cn("border-line flex flex-wrap items-center gap-0.5 border-b p-1", mode === "preview" && "pointer-events-none opacity-50")} role="toolbar" aria-label="Formatting">
          {tools.map((t) => (
            <button key={t.label} type="button" className={toolBtn} aria-label={t.label} title={t.label} onClick={() => apply(t)} disabled={mode === "preview"}>
              <t.icon className="size-4" aria-hidden />
            </button>
          ))}
          <button type="button" className={toolBtn} aria-label="Insert image" title="Insert image" onClick={() => file.current?.click()} disabled={busy || mode === "preview"}>
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ImagePlus className="size-4" aria-hidden />}
          </button>
          <input ref={file} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" tabIndex={-1} aria-label="Choose an image to insert" data-testid="editor-image-file" onChange={(e) => upload(e.target.files?.[0])} />
        </div>
        <textarea
          id={id}
          ref={ta}
          name={name}
          rows={rows}
          defaultValue={defaultValue}
          hidden={mode === "preview"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className="text-ink block w-full resize-y rounded-b-[7px] bg-white px-3.5 py-3 font-mono text-sm leading-6 focus-visible:outline-2 focus-visible:-outline-offset-2"
        />
        {mode === "preview" ? (
          <div className="min-h-40 p-4">
            {preview.trim() ? <Markdown>{preview}</Markdown> : <p className="text-ink-muted text-sm">Nothing to preview yet.</p>}
          </div>
        ) : null}
      </div>
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-ink-muted text-xs">
          {hint}
        </p>
      ) : null}
      {error || uploadError ? (
        <p id={`${id}-error`} role="alert" className="text-danger-700 text-xs font-medium">
          {error ?? uploadError}
        </p>
      ) : null}
    </div>
  );
}
