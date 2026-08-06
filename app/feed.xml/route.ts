import { Visibility } from "@prisma/client";
import { db } from "@/lib/db";
import { site } from "@/lib/site";

/**
 * RSS — /feed.xml
 *
 * `force-dynamic` vì đúng lý do sitemap phải có nó (xem `app/sitemap.ts`):
 * Next mặc định coi route handler không tham số là tĩnh và đóng băng nó ở
 * thời điểm build, nên bài xuất bản sau đó sẽ không bao giờ vào feed. Kiểu
 * hỏng đó không có lỗi nào để thấy — chỉ là người đăng ký mãi không nhận được
 * bài mới.
 */
export const dynamic = "force-dynamic";

/** Escape cho nội dung nằm giữa hai thẻ XML. */
function xml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  // Chỉ bài đã công khai. Bài riêng tư lọt vào đây là rò rỉ y như lọt vào
  // sitemap — cùng một cột `visibility` canh cả hai chỗ.
  const posts = await db.post.findMany({
    where: { visibility: Visibility.PUBLIC, publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });

  const updated = posts[0]?.publishedAt ?? new Date();

  const items = posts
    .map((p) => {
      // Mô tả dùng `excerpt`; không có thì cắt từ thân bài. Không nhét cả bài
      // vào feed: bài viết ở đây có ảnh và liên kết nội bộ, đọc trên trang
      // đúng hơn, và feed đầy đủ làm mất hẳn số liệu ai thật sự đọc gì.
      const desc = p.excerpt ?? p.body.replace(/[#*`>\-\[\]]/g, "").slice(0, 300);
      return `    <item>
      <title>${xml(p.title)}</title>
      <link>${site.url}/blog/${p.slug}</link>
      <guid isPermaLink="true">${site.url}/blog/${p.slug}</guid>
      <pubDate>${p.publishedAt!.toUTCString()}</pubDate>
      <description>${xml(desc)}</description>
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(site.name)} — ${xml(site.tagline)}</title>
    <link>${site.url}</link>
    <description>${xml(site.description)}</description>
    <language>vi</language>
    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // Bot đọc feed thường xuyên; một giờ là đủ tươi mà không đánh thẳng vào
      // database mỗi lần.
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
