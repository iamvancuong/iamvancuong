import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostView } from "@/components/blog/PostView";
import { getPost, hasJa } from "@/lib/posts";
import { site } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]/ja">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !hasJa(post)) return {};

  return {
    title: post.titleJa ?? post.title,
    alternates: {
      canonical: `/blog/${slug}/ja`,
      languages: { vi: `/blog/${slug}`, ja: `/blog/${slug}/ja` },
    },
    openGraph: {
      type: "article",
      locale: "ja_JP",
      title: post.titleJa ?? post.title,
      url: `${site.url}/blog/${slug}/ja`,
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export default async function PostPageJa({
  params,
}: PageProps<"/blog/[slug]/ja">) {
  const { slug } = await params;
  const post = await getPost(slug);

  // Bài chưa có bản tiếng Nhật thì URL này đơn giản là không tồn tại.
  if (!post || !hasJa(post)) notFound();

  return <PostView post={post} lang="ja" />;
}
