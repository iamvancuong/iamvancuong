import type { Metadata } from "next";
import { Visibility } from "@prisma/client";
import { Container } from "@/components/layout/Container";
import { db } from "@/lib/db";
import { PhotosView, type PhotoMonth } from "@/components/photos/PhotosView";

export const metadata: Metadata = {
  title: "Ảnh",
  description: "Cuộc sống ở Nhật, ghi lại bằng ảnh.",
};

/** Ưu tiên ngày chụp; ảnh không có EXIF thì lấy ngày của ký ức chứa nó. */
function whenOf(p: { takenAt: Date | null; memory: { date: Date } | null }) {
  return p.takenAt ?? p.memory?.date ?? null;
}

export default async function PhotosPage() {
  const photos = await db.photo.findMany({
    where: { visibility: Visibility.PUBLIC },
    include: { memory: { select: { title: true, date: true } } },
    orderBy: [{ takenAt: "desc" }, { createdAt: "desc" }],
  });

  // Gom theo tháng (key = "YYYY-MM" hoặc "khac")
  const byMonth = new Map<string, typeof photos>();
  for (const p of photos) {
    const d = whenOf(p);
    const key = d
      ? `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
      : "khac";
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(p);
  }

  const months: PhotoMonth[] = [...byMonth.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, list]) => {
      const [y, m] = key === "khac" ? [null, null] : key.split("-").map(Number);
      return {
        key,
        year: y,
        month: m,
        photos: list.map((p) => ({
          id: p.id,
          url: p.url,
          thumbUrl: p.thumbUrl,
          caption: p.caption ?? p.memory?.title ?? null,
          width: p.width,
          height: p.height,
        })),
      };
    });

  return (
    <Container>
      <PhotosView months={months} />
    </Container>
  );
}
