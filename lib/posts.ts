import { Visibility } from "@prisma/client";
import { db } from "./db";
import { isOwner } from "./session";

/**
 * Bài viết nằm trong MySQL, viết ngay trong /os/write.
 *
 * Bài công khai và bài riêng tư là CÙNG MỘT KHO, khác nhau đúng một trường
 * `visibility`. Không cần hệ thống thứ hai cho "blog riêng tôi xem".
 *
 * Helper thuần (hasJa/fmtDate/slugify + type) ở `lib/posts-format.ts` để client
 * dùng được mà không kéo `db` vào bundle. Re-export lại đây cho tiện phía server.
 */
export {
  hasJa,
  fmtDate,
  slugify,
} from "./posts-format";
export type { Lang, PostWithTags } from "./posts-format";

import type { PostWithTags } from "./posts-format";

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
