"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Visibility } from "@prisma/client";
import { fmtDate, hasJa, type PostWithTags } from "@/lib/posts-format";
import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";

/**
 * Một bài trong danh sách — ảnh bìa bên trái, nội dung bên phải.
 *
 * ## Ngày dời LÊN TRÊN, bỏ hẳn cột phải
 *
 * Bản trước đặt ngày ở một cột riêng bên phải, ngang hàng với tiêu đề. Đo ra
 * thì đáy của ngày chỉ cách đỉnh đoạn mô tả **10px** — nên nó trông như dính
 * vào khối bên dưới chứ không thuộc về tiêu đề. Lỗi này chỉ lộ ra sau khi thêm
 * ảnh bìa, vì cột chữ hẹp lại và mô tả trèo lên gần hơn.
 *
 * Cách chữa không phải là nới khoảng cách mà là bỏ cột đó đi: ngày, chủ đề,
 * trạng thái đều là **siêu dữ liệu của bài**, chúng thuộc về một hàng, và hàng
 * đó nằm TRÊN tiêu đề. Xếp đúng chỗ thì không còn khoảng cách nào phải chỉnh.
 */
export function PostCard({ post }: { post: PostWithTags }) {
  const { lang } = useLang();
  const jl = lang === "ja" ? "ja" : undefined;
  const isPublic =
    post.visibility === Visibility.PUBLIC && post.publishedAt !== null;

  // Khi đang xem tiếng Nhật và bài CÓ bản JA → mở thẳng bản /ja, tiêu đề dùng JA.
  const ja = lang === "ja" && hasJa(post);
  const href = ja ? `/blog/${post.slug}/ja` : `/blog/${post.slug}`;
  const title = ja ? (post.titleJa ?? post.title) : post.title;

  return (
    <article className="group">
      <Link
        href={href}
        className="flex flex-col gap-5 overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface p-4 transition-colors hover:border-ink-3 md:flex-row md:gap-6 md:p-5"
      >
        {post.cover && (
          <div className="shrink-0 overflow-hidden rounded-[var(--radius-lg)] md:w-[280px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh đi qua
                /api/uploads (kiểm quyền từng tấm), next/image không qua đó */}
            <img
              src={post.cover.url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-[200px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] md:h-full"
            />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col justify-center md:py-2">
          {/* HÀNG SIÊU DỮ LIỆU — ngày, chủ đề, trạng thái, cùng một hàng. */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
            {!isPublic && (
              <span
                lang={jl}
                className="tag rounded-full bg-down/10 px-2.5 py-1 text-down"
              >
                {t.blog.private[lang]}
              </span>
            )}

            {post.publishedAt && (
              <time
                dateTime={post.publishedAt.toISOString()}
                lang={jl}
                className="tag tabular-nums"
              >
                {fmtDate(post.publishedAt, lang)}
              </time>
            )}

            {post.tags.map((tag) => (
              <span key={tag.id} className="tag">
                · {tag.name}
              </span>
            ))}

            {hasJa(post) && !ja && (
              <span lang="ja" className="tag">
                · 日本語版あり
              </span>
            )}
          </div>

          <h3
            lang={ja ? "ja" : undefined}
            className="mt-3 text-balance text-[21px] font-semibold leading-snug tracking-[-0.02em] transition-colors group-hover:text-accent md:text-[24px]"
          >
            {title}
          </h3>

          {post.excerpt && (
            <p className="mt-2.5 max-w-[62ch] text-[15px] leading-relaxed text-ink-2">
              {post.excerpt}
            </p>
          )}

          {/* Lời mời bấm, đặt cuối thẻ. Mũi tên trượt sang khi rê tới — nó nói
              "còn nữa ở bên kia" bằng chuyển động thay vì bằng thêm một chữ. */}
          <span className="tag mt-4 flex items-center gap-1.5 text-ink-2 transition-colors group-hover:text-accent">
            {t.blog.read[lang]}
            <ArrowRight
              size={13}
              strokeWidth={2}
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}
