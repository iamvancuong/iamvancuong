"use client";

import Link from "next/link";
import { Visibility } from "@prisma/client";
import { fmtDate, hasJa, type PostWithTags } from "@/lib/posts-format";
import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";

export function PostCard({ post }: { post: PostWithTags }) {
  const { lang } = useLang();
  const jl = lang === "ja" ? "ja" : undefined;
  const isPublic =
    post.visibility === Visibility.PUBLIC && post.publishedAt !== null;

  // Khi đang xem tiếng Nhật và bài CÓ bản JA → mở thẳng bản /ja, tiêu đề dùng JA.
  const ja = lang === "ja" && hasJa(post);
  const href = ja ? `/blog/${post.slug}/ja` : `/blog/${post.slug}`;
  const title = ja ? post.titleJa ?? post.title : post.title;

  return (
    <article className="group border-b border-line-soft py-6 first:pt-0">
      <Link href={href} className="block">
        <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-3">
          {post.publishedAt && (
            <time dateTime={post.publishedAt.toISOString()} lang={jl}>
              {fmtDate(post.publishedAt, lang)}
            </time>
          )}
          {post.tags.map((tag) => (
            <span key={tag.id}>{tag.name}</span>
          ))}
          {hasJa(post) && !ja && (
            <span lang="ja" className="text-ink-3">
              日本語版あり
            </span>
          )}
          {!isPublic && (
            <span lang={jl} className="text-down">
              {t.blog.private[lang]}
            </span>
          )}
        </div>

        <h3
          lang={ja ? "ja" : undefined}
          className="text-[18px] font-semibold leading-snug tracking-[-0.01em] transition-colors group-hover:text-accent"
        >
          {title}
        </h3>

        {post.excerpt && (
          <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">
            {post.excerpt}
          </p>
        )}
      </Link>
    </article>
  );
}
