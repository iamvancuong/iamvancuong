import Link from "next/link";
import type { Lang } from "@/lib/posts";

/**
 * Nút này CHỈ hiện khi bài thực sự có bản tiếng Nhật.
 * Không có → không render gì, không trang trống, không coi là lỗi.
 */
export function LanguageToggle({
  slug,
  hasJa,
  current,
}: {
  slug: string;
  hasJa: boolean;
  current: Lang;
}) {
  if (!hasJa) return null;

  const base =
    "px-2.5 py-1 text-[13px] transition-colors first:border-r first:border-line";
  const on = "bg-surface-2 text-ink font-medium";
  const off = "text-ink-2 hover:text-ink";

  return (
    <div className="inline-flex overflow-hidden rounded-[var(--radius-md)] border border-line">
      <Link
        href={`/blog/${slug}`}
        className={`${base} ${current === "vi" ? on : off}`}
      >
        Tiếng Việt
      </Link>
      <Link
        href={`/blog/${slug}/ja`}
        lang="ja"
        className={`${base} ${current === "ja" ? on : off}`}
      >
        日本語
      </Link>
    </div>
  );
}
