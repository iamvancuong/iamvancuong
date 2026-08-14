import { Visibility } from "@prisma/client";
import { db } from "@/lib/db";
import type { StripItem } from "@/components/home/PhotoStrip";

/**
 * Hai dải ảnh của trang chủ: hành trình và blog.
 *
 * Điều kiện để một tấm lên trang chủ là **ba thứ cùng lúc**:
 *   1. ký ức / bài đã công khai,
 *   2. đã tick «hiện ở trang chủ» (`showOnHome`),
 *   3. và nó có ít nhất một tấm ảnh.
 *
 * Điều kiện 3 lọc ở TRONG code chứ không phải trong câu truy vấn: SQL không
 * lọc theo "có phần tử con nào không" mà không phải join thêm, và số bản ghi ở
 * đây là hàng chục chứ không phải hàng vạn. Bù lại `take` phải lấy dư một ít,
 * vì vài bản ghi sẽ rụng ở bước lọc này.
 *
 * Ảnh bìa = tấm ĐẦU TIÊN theo `Photo.order`. Không thêm cột `coverId`: thứ tự
 * ảnh đã sắp được bằng hai nút lên/xuống có sẵn, nên "đổi ảnh bìa" chính là
 * "đưa tấm đó lên đầu" — một khái niệm thay vì hai.
 */

const ROW = 10;

/** Lấy dư rồi mới lọc bản ghi không có ảnh — xem chú thích ở trên. */
const FETCH = ROW * 3;

const cover = {
  orderBy: [{ order: "asc" as const }, { createdAt: "asc" as const }],
  take: 1,
  select: {
    id: true,
    url: true,
    thumbUrl: true,
    width: true,
    height: true,
  },
};

export async function getHomeStrips(): Promise<{
  journey: StripItem[];
  blog: StripItem[];
}> {
  const [memories, posts] = await Promise.all([
    db.memory.findMany({
      where: { visibility: Visibility.PUBLIC, showOnHome: true },
      orderBy: { date: "desc" },
      take: FETCH,
      select: { id: true, title: true, photos: cover },
    }),
    db.post.findMany({
      where: {
        visibility: Visibility.PUBLIC,
        publishedAt: { not: null },
        showOnHome: true,
      },
      orderBy: { publishedAt: "desc" },
      take: FETCH,
      select: { id: true, slug: true, title: true, photos: cover },
    }),
  ]);

  return {
    journey: memories
      .filter((m) => m.photos.length > 0)
      .slice(0, ROW)
      .map((m) => ({
        id: m.id,
        href: "/journey",
        url: m.photos[0].url,
        thumbUrl: m.photos[0].thumbUrl,
        caption: m.title,
        width: m.photos[0].width,
        height: m.photos[0].height,
      })),
    blog: posts
      .filter((p) => p.photos.length > 0)
      .slice(0, ROW)
      .map((p) => ({
        id: p.id,
        href: `/blog/${p.slug}`,
        url: p.photos[0].url,
        thumbUrl: p.photos[0].thumbUrl,
        caption: p.title,
        width: p.photos[0].width,
        height: p.photos[0].height,
      })),
  };
}
