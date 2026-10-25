import { Badge, type BadgeTone } from "@/components/ui/badge";

const tones: Record<string, BadgeTone> = {
  published: "brand",
  approved: "brand",
  registered: "brand",
  replied: "brand",
  draft: "warning",
  pending: "warning",
  new: "warning",
  archived: "neutral",
  read: "neutral",
  cancelled: "neutral",
  rejected: "danger",
  suspended: "danger",
  admin: "info",
  editor: "info",
  member: "neutral",
};

export function StatusBadge({ value, label }: { value: string; label?: string }) {
  return (
    <Badge tone={tones[value] ?? "neutral"} className="capitalize">
      {label ?? value.replace(/_/g, " ")}
    </Badge>
  );
}
