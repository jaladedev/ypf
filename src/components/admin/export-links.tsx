import { Download } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

/** Two download buttons: CSV and Excel. `base` is the export URL without the format. */
export function ExportLinks({ base }: { base: string }) {
  const sep = base.includes("?") ? "&" : "?";
  return (
    <>
      <ButtonLink href={`${base}${sep}format=csv`} prefetch={false} size="sm" variant="secondary" download>
        <Download className="size-4" aria-hidden /> CSV
      </ButtonLink>
      <ButtonLink href={`${base}${sep}format=xlsx`} prefetch={false} size="sm" variant="secondary" download>
        <Download className="size-4" aria-hidden /> Excel
      </ButtonLink>
    </>
  );
}
