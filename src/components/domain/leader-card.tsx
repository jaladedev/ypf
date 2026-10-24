import { Avatar } from "./avatar";
import type { LeaderRow } from "@/types/database";

export type LeaderSummary = Pick<LeaderRow, "name" | "role_title" | "photo_url">;

/** Leadership grid item: portrait, name and role. */
export function LeaderCard({ leader }: { leader: LeaderSummary }) {
  return (
    <figure className="flex flex-col items-center text-center">
      <Avatar
        name={leader.name}
        src={leader.photo_url}
        className="size-28 text-2xl sm:size-32"
        sizes="128px"
      />
      <figcaption className="mt-3">
        <p className="text-ink text-sm font-semibold">{leader.name}</p>
        <p className="text-ink-muted mt-0.5 text-xs">{leader.role_title}</p>
      </figcaption>
    </figure>
  );
}
