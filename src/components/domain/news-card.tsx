import Link from "next/link";
import { CoverImage } from "@/components/layout/cover-image";
import { Badge } from "@/components/ui/badge";
import { formatDate, postCategoryLabels } from "@/lib/format";
import type { PostRow } from "@/types/database";

export type PostSummary = Pick<
  PostRow,
  "slug" | "title" | "excerpt" | "cover_image" | "category" | "published_at"
>;

/** Article card: photo, category, title, excerpt and date. The whole card is one link. */
export function NewsCard({
  post,
  sizes = "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw",
}: {
  post: PostSummary;
  sizes?: string;
}) {
  return (
    <article className="group rounded-card border-line shadow-card hover:shadow-pop relative flex flex-col overflow-hidden border bg-white transition-shadow">
      <div className="bg-brand-100 relative aspect-[16/10]">
        <CoverImage src={post.cover_image} sizes={sizes} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="text-ink-muted flex items-center gap-2 text-xs">
          <Badge tone="brand">{postCategoryLabels[post.category]}</Badge>
          {post.published_at ? (
            <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
          ) : null}
        </div>
        <h3 className="text-ink group-hover:text-brand-700 text-base font-semibold">
          <Link
            href={`/news/${post.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? (
          <p className="text-ink-muted line-clamp-2 text-sm">{post.excerpt}</p>
        ) : null}
      </div>
    </article>
  );
}
