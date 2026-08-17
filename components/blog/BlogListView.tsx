"use client";

import Link from "next/link";
import type { Tag } from "@prisma/client";
import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/PageHeader";
import { PostCard } from "./PostCard";
import type { PostWithTags } from "@/lib/posts-format";

/**
 * Danh sách bài viết — chrome song ngữ. Tên chủ đề (tag) và tiêu đề bài là
 * dữ liệu, giữ nguyên. Bài có bản JA sẽ tự mở /ja khi đang xem tiếng Nhật (PostCard).
 */
export function BlogListView({
  posts,
  tags,
  active,
  privateCount,
}: {
  posts: PostWithTags[];
  tags: Tag[];
  active: string;
  privateCount: number;
}) {
  const { lang } = useLang();
  const jl = lang === "ja" ? "ja" : undefined;

  const filters = [
    { key: "all", label: t.blog.all[lang], lang: jl },
    ...tags.map((tag) => ({ key: tag.slug, label: tag.name, lang: undefined })),
    { key: "ja", label: "日本語", lang: "ja" as const },
  ];

  return (
    <>
      <PageHeader
        index={1}
        label="Viết"
        en="Writing"
        lang={jl}
        title={t.blog.title[lang]}
      >
        {t.blog.subtitle[lang]}
      </PageHeader>

      {/* Viên bo tròn hẳn: viên bo 6px trông như ô nhập liệu, bo tròn hẳn thì
          đọc ra ngay là bộ lọc bấm được. */}
      <nav className="mt-8 flex flex-wrap gap-2">
        {filters.map((f) => {
          const on = f.key === active;
          return (
            <Link
              key={f.key}
              href={f.key === "all" ? "/blog" : `/blog?tag=${f.key}`}
              lang={f.lang}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
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

      {/* Chỉ chủ nhân thấy dòng này — server đã lọc bài riêng tư với khách */}
      {privateCount > 0 && (
        <p lang={jl} className="mt-6 rounded-[var(--radius-md)] border border-line bg-surface px-3 py-2 text-[13px] text-ink-2">
          {t.blog.privateNote[lang].replace("{n}", String(privateCount))}{" "}
          <Link href="/os/write" className="text-accent underline underline-offset-2">
            {t.blog.manage[lang]}
          </Link>
        </p>
      )}

      {/* `space-y-5` — thiếu nó thì các thẻ bài DÍNH LIỀN nhau thành một khối
          dài, và vì mỗi thẻ đều có viền nên hai thẻ cạnh nhau tạo ra một đường
          kẻ đôi ở chỗ giáp ranh: nhìn ra là một bảng, không ra mấy bài riêng.
          Cùng khoảng cách với thẻ ở trang Hồ sơ và mục Viết ở trang chủ. */}
      <div className="mt-8 space-y-5">
        {posts.length > 0 ? (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        ) : (
          <p lang={jl} className="text-[15px] text-ink-2">
            {t.blog.empty[lang]}
          </p>
        )}
      </div>
    </>
  );
}
