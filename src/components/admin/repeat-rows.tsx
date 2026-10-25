"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-controls";
import { ImageUpload } from "./image-upload";

type Row = { key: number; a: string; b: string; photo: string };

/**
 * Add/remove rows of (name, subtitle, photo). Field names are `${prefix}_name`,
 * `${prefix}_title`, `${prefix}_photo`, repeated once per row, in order.
 */
export function PersonRows({
  prefix,
  legend,
  addLabel,
  nameLabel,
  titleLabel,
  initial,
  showTitle = true,
  photoLabel = "Photo (optional)",
  round = true,
}: {
  prefix: string;
  legend: string;
  addLabel: string;
  nameLabel: string;
  titleLabel: string;
  initial: { name: string; title: string; photo: string }[];
  showTitle?: boolean;
  photoLabel?: string;
  round?: boolean;
}) {
  const [rows, setRows] = useState<Row[]>(initial.map((r, i) => ({ key: i, a: r.name, b: r.title, photo: r.photo })));
  const [next, setNext] = useState(initial.length);
  const patch = (key: number, p: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...p } : r)));

  return (
    <fieldset className="space-y-3">
      <legend className="text-ink text-sm font-medium">{legend}</legend>
      {rows.length === 0 ? <p className="text-ink-muted text-sm">None added yet.</p> : null}
      <ul className="space-y-3">
        {rows.map((r, i) => (
          <li key={r.key} className="rounded-control border-line space-y-3 border bg-white p-4">
            <div className={showTitle ? "grid gap-3 sm:grid-cols-2" : "grid gap-3"}>
              <Input label={`${nameLabel} ${i + 1}`} name={`${prefix}_name`} value={r.a} onChange={(e) => patch(r.key, { a: e.target.value })} maxLength={200} />
              {showTitle ? (
                <Input label={titleLabel} name={`${prefix}_title`} value={r.b} onChange={(e) => patch(r.key, { b: e.target.value })} maxLength={200} />
              ) : null}
            </div>
            <ImageUpload name={`${prefix}_photo`} label={photoLabel} bucket="media" folder="uploads" defaultValue={r.photo} round={round} onUploaded={(u) => patch(r.key, { photo: u })} />
            <Button variant="ghost" size="sm" onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}>
              <Trash2 className="size-4" aria-hidden /> Remove {nameLabel.toLowerCase()} {i + 1}
            </Button>
          </li>
        ))}
      </ul>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setRows((rs) => [...rs, { key: next, a: "", b: "", photo: "" }]);
          setNext((n) => n + 1);
        }}
      >
        <Plus className="size-4" aria-hidden /> {addLabel}
      </Button>
    </fieldset>
  );
}
