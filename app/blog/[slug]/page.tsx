import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostView } from "@/components/blog/PostView";
import { getPost, hasJa } from "@/lib/posts";
import { site } from "@/lib/site";

/**
 * Không dùng generateStaticParams: bài nằm trong database và trạng thái
 * công khai/riêng tư phụ thuộc vào việc đã đăng nhập hay chưa, nên trang
 * phải render theo từng yêu cầu.
 */
export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: {
      canonical: `/blog/${slug}`,
      languages: hasJa(post)
        ? { vi: `/blog/${slug}`, ja: `/blog/${slug}/ja` }
        : undefined,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      url: `${site.url}/blog/${slug}`,
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return <PostView post={post} lang="vi" />;
}
