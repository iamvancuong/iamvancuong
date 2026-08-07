import { Visibility } from "@prisma/client";
import { db } from "@/lib/db";
import type { LightboxPhoto } from "@/components/Lightbox";

/**
 * Dữ liệu "Chặng đường ở Nhật" cho TRANG CHỦ — đọc thẳng từ Life OS, KHÔNG fix cứng.
 *
 * Cùng kho ký ức với /os/journey và /journey, chỉ khác cách gom: theo NĂM → THÁNG
 * để trang chủ mở ra được từng tầng. Chỉ lấy ký ức + ảnh đã tick "cho người khác xem".
 * Viết một lần trong /os, tick vào là hiện ở đây.
 */

export type JourneyMemory = {
  id: string;
  day: number; // ngày trong tháng (UTC)
  date: string; // ISO, cho <time dateTime>
  title: string;
  body: string | null;
  learned: string | null;
  place: string | null;
  area: string | null;
  photos: LightboxPhoto[];
};

export type JourneyMonth = {
  month: number; // 1..12
  memories: JourneyMemory[];
  photos: LightboxPhoto[]; // gộp cả tháng — cho lightbox & đếm
};

export type JourneyYear = {
  year: number;
  months: JourneyMonth[];
  memoryCount: number;
  photoCount: number;
};

export async function getPublicJourney(): Promise<JourneyYear[]> {
  const memories = await db.memory.findMany({
    where: { visibility: Visibility.PUBLIC },
    orderBy: { date: "asc" }, // kể theo chiều thời gian: cũ → mới, xuôi theo đường nối
    include: {
      photos: {
        where: { visibility: Visibility.PUBLIC },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
      area: { select: { name: true } },
    },
  });

  // year → (month → memories[]), giữ thứ tự chèn (đã sort ở query).
  const years = new Map<number, Map<number, JourneyMemory[]>>();
  for (const m of memories) {
    const y = m.date.getUTCFullYear();
    const mo = m.date.getUTCMonth() + 1;
    if (!years.has(y)) years.set(y, new Map());
    const months = years.get(y)!;
    if (!months.has(mo)) months.set(mo, []);
    months.get(mo)!.push({
      id: m.id,
      day: m.date.getUTCDate(),
      date: m.date.toISOString(),
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

  return [...years.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, months]) => {
      const monthList: JourneyMonth[] = [...months.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([month, mems]) => ({
          month,
          memories: mems,
          photos: mems.flatMap((x) => x.photos),
        }));
      return {
        year,
        months: monthList,
        memoryCount: monthList.reduce((n, x) => n + x.memories.length, 0),
        photoCount: monthList.reduce((n, x) => n + x.photos.length, 0),
      };
    });
}
