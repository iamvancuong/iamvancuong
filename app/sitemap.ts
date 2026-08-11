import type { MetadataRoute } from "next";
import { Visibility } from "@prisma/client";
import { db } from "@/lib/db";
import { hasJa } from "@/lib/posts";
import { site } from "@/lib/site";

/**
 * Sinh lại theo từng lượt truy cập, KHÔNG dựng tĩnh.
 *
 * Mặc định Next coi sitemap là route tĩnh và đóng băng nó ở thời điểm build —
 * kể cả `next build` lần sau cũng khôi phục lại từ cache thay vì chạy lại.
 * Hậu quả đã gặp thật: xuất bản một bài, bài hiện đầy đủ trên /blog và trang
 * chủ, nhưng sitemap vẫn là danh sách cũ nên Google không bao giờ biết tới nó.
 *
 * Đây là kiểu hỏng tệ nhất: không có lỗi nào để thấy, chỉ là mãi không ai vào
 * đọc. Sitemap gần như chỉ có bot gọi tới, nên render động không tốn gì —
 * đổi lấy việc nó luôn đúng thì quá rẻ.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Chỉ bài đã công khai — bài riêng tư không được lộ qua sitemap
  const posts = await db.post.findMany({
    where: { visibility: Visibility.PUBLIC, publishedAt: { not: null } },
  });

  const staticPages = ["", "/now", "/blog", "/journey", "/photos", "/projects", "/cv", "/about"].map(
    (p) => ({
      url: `${site.url}${p}`,
      lastModified: new Date(),
      priority: p === "" ? 1 : 0.8,
    }),
  );

  const postPages = posts.flatMap((p) => {
    const entries = [
      { url: `${site.url}/blog/${p.slug}`, lastModified: p.updatedAt },
    ];
    if (hasJa(p)) {
      entries.push({
        url: `${site.url}/blog/${p.slug}/ja`,
        lastModified: p.updatedAt,
      });
    }
    return entries;
  });

  return [...staticPages, ...postPages];
}
