import { Visibility, type Post, type Tag } from "@prisma/client";
import { db } from "./db";
import { isOwner } from "./session";

/**
 * Bài viết nằm trong MySQL, viết ngay trong /os/write.
 *
 * Bài công khai và bài riêng tư là CÙNG MỘT KHO, khác nhau đúng một trường
 * `visibility`. Không cần hệ thống thứ hai cho "blog riêng tôi xem".
 */

export type Lang = "vi" | "ja";
export type PostWithTags = Post & { tags: Tag[] };

export function hasJa(p: Pick<Post, "bodyJa">): boolean {
  return !!p.bodyJa?.trim();
}

/** Chủ đề nằm trong dữ liệu — tạo mới lúc viết bài, /blog tự có bộ lọc. */
export function listTags() {
  return db.tag.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
}

/**
 * Danh sách bài. Khách chỉ thấy bài PUBLIC đã xuất bản; đăng nhập rồi thì
 * thấy cả bài riêng tư và bản nháp.
 */
export async function listPosts(): Promise<PostWithTags[]> {
  const owner = await isOwner();

  return db.post.findMany({
    where: owner
      ? undefined
      : { visibility: Visibility.PUBLIC, publishedAt: { not: null } },
    include: { tags: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getPost(slug: string): Promise<PostWithTags | null> {
  const post = await db.post.findUnique({
    where: { slug },
    include: { tags: true },
  });
  if (!post) return null;

  // Bài riêng tư / chưa xuất bản: coi như không tồn tại với khách.
  const visible =
    post.visibility === Visibility.PUBLIC && post.publishedAt !== null;
  if (!visible && !(await isOwner())) return null;

  return post;
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
