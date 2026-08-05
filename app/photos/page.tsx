import Link from "next/link";
import type { Metadata } from "next";
import { Visibility } from "@prisma/client";
import { Container } from "@/components/layout/Container";
import { db } from "@/lib/db";
import { PhotoGallery } from "@/components/PhotoGallery";

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

  // Gom theo tháng
  const byMonth = new Map<string, typeof photos>();
  for (const p of photos) {
    const d = whenOf(p);
    const key = d
      ? `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
      : "khac";
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(p);
  }

  return (
    <Container>
      <header className="border-b border-line pb-8">
        <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Ảnh</h1>
        <p className="mt-2 text-[16px] text-ink-2">
          Cuộc sống ở Nhật, ghi lại bằng ảnh.
        </p>
      </header>

      {photos.length === 0 ? (
        <p className="mt-10 text-[15px] text-ink-2">
          Chưa có ảnh nào được chia sẻ.{" "}
          <Link
            href="/journey"
            className="text-accent underline underline-offset-2"
          >
            Xem hành trình
          </Link>
        </p>
      ) : (
        <PhotoGallery
          sections={[...byMonth.entries()]
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([key, list]) => {
              const [y, m] = key.split("-");
              return {
                key,
                label:
                  key === "khac" ? "Không rõ thời gian" : `Tháng ${m}, ${y}`,
                photos: list.map((p) => ({
                  id: p.id,
                  url: p.url,
                  thumbUrl: p.thumbUrl,
                  caption: p.caption ?? p.memory?.title ?? null,
                  width: p.width,
                  height: p.height,
                })),
              };
            })}
        />
      )}
    </Container>
  );
}
