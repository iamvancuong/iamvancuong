import type { Metadata } from "next";
import { Visibility } from "@prisma/client";
import { Container } from "@/components/layout/Container";
import { db } from "@/lib/db";
import { site } from "@/lib/site";
import {
  PublicJourneyView,
  type JourneyYearGroup,
} from "@/components/journey/PublicJourneyView";

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

  const byYear = new Map<number, JourneyYearGroup["memories"]>();
  for (const m of memories) {
    const y = m.date.getUTCFullYear();
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push({
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

  const years: JourneyYearGroup[] = [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, memories]) => ({ year, memories }));

  // Khung RỘNG, không phải khung đọc 720px: trang này là lưới ô tháng, không phải
  // một bài để đọc từ đầu tới cuối.
  return (
    <Container>
      <PublicJourneyView years={years} />
    </Container>
  );
}
