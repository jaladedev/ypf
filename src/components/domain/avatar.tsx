import Image from "next/image";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

/** Person photo, or their initials on a green circle when there is no photo. */
export function Avatar({
  name,
  src,
  className,
  sizes = "96px",
}: {
  name: string;
  src?: string | null;
  className?: string;
  sizes?: string;
}) {
  return (
    <span
      className={cn(
        "bg-brand-100 text-brand-800 relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full text-lg font-semibold",
        className,
      )}
    >
      {src ? (
        <Image src={src} alt={name} fill sizes={sizes} className="object-cover" />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
    </span>
  );
}
