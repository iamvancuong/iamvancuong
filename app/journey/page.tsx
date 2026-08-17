import type { Metadata } from "next";
import { Visibility } from "@prisma/client";
import { Container } from "@/components/layout/Container";
import { db } from "@/lib/db";
import { site } from "@/lib/site";
import {
  PublicJourneyView,
  type MemoriesByMonth,
} from "@/components/journey/PublicJourneyView";
import { mergeTimeline } from "@/lib/timeline";
import { todayISO } from "@/lib/os/day";

export const metadata: Metadata = {
  title: "Hành trình",
  description: `Những gì tôi đã đi qua — từ ${site.hometown} tới Nhật.`,
};

function fmt(d: Date) {
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(
    d.getUTCMonth() + 1,
  ).padStart(2, "0")}`;
}

/**
 * Bản công khai của /os/journey — CHỈ những ký ức đã tick "cho người khác xem".
 * Gom theo năm rồi giao cho client view (chrome song ngữ; nội dung giữ nguyên).
 */
export default async function PublicJourneyPage() {
  const memories = await db.memory.findMany({
    where: { visibility: Visibility.PUBLIC },
    orderBy: { date: "desc" },
    include: {
      photos: {
        where: { visibility: Visibility.PUBLIC },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
      area: { select: { name: true } },
    },
  });

  /**
   * Gom theo `"<năm>-<tháng>"` chứ không chỉ theo năm.
   *
   * Ô tháng trên trang giờ là NÚT BẤM mở ra ký ức của đúng tháng đó, nên khóa
   * phải khớp tới cấp tháng. Gom sẵn ở server (một vòng lặp) thay vì để client
   * lọc lại cả mảng mỗi lần bấm.
   *
   * `getUTCMonth()` chứ không phải `getMonth()`: ngày lưu ở nửa đêm UTC, mà
   * JST là UTC+9 — đọc theo giờ máy thì ký ức ngày mùng 1 rơi về tháng trước.
   * Xem luật #2 trong CLAUDE.md.
   */
  const byMonth: MemoriesByMonth = {};
  for (const m of memories) {
    const key = `${m.date.getUTCFullYear()}-${m.date.getUTCMonth() + 1}`;
    (byMonth[key] ??= []).push({
      id: m.id,
      dateISO: m.date.toISOString(),
      dateLabel: fmt(m.date),
      title: m.title,
      body: m.body,
      learned: m.learned,
      place: m.place,
      area: m.area?.name ?? null,
      photos: m.photos.map((p) => ({
        id: p.id,
        url: p.url,
        thumbUrl: p.thumbUrl,
        caption: p.caption ?? m.title,
        width: p.width,
        height: p.height,
      })),
    });
  }

  // Trong một tháng thì kể theo thứ tự thời gian THUẬN — truy vấn lấy giảm dần
  // vì cấp năm cần mới-nhất-trước, nhưng đọc một tháng mà ngày 28 đứng trên
  // ngày 3 thì câu chuyện chạy ngược.
  for (const list of Object.values(byMonth)) {
    list.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  }

  // Khung RỘNG, không phải khung đọc 720px: trang này là lưới ô tháng, không phải
  // một bài để đọc từ đầu tới cuối.
  /**
   * Khung năm dựng sẵn — trang có hình hài ngay cả khi chưa có ký ức nào.
   *
   * `todayISO()` (JST cố định) chứ không phải `new Date()` của trình duyệt:
   * năm/tháng "hiện tại" phải giống nhau ở server và ở client, nếu không React
   * báo lệch hydration vào đúng đêm giao thừa — và chỉ đêm đó.
   */
  const iso = todayISO();
  const rows = mergeTimeline(
    memories.map((m) => ({
      year: m.date.getUTCFullYear(),
      month: m.date.getUTCMonth() + 1,
    })),
    Number(iso.slice(0, 4)),
    Number(iso.slice(5, 7)),
  );

  return (
    <Container>
      <PublicJourneyView rows={rows} memoriesByMonth={byMonth} />
    </Container>
  );
}
