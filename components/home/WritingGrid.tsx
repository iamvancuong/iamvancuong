"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Visibility } from "@prisma/client";
import { fmtDate, hasJa, type PostWithTags } from "@/lib/posts-format";
import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";

/**
 * Mục «Viết» của TRANG CHỦ — một bài nổi bật + hai bài phụ.
 *
 * ## Vì sao KHÔNG dùng lại `PostCard` như trước
 *
 * Bản trước xếp ba `PostCard` chồng lên nhau, đúng y hệt `/blog`. Lý do khi đó
 * là "hai nơi hiện một bài thì phải hiện giống hệt nhau" — nghe hợp lý, nhưng
 * nó bỏ qua chuyện hai nơi ấy trả lời hai câu hỏi khác nhau:
 *
 *   `/blog`     — "có những bài nào?"   → danh sách, mọi bài NGANG NHAU
 *   trang chủ   — "có gì đáng đọc?"     → phải có một bài được chỉ ra
 *
 * Ba thẻ giống hệt nhau xếp dọc thì không thẻ nào là câu trả lời; mắt lướt qua
 * cả ba rồi cuộn tiếp. Cho bài mới nhất một khung lớn có ảnh bìa to, hai bài
 * còn lại thu về hàng nhỏ — thế là có thứ bậc, và có một chỗ để mắt rơi vào.
 *
 * Đổi lại phải chấp nhận hai kiểu thẻ cho cùng một bài viết. Chấp nhận được vì
 * cả hai vẫn nói đúng một bộ thông tin (ngày · chủ đề · trạng thái · tiêu đề ·
 * mô tả) theo đúng thứ tự — thứ phải giống nhau là NỘI DUNG, không phải khung.
 */

/** Mọi thứ suy ra từ một bài + ngôn ngữ đang xem. Dùng chung cho cả hai kiểu thẻ. */
function usePostView(post: PostWithTags) {
  const { lang } = useLang();
  // Đang xem tiếng Nhật và bài CÓ bản JA → mở thẳng /ja, tiêu đề dùng JA.
  const ja = lang === "ja" && hasJa(post);
  return {
    lang,
    jl: lang === "ja" ? ("ja" as const) : undefined,
    ja,
    href: ja ? `/blog/${post.slug}/ja` : `/blog/${post.slug}`,
    title: ja ? (post.titleJa ?? post.title) : post.title,
    isPublic: post.visibility === Visibility.PUBLIC && post.publishedAt !== null,
  };
}

/**
 * Hàng siêu dữ liệu: trạng thái · ngày · chủ đề · có bản tiếng Nhật.
 *
 * Cùng một hàng, cùng một thứ tự ở cả thẻ lớn lẫn thẻ nhỏ. `compact` chỉ cắt
 * bớt phần ít quan trọng nhất — thẻ nhỏ rộng chừng 300px, nhồi đủ bốn thứ vào
 * đó là hàng xuống hai dòng và đẩy tiêu đề tụt xuống dưới đáy ảnh.
 */
