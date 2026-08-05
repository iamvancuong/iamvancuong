import Link from "next/link";
import { Visibility } from "@prisma/client";
import { Container } from "@/components/layout/Container";
import { LanguageToggle } from "./LanguageToggle";
import { fmtDate, hasJa, type Lang, type PostWithTags } from "@/lib/posts";
import { renderMarkdown } from "@/lib/markdown";

/** Dùng chung cho /blog/[slug] và /blog/[slug]/ja. */
export async function PostView({
  post,
  lang,
}: {
  post: PostWithTags;
  lang: Lang;
}) {
  const ja = lang === "ja";
  const body = ja ? (post.bodyJa ?? "") : post.body;
  const title = ja ? (post.titleJa ?? post.title) : post.title;
  const html = await renderMarkdown(body);

  const isPublic =
    post.visibility === Visibility.PUBLIC && post.publishedAt !== null;

  return (
    <Container width="prose">
      {/* Chỉ hiện khi bạn đăng nhập — khách không tới được bài riêng tư */}
      {!isPublic && (
        <p className="mb-8 rounded-[var(--radius-md)] border border-line bg-surface px-3 py-2 text-[13px] text-ink-2">
          Bài này đang <strong className="font-medium">riêng tư</strong>, chỉ bạn
          xem được.{" "}
          <Link
            href={`/os/write/${post.slug}`}
            className="text-accent underline underline-offset-2"
          >
            Sửa hoặc xuất bản
          </Link>
        </p>
      )}

      <article lang={lang}>
        <header className="border-b border-line pb-8">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-3">
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()}>
                {fmtDate(post.publishedAt, lang)}
              </time>
            )}
            {/* Nhãn chủ đề đang là tiếng Việt — không hiện trên trang tiếng Nhật */}
            {!ja &&
              post.tags.map((t) => <span key={t.id}>{t.name}</span>)}
          </div>

          <h1 className="text-[32px] font-semibold leading-[1.25] tracking-[-0.02em]">
            {title}
          </h1>

          <div className="mt-5">
            <LanguageToggle slug={post.slug} hasJa={hasJa(post)} current={lang} />
          </div>

          {ja && (
            <p className="mt-4 text-[13px] leading-relaxed text-ink-3">
              この記事は日本語の練習として書いています。ベトナム語版のほうが詳しく書いてあります。
            </p>
          )}
        </header>

        <div className="prose mt-10" dangerouslySetInnerHTML={{ __html: html }} />
      </article>

      <div className="mt-16 border-t border-line pt-6">
        <Link
          href="/blog"
          className="text-[14px] text-ink-2 transition-colors hover:text-ink"
        >
          ← {ja ? "記事一覧" : "Tất cả bài viết"}
        </Link>
      </div>
    </Container>
  );
}
