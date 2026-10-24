import Image from "next/image";
import { cn } from "@/lib/cn";

// Deterministic skyline silhouette: [x, width, height] on a 120 x 40 grid.
const buildings: [number, number, number][] = [
  [0, 7, 14],
  [8, 6, 22],
  [15, 8, 17],
  [24, 5, 30],
  [30, 9, 20],
  [40, 6, 26],
  [47, 8, 16],
  [56, 6, 34],
  [63, 9, 21],
  [73, 6, 28],
  [80, 8, 15],
  [89, 7, 24],
  [97, 6, 32],
  [104, 8, 18],
  [113, 7, 23],
];

/** Decorative placeholder used wherever a photo hasn't been uploaded yet. */
export function SkylineArt({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "from-brand-900 via-brand-800 to-brand-600 absolute inset-0 overflow-hidden bg-linear-to-br",
        className,
      )}
    >
      <svg
        viewBox="0 0 120 40"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 h-3/4 w-full"
      >
        {buildings.map(([x, w, h]) => (
          <rect
            key={x}
            x={x}
            y={40 - h}
            width={w}
            height={h}
            className="fill-brand-950/55"
          />
        ))}
        {buildings.map(([x, w, h]) => (
          <rect
            key={`w${x}`}
            x={x + w / 2 - 0.6}
            y={40 - h + 3}
            width="1.2"
            height="1.2"
            className="fill-highlight/50"
          />
        ))}
      </svg>
    </div>
  );
}

/**
 * Fills its (relatively positioned) parent. Shows the photo when there is one,
 * otherwise the skyline placeholder, so layouts never break on missing images.
 */
export function CoverImage({
  src,
  alt = "",
  priority,
  sizes = "100vw",
  className,
}: {
  src?: string | null;
  /** Leave empty for purely decorative images. */
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  if (!src) return <SkylineArt className={className} />;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
