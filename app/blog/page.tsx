import type { Metadata } from "next";
import Link from "next/link";
import { Visibility } from "@prisma/client";
import { Container } from "@/components/layout/Container";
import { PostCard } from "@/components/blog/PostCard";
import { hasJa, listPosts, listTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Viết",
  description:
    "Bài viết về học tiếng Nhật, lập trình và cuộc sống ở Nhật. Một số bài có bản tiếng Nhật.",
};

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const params = await searchParams;
  const active =
    (Array.isArray(params.tag) ? params.tag[0] : params.tag) ?? "all";

  const [all, tags] = await Promise.all([listPosts(), listTags()]);

  const posts =
    active === "all"
      ? all
      : active === "ja"
        ? all.filter(hasJa)
        : all.filter((p) => p.tags.some((t) => t.slug === active));

  // Bộ lọc sinh từ database — tạo chủ đề mới lúc viết bài là nó tự có mặt ở đây.
  // 日本語 không phải chủ đề: nó lọc theo việc bài có bản tiếng Nhật hay không.
  const filters = [
    { key: "all", label: "Tất cả", lang: undefined as string | undefined },
    ...tags.map((t) => ({ key: t.slug, label: t.name, lang: undefined })),
    { key: "ja", label: "日本語", lang: "ja" },
  ];

  const privateCount = all.filter(
    (p) => p.visibility !== Visibility.PUBLIC || !p.publishedAt,
  ).length;

  return (
    <Container width="prose">
      <header className="border-b border-line pb-8">
        <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Viết</h1>
        <p className="mt-2 text-[16px] text-ink-2">
          Tiếng Nhật, lập trình, và cuộc sống ở đây.
        </p>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => {
          const on = f.key === active;
          return (
            <Link
              key={f.key}
              href={f.key === "all" ? "/blog" : `/blog?tag=${f.key}`}
              lang={f.lang}
              className={`rounded-[var(--radius-md)] border px-3 py-1 text-[13px] transition-colors ${
                on
                  ? "border-ink bg-ink text-bg"
                  : "border-line text-ink-2 hover:border-ink-3 hover:text-ink"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {/* Chỉ bạn thấy dòng này — listPosts đã lọc bài riêng tư với khách */}
      {privateCount > 0 && (
        <p className="mt-6 rounded-[var(--radius-md)] border border-line bg-surface px-3 py-2 text-[13px] text-ink-2">
          Bạn đang đăng nhập nên thấy cả {privateCount} bài riêng tư/chưa xuất
          bản.{" "}
          <Link
            href="/os/write"
            className="text-accent underline underline-offset-2"
          >
            Quản lý bài viết
          </Link>
        </p>
      )}

      <div className="mt-10">
        {posts.length > 0 ? (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        ) : (
          <p className="text-[15px] text-ink-2">
            Chưa có bài nào trong mục này.
          </p>
        )}
      </div>
    </Container>
  );
}