function MetaRow({
  post,
  compact = false,
}: {
  post: PostWithTags;
  compact?: boolean;
}) {
  const { lang, jl, ja, isPublic } = usePostView(post);

  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
      {!isPublic && (
        <span
          lang={jl}
          className="tag rounded-full bg-down/10 px-2 py-0.5 text-down"
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

      {post.tags.slice(0, compact ? 1 : 3).map((tag) => (
        <span key={tag.id} className="tag">
          · {tag.name}
        </span>
      ))}

      {!compact && hasJa(post) && !ja && (
        <span lang="ja" className="tag">
          · 日本語版あり
        </span>
      )}
    </div>
  );
}

/**
 * Ô ảnh bìa — và cái thay thế khi bài KHÔNG có ảnh.
 *
 * Bài không ảnh là chuyện thường (bài đầu tiên của trang này chính là một bài
 * như thế). Để trống một ô xám là khoảng hổng trông như ảnh tải hỏng; còn nhét
 * ảnh mặc định vào thì trang thật của một người thật lại có một tấm ảnh không
 * phải của họ.
 *
 * Cách thứ ba: in NGÀY bằng font mono cỡ lớn. Nó không giả vờ là ảnh, đọc ra
 * ngay là một tấm bìa có chủ ý, và dùng đúng chất bảng-điều-khiển đã có sẵn ở
 * `// identity_specs` và ở khung liên hệ.
 */
function Cover({
  post,
  size,
}: {
  post: PostWithTags;
  /** `lg` = bìa thẻ nổi bật · `sm` = ô vuông của thẻ phụ. */
  size: "lg" | "sm";
}) {
  if (post.cover) {
    return (
      /* Ảnh đi qua /api/uploads (kiểm quyền từng tấm) — next/image không qua
         đó, nên phải dùng <img> trần. Cùng lý do với PostCard/PhotoGrid. */
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={post.cover.url}
        alt=""
        loading="lazy"
        decoding="async"
        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
    );
  }

  // `getUTC*`: `fmtDate` cũng đọc ở UTC, nên hai chỗ không bao giờ nói hai ngày
  // khác nhau cho cùng một bài. Xem luật #2 trong CLAUDE.md.
  const d = post.publishedAt;
  const y = d ? String(d.getUTCFullYear()) : "····";
  const md = d
    ? `${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`
    : "··.··";

  if (size === "sm") {
    return (
      <div className="flex size-full flex-col items-center justify-center bg-surface-2">
        <span className="font-mono text-[15px] font-medium tabular-nums text-ink-2">
          {md}
        </span>
        <span className="tag mt-0.5">{y}</span>
      </div>
    );
  }

  return (
    <div className="flex size-full items-center justify-center bg-surface-2">
      <span className="font-mono text-[clamp(30px,5vw,46px)] tabular-nums tracking-[0.06em] text-ink-3/45">
        {y}.{md}
        {/* Chấm tròn màu nhấn — cùng chi tiết đã dùng sau tên ở hero và sau mọi
            tiêu đề mục. Nó là thứ khiến tấm bìa chữ này thuộc về trang, chứ
            không phải một ô trống được vá lại. */}
        <span
          aria-hidden
          className="ml-[0.12em] inline-block size-[0.14em] rounded-full bg-accent align-baseline"
        />
      </span>
    </div>
  );
}

/** Thẻ lớn — bài mới nhất. */
function Featured({ post }: { post: PostWithTags }) {
  const { lang, jl, ja, href, title } = usePostView(post);

  return (
    <article className="group">
      <Link
        href={href}
        className="flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface transition-colors hover:border-ink-3"
      >
        {/* Chiều cao CỐ ĐỊNH theo bề ngang màn hình, không dùng `aspect-*`:
            khi chỉ có một bài thì thẻ này chiếm trọn 1240px, mà tỉ lệ 16/10 ở
            bề ngang đó cho ra tấm bìa cao 775px — cao hơn cả màn hình. */}
        <div className="relative h-[200px] w-full overflow-hidden md:h-[300px] lg:h-[340px]">
          <Cover post={post} size="lg" />

          {/* Nhãn «mới nhất»: lý do thẻ này to hơn hai thẻ kia phải nói ra
              thành chữ. Không có nó thì kích thước đọc ra là ngẫu nhiên. */}
          <span
            lang={jl}
            className="tag absolute left-4 top-4 rounded-full bg-ink px-3 py-1.5 text-bg"
          >
            {t.blog.latest[lang]}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6 md:p-7">
          <MetaRow post={post} />

          <h3
            lang={ja ? "ja" : undefined}
            className="mt-3 text-balance text-[26px] font-semibold leading-[1.14] tracking-[-0.02em] transition-colors group-hover:text-accent md:text-[32px]"
          >
            {title}
          </h3>

          {post.excerpt && (
            <p className="mt-3 max-w-[54ch] text-[15px] leading-relaxed text-ink-2">
              {post.excerpt}
            </p>
          )}

          {/* `mt-auto`: lời mời bấm luôn nằm sát đáy thẻ dù mô tả dài ngắn khác
              nhau — nếu không, thẻ lớn và cột thẻ nhỏ bên cạnh sẽ kết thúc ở
              hai độ cao lệch nhau. */}
          <span className="tag mt-auto flex items-center gap-1.5 pt-6 text-ink-2 transition-colors group-hover:text-accent">
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

/** Thẻ nhỏ — ô vuông bên trái, chữ bên phải. */
function Row({ post }: { post: PostWithTags }) {
  const { ja, href, title } = usePostView(post);

  return (
    <article className="group flex-1">
      <Link
        href={href}
        className="flex h-full gap-4 rounded-[var(--radius-xl)] border border-line bg-surface p-4 transition-colors hover:border-ink-3 md:p-5"
      >
        {/* Ảnh KÉO HẾT chiều cao thẻ (`self-stretch` mặc định của flex), không
            phải một ô vuông cố định.

            Cột phải luôn cao đúng bằng thẻ nổi bật bên trái — đó là ràng buộc
            của lưới, không phải lựa chọn. Nên hai thẻ ở đây bị kéo cao hơn nội
            dung của chúng: ô vuông 92px trong một thẻ cao 270px để lại một
            khoảng trống lớn dưới đáy, trông như thẻ tải thiếu. Ảnh dọc lấp
            đúng khoảng đó và biến ràng buộc thành một bố cục có chủ ý. */}
        <div className="w-[92px] shrink-0 overflow-hidden rounded-[var(--radius-lg)] md:w-[140px]">
          <Cover post={post} size="sm" />
        </div>

        {/* `justify-center`: chữ ít hơn chiều cao thẻ thì dồn vào giữa, không
            dính lên mép trên rồi bỏ trống nửa dưới. */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <MetaRow post={post} compact />

          <h3
            lang={ja ? "ja" : undefined}
            className="mt-2 line-clamp-2 text-balance text-[16px] font-semibold leading-snug tracking-[-0.01em] transition-colors group-hover:text-accent md:text-[17px]"
          >
            {title}
          </h3>

          {post.excerpt && (
            <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink-2">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Mũi tên chéo thay cho chữ "đọc bài": thẻ nhỏ không đủ chỗ cho một
            dòng nữa, mà hướng chéo lên vốn đã là ký hiệu "mở cái này". */}
        <ArrowUpRight
          size={16}
          strokeWidth={1.75}
          aria-hidden
          className="mt-0.5 shrink-0 self-start text-ink-3 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
        />
      </Link>
    </article>
  );
}

export function WritingGrid({ posts }: { posts: PostWithTags[] }) {
  if (posts.length === 0) return null;

  const [featured, ...rest] = posts;

  return (
    // Chỉ chia hai cột khi THẬT SỰ có bài cho cột phải. Lưới hai cột với cột
    // phải rỗng để lại đúng một nửa mục là khoảng trắng không giải thích được.
    <div
      className={`grid gap-5 ${rest.length > 0 ? "lg:grid-cols-[1.3fr_1fr]" : ""}`}
    >
      <Featured post={featured} />

      {rest.length > 0 && (
        <div className="flex flex-col gap-5">
          {rest.map((p) => (
            <Row key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
