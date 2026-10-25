import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { requireEditor } from "@/lib/auth/session";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "New article | Admin", robots: { index: false } };

export default async function NewPost() {
  await requireEditor();
  return (
    <>
      <PageHeader title="New article" back={{ href: "/admin/news", label: "All articles" }} />
      <PostForm initial={{ title: "", slug: "", excerpt: "", body: "", category: "", cover_image: "", published_at: "", status: "draft" }} />
    </>
  );
}
