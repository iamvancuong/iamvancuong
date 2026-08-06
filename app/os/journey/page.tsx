import type { Metadata } from "next";
import { db } from "@/lib/db";
import { MemoryList } from "@/components/os/MemoryList";
import { MemoryForm } from "@/components/os/MemoryForm";
import { EmptyNote } from "@/components/os/formBits";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Hành trình" };

/**
 * Cũng KHÔNG phải một lĩnh vực — là cách nhìn xuyên qua tất cả.
 *
 * Ngày bạn sang Nhật vừa thuộc Hành trình, vừa thuộc Công việc, vừa thuộc
 * Gia đình. Ghi một lần ở lĩnh vực, hiện ra ở cả hai chỗ. (OS-DESIGN §2)
 */
export default async function JourneyPage() {
  const memories = await db.memory.findMany({
    orderBy: { date: "desc" },
    include: {
      photos: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      area: { select: { name: true, slug: true } },
    },
  });

  // Cho form sửa đổi được lĩnh vực của ký ức. Lấy cả lĩnh vực đang ẩn: ký ức
  // cũ có thể đang thuộc một lĩnh vực đã tạm gác, và không được để việc mở form
  // sửa âm thầm gỡ nó ra khỏi lĩnh vực đó.
  const areas = await db.area.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  const birthYear = new Date(site.birthDate).getFullYear();

  // Gom theo năm để dòng thời gian dài vẫn đọc được
  const byYear = new Map<number, typeof memories>();
  for (const m of memories) {
    const y = m.date.getUTCFullYear();
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(m);
  }

  const publicCount = memories.filter((m) => m.visibility === "PUBLIC").length;

  return (
    <div className="max-w-[760px] space-y-10">
      <header className="border-b border-line pb-5">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">
          Hành trình của tôi
        </h1>
        <p className="mt-1.5 text-[15px] text-ink-2">
          {memories.length === 0
            ? "Mọi ký ức từ tất cả lĩnh vực, xếp theo thời gian."
            : `${memories.length} ký ức · ${publicCount} đang công khai`}
        </p>
      </header>

      <MemoryForm areaSlug={null} />

      {memories.length === 0 ? (
        <EmptyNote>
          Chưa có gì. Bắt đầu từ đâu cũng được — một chuyện hồi nhỏ ở{" "}
          {site.hometown}, ngày đầu sang Nhật, hay chuyện hôm qua.
        </EmptyNote>
      ) : (
        [...byYear.entries()]
          .sort((a, b) => b[0] - a[0])
          .map(([year, list]) => (
            <section key={year}>
              <div className="mb-5 flex items-baseline gap-3 border-b border-line-soft pb-2">
                <h2 className="text-[18px] font-semibold tabular-nums tracking-[-0.01em]">
                  {year}
                </h2>
                <span className="text-[13px] text-ink-3">
                  {year - birthYear} tuổi · {list.length} ký ức
                </span>
              </div>
              <MemoryList memories={list} showArea areas={areas} />
            </section>
          ))
      )}
    </div>
  );
}
