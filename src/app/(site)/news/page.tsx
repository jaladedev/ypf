import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { LinkTabs } from "@/components/ui/tabs";
import { NewsCard } from "@/components/domain/news-card";
import { POSTS_PER_PAGE, getPosts } from "@/lib/data/posts";
import { postCategoryLabels } from "@/lib/format";
import type { PostCategory } from "@/types/database";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "News & updates",
  description: "News, advocacy and announcements from the Young Planners Forum.",
};

export default async function NewsPage({ searchParams }: PageProps<"/news">) {
  const sp = await searchParams;
  const cat = String(Array.isArray(sp.category) ? sp.category[0] : (sp.category ?? ""));
  const category = cat in postCategoryLabels ? (cat as PostCategory) : undefined;
  const page = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);
  const { items, total } = await getPosts({ category, page });
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <>
      <PageHero
        title="News & updates"
        subtitle="Stories, advocacy and announcements from across the forum."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "News" }]}
      />
      <Section>
        <LinkTabs
          label="News categories"
          items={[
            { href: "/news", label: "All", active: !category },
            ...Object.entries(postCategoryLabels).map(([k, l]) => ({
              href: `/news?category=${k}`,
              label: l,
              active: category === k,
            })),
          ]}
        />
        <div className="mt-8">
          {items.length ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <li key={p.slug}>
                  <NewsCard post={p} as="h2" />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No articles here yet" description="Check back soon." />
          )}
        </div>
        {totalPages > 1 ? (
          <div className="mt-8">
            <Pagination
              page={page}
              totalPages={totalPages}
              hrefFor={(p) => `/news?${category ? `category=${category}&` : ""}page=${p}`}
            />
          </div>
        ) : null}
      </Section>
    </>
  );
}
