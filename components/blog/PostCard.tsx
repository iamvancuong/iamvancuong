import Link from "next/link";
import { Visibility } from "@prisma/client";
import { fmtDate, hasJa, type PostWithTags } from "@/lib/posts";

export function PostCard({ post }: { post: PostWithTags }) {
  const isPublic =
    post.visibility === Visibility.PUBLIC && post.publishedAt !== null;

  return (
    <article className="group border-b border-line-soft py-6 first:pt-0">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-3">
          {post.publishedAt && (
            <time dateTime={post.publishedAt.toISOString()}>
              {fmtDate(post.publishedAt)}
            </time>
          )}
          {post.tags.map((t) => (
            <span key={t.id}>{t.name}</span>
          ))}
          {hasJa(post) && (
            <span lang="ja" className="text-ink-3">
              日本語版あり
            </span>
          )}
          {!isPublic && <span className="text-down">riêng tư</span>}
        </div>

        <h3 className="text-[18px] font-semibold leading-snug tracking-[-0.01em] transition-colors group-hover:text-accent">
          {post.title}
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
