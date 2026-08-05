import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isOwner } from "@/lib/session";

export const runtime = "nodejs";

/**
 * Xuất toàn bộ Life OS ra một file JSON.
 *
 * Database đã an toàn hơn localStorage nhiều, nhưng backup vẫn cần: ổ cứng
 * hỏng, xóa nhầm, hoặc đơn giản là muốn giữ ảnh chụp dữ liệu tại một thời
 * điểm. Ảnh KHÔNG nằm trong file này — chúng ở thư mục uploads, sao lưu
 * riêng bằng cách copy cả thư mục.
 */
export async function GET() {
  if (!(await isOwner())) {
    return new Response("Not found", { status: 404 });
  }

  const [areas, goals, principles, items, memories, photos, focus, logs, tags, posts] =
    await Promise.all([
      db.area.findMany(),
      db.goal.findMany(),
      db.principle.findMany(),
      db.item.findMany(),
      db.memory.findMany(),
      db.photo.findMany(),
      db.focusItem.findMany(),
      db.dailyLog.findMany(),
      db.tag.findMany(),
      // Kèm quan hệ nhiều-nhiều với Tag, nếu không phục hồi xong bài sẽ mất
      // hết nhãn chủ đề mà không ai nhận ra.
      db.post.findMany({ include: { tags: { select: { id: true } } } }),
    ]);

  const backup = {
    app: "iamvancuong-os",
    version: 3,
    exportedAt: new Date().toISOString(),
    data: {
      areas,
      goals,
      principles,
      items,
      memories,
      photos,
      focus,
      logs,
      tags,
      posts,
    },
  };

  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${date}.os-backup.json"`,
    },
  });
}
