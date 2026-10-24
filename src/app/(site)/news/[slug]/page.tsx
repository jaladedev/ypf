import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { Section, SectionHeading } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import { NewsCard } from "@/components/domain/news-card";
import { ShareButtons } from "@/components/domain/share-buttons";
import { getPostBySlug, getRelatedPosts } from "@/lib/data/posts";
import { formatDate, postCategoryLabels } from "@/lib/format";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPostBySlug(slug);
  if (!p) return { title: "Article not found" };
  return {
    title: p.title,
    description: p.excerpt ?? undefined,
    openGraph: {
      type: "article",
      title: p.title,
      description: p.excerpt ?? undefined,
      publishedTime: p.published_at ?? undefined,
      images: p.cover_image ? [p.cover_image] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const related = await getRelatedPosts(post);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <>
      <PageHero
        image={post.cover_image}
        title={post.title}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "News", href: "/news" },
          { label: post.title },
        ]}
      >
        <p className="mt-3 flex items-center gap-3 text-sm text-white/80">
          <Badge>{postCategoryLabels[post.category]}</Badge>
          {post.published_at ? (
            <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
          ) : null}
        </p>
      </PageHero>
      <Section>
        <article className="mx-auto max-w-3xl">
          <Markdown>{post.body}</Markdown>
          <div className="border-line mt-10 border-t pt-6">
            <h2 className="text-h3 text-ink mb-3">Share this article</h2>
            <ShareButtons url={`${base}/news/${post.slug}`} title={post.title} />
          </div>
        </article>
      </Section>
      {related.length ? (
        <Section tone="surface">
          <SectionHeading title="Related articles" href="/news" />
          <ul className="grid gap-6 md:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}>
                <NewsCard post={p} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
