import type { Post, Tag } from "@prisma/client";

/**
 * Helper THUẦN cho bài viết — KHÔNG chạm database, nên dùng được cả ở client
 * (PostCard, BlogListView) lẫn server. Tách khỏi `lib/posts.ts` vì file đó import
 * `db`/`session` (mysql → fs/tls/net), sẽ vỡ nếu lọt vào bundle client.
 */

export type Lang = "vi" | "ja";
export type PostWithTags = Post & { tags: Tag[] };

export function hasJa(p: Pick<Post, "bodyJa">): boolean {
  return !!p.bodyJa?.trim();
}

export function fmtDate(d: Date | null, lang: Lang = "vi"): string {
  if (!d) return "";
  return new Intl.DateTimeFormat(lang === "ja" ? "ja-JP" : "vi-VN", {
    year: "numeric",
    month: lang === "ja" ? "long" : "2-digit",
    day: lang === "ja" ? "numeric" : "2-digit",
    timeZone: "UTC",
  }).format(d);
}

/** Bỏ dấu tiếng Việt để sinh slug sạch từ tiêu đề hoặc tên chủ đề. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
