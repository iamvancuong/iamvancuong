"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Visibility } from "@prisma/client";
import { fmtDate, hasJa, type PostWithTags } from "@/lib/posts-format";
import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";

/**
 * Một dòng trong danh sách bài viết.
 *
 * Trước đây vùng bấm đúng bằng khối chữ, và dấu hiệu duy nhất khi rê chuột là
 * tiêu đề đổi màu. Trên điện thoại thì không có chuột, nên **không có gì cho
 * biết cả dòng này bấm được** — nhìn hệt một đoạn văn.
 *
 * Giờ cả dòng là một tấm nền sáng lên khi rê tới, tràn ra ngoài cột chữ bằng
 * `-mx-*` để trông như một hàng thật chứ không phải một khối chữ bị tô nền.
 *
 * Ngày dời sang phải và dùng `tabular-nums`: mọi ngày rộng bằng nhau nên chúng
 * xếp thành một cột thẳng, mắt quét được cả danh sách theo thời gian mà không
 * phải đọc từng dòng. Trên màn hẹp thì nó rơi xuống hàng dưới cùng các thẻ.
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

  const meta = [
    ...post.tags.map((tag) => tag.name),
    ...(hasJa(post) && !ja ? ["日本語版あり"] : []),
  ];

  return (
    /*
      THẺ có ảnh bìa bên trái, nội dung bên phải.

      Danh sách bài trước đây chỉ có chữ: dòng nào cũng tiêu đề + mô tả + ngày,
      nên mười bài trông như mười đoạn văn và không có gì để mắt phân biệt bài
      này với bài kia khi lướt. Ảnh bìa làm đúng việc đó — nó là thứ duy nhất
      KHÁC NHAU giữa các dòng mà không cần đọc.

      Bài chưa có ảnh vẫn giữ nguyên bố cục cũ (chỉ chữ), không chèn khung xám
      giả làm chỗ ảnh: một ô trống có viền còn khó chịu hơn là không có ô nào.
    */
    <article className="group">
      <Link
        href={href}
        className="flex flex-col gap-5 overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface p-4 transition-colors hover:border-ink-3 md:flex-row md:p-5"
      >
        {post.cover && (
          <div className="shrink-0 overflow-hidden rounded-[var(--radius-lg)] md:w-[260px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh đi qua
                /api/uploads (kiểm quyền từng tấm), next/image không qua đó */}
            <img
              src={post.cover.url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-[180px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] md:h-full"
            />
          </div>
        )}

        <div className="min-w-0 flex-1 md:py-1">
        <div className="flex items-baseline gap-4">
          <h3
            lang={ja ? "ja" : undefined}
            className="min-w-0 flex-1 text-balance text-[19px] font-semibold leading-snug tracking-[-0.015em] transition-colors group-hover:text-accent md:text-[21px]"
          >
            {title}
            <ArrowUpRight
              size={17}
              strokeWidth={2}
              aria-hidden
              className="ml-1.5 inline-block shrink-0 -translate-y-px text-ink-3 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
            />
          </h3>

          {post.publishedAt && (
            <time
              dateTime={post.publishedAt.toISOString()}
              lang={jl}
              className="hidden shrink-0 text-[13px] tabular-nums text-ink-3 sm:block"
            >
              {fmtDate(post.publishedAt, lang)}
            </time>
          )}
        </div>

        {post.excerpt && (
          <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-ink-2">
            {post.excerpt}
          </p>
        )}

        {/* Dấu `·` là phần tử riêng chứ không nối vào chuỗi: ngày chỉ có mặt ở
            màn hẹp (màn rộng nó nằm ở cột phải), nên dấu ngăn trước thẻ đầu
            tiên cũng phải biến mất theo — nối chuỗi thì màn rộng sẽ mở đầu
            bằng một dấu chấm giữa lơ lửng. */}
        {(post.publishedAt || meta.length > 0 || !isPublic) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-3">
            {post.publishedAt && (
              <>
                <time
                  dateTime={post.publishedAt.toISOString()}
                  lang={jl}
                  className="tabular-nums sm:hidden"
                >
                  {fmtDate(post.publishedAt, lang)}
                </time>
                {meta.length > 0 && (
                  <span aria-hidden className="sm:hidden">
                    ·
                  </span>
                )}
              </>
            )}

            {meta.map((m, i) => (
              <Fragment key={i}>
                {i > 0 && <span aria-hidden>·</span>}
                <span lang={m === "日本語版あり" ? "ja" : undefined}>{m}</span>
              </Fragment>
            ))}

            {!isPublic && (
              <>
                {(meta.length > 0 || post.publishedAt) && (
                  <span aria-hidden>·</span>
                )}
                <span lang={jl} className="text-down">
                  {t.blog.private[lang]}
                </span>
              </>
            )}
          </div>
        )}
        </div>
      </Link>
    </article>
  );
}
