import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Visibility } from "@prisma/client";
import { Container } from "@/components/layout/Container";
import { LanguageToggle } from "./LanguageToggle";
import { fmtDate, hasJa, type Lang, type PostWithTags } from "@/lib/posts";
import { renderMarkdown } from "@/lib/markdown";
import { t } from "@/lib/i18n";

/**
 * Trang đọc một bài — dùng chung cho `/blog/[slug]` và `/blog/[slug]/ja`.
 *
 * ## Nền TRẮNG, không phải nền kem
 *
 * Cả site chạy trên nền kem `--color-bg`, còn thứ để ĐỌC thì luôn nằm trên
 * `--color-surface`: thẻ bài, thẻ dự án, khung "Dạo này" — tất cả đều trắng.
 * Riêng trang đọc bài, thứ để đọc lâu nhất trong cả site, lại nằm thẳng trên
 * kem. Nó là ngoại lệ duy nhất, mà một ngoại lệ không có lý do thì đọc ra là
 * lỗi chứ không đọc ra là chủ ý.
 *
 * Dùng `.band band-white` — cùng cơ chế đã tạo ra các dải trắng ở trang chủ,
 * nên bề rộng nền tràn hết màn hình mà KHÔNG dùng `100vw` (xem globals.css:
 * `100vw` tính cả thanh cuộn nên sinh tràn ngang trên Windows).
 *
 * `-my-10 md:-my-16` nuốt đúng phần đệm của `<main>` rồi trả lại bằng `py`
 * tương ứng: nếu không, phía trên và phía dưới bài còn hai vệt kem mỏng, và
 * chúng trông như nền bị hở chứ không như khoảng thở.
 */
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
    <div className="band band-white -my-10 py-10 md:-my-16 md:py-16">
      <Container width="prose">
        {/* Chỉ hiện khi bạn đăng nhập — khách không tới được bài riêng tư */}
        {!isPublic && (
          <p
            lang={ja ? "ja" : undefined}
            className="mb-8 rounded-[var(--radius-md)] border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink-2"
          >
            {t.postView.privateNote[lang]}{" "}
            <Link
              href={`/os/write/${post.slug}`}
              className="text-accent underline underline-offset-2"
            >
              {t.postView.editPublish[lang]}
            </Link>
          </p>
        )}

        <article lang={lang}>
          <header className="border-b border-line pb-8">
            {/* Hàng siêu dữ liệu bằng `.tag` — CÙNG một hàng, cùng thứ tự, cùng
                kiểu chữ với thẻ bài ở trang chủ và ở /blog. Trước đây chỗ này
                là chữ thường màu nhạt, nên đi từ danh sách bài sang trang bài
                là đổi hẳn giọng dù vẫn đúng một bộ thông tin. */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              {post.publishedAt && (
                <time
                  dateTime={post.publishedAt.toISOString()}
                  className="tag tabular-nums"
                >
                  {fmtDate(post.publishedAt, lang)}
                </time>
              )}
              {/* Nhãn chủ đề đang là tiếng Việt — không hiện trên trang tiếng Nhật */}
              {!ja &&
                post.tags.map((tag) => (
                  <span key={tag.id} className="tag">
                    · {tag.name}
                  </span>
                ))}
            </div>

            <h1 className="mt-4 text-balance text-[32px] font-semibold leading-[1.15] tracking-[-0.025em] md:text-[40px]">
              {title}
              {/* Dấu chấm màu nhấn — cùng ký tự kết đã đặt ở logo, ở tiêu đề
                  mọi trang và mọi mục. Thiếu nó thì đúng trang này lạc giọng. */}
              <span className="text-accent">.</span>
            </h1>

            <div className="mt-6">
              <LanguageToggle slug={post.slug} hasJa={hasJa(post)} current={lang} />
            </div>

            {/**
              * Câu này đã đổi cùng lúc với việc thêm nút dịch bằng AI.
              *
              * Bản cũ viết 「日本語の練習として書いています」 — "tôi viết bài này
              * để luyện tiếng Nhật". Câu đó đúng khi mọi bản tiếng Nhật đều do
              * chủ nhân tự gõ. Từ lúc có nút dịch thì nó không còn chắc đúng
              * nữa, mà một câu nói với người đọc về CÁCH bài được viết ra thì
              * không được phép "gần đúng".
              *
              * Bản mới đúng trong cả hai trường hợp — tự viết hay AI dịch rồi
              * sửa — và vẫn nói được điều có ích: bản gốc đầy đủ hơn.
              */}
            {ja && (
              <p className="mt-4 text-[13px] leading-relaxed text-ink-3">
                この記事はベトナム語版をもとにした日本語版です。詳しくはベトナム語版をご覧ください。
              </p>
            )}
          </header>

          <div className="prose mt-10" dangerouslySetInnerHTML={{ __html: html }} />
        </article>

        {/* Viên thuốc, không phải link chữ — cùng kiểu với «Xem tất cả →» ở
            trang chủ và «Xem tất cả hành trình →» ở mục Chặng đường. */}
        <div className="mt-16 border-t border-line pt-8">
          <Link
            href="/blog"
            className="tag inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 transition-colors hover:border-ink-3 hover:text-ink"
          >
            <ArrowLeft size={13} strokeWidth={2} aria-hidden />
            {ja ? "記事一覧" : "Tất cả bài viết"}
          </Link>
        </div>
      </Container>
    </div>
  );
}
