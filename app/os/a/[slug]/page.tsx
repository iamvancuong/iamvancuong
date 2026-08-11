import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { addDaysISO, dayUTC, todayISO } from "@/lib/os/day";
import { AreaTabs, toAreaTab } from "@/components/os/AreaTabs";
import { GoalsTab } from "@/components/os/GoalsTab";
import { PrinciplesTab } from "@/components/os/PrinciplesTab";
import { ItemsTab } from "@/components/os/ItemsTab";
import { MetricsTab } from "@/components/os/MetricsTab";
import { ProgressPhotos } from "@/components/os/ProgressPhotos";
import { MemoryList } from "@/components/os/MemoryList";
import { MemoryForm } from "@/components/os/MemoryForm";
import { EmptyNote } from "@/components/os/formBits";

/**
 * MỘT file cho CẢ BẢY lĩnh vực.
 *
 * Đây là điểm mấu chốt của thiết kế: thêm lĩnh vực thứ tám chỉ là thêm một
 * dòng trong bảng Area, file này không đổi một chữ nào. (OS-DESIGN §1)
 */

/**
 * KHÔNG dùng generateStaticParams ở đây.
 *
 * Layout của /os đặt force-dynamic (dashboard phụ thuộc "hôm nay"), nên dựng
 * sẵn không có tác dụng gì. Tệ hơn: nó bắt `next build` phải kết nối được
 * MySQL, mà lúc build trên hosting thì thường chưa có database — build sẽ đổ
 * ngay ở bước deploy đầu tiên.
 */
export async function generateMetadata({
  params,
}: PageProps<"/os/a/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const area = await db.area.findUnique({ where: { slug } });
  return { title: area?.name ?? "Lĩnh vực" };
}

export default async function AreaPage({
  params,
  searchParams,
}: PageProps<"/os/a/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const tab = toAreaTab(sp.tab);

  /**
   * Nhật ký một năm rưỡi — đủ cho mọi đợt học đang chạy. Chỉ dùng khi lĩnh vực
   * có bấm giờ; lĩnh vực khác thì mảng rỗng, không tốn truy vấn nào thêm vì
   * điều kiện nằm ngay trong `where`.
   */
  const jpLogs = await db.dailyLog.findMany({
    where: { date: { gte: dayUTC(addDaysISO(todayISO(), -550)) } },
    select: { date: true, jpPomo: true, jpMin: true },
    orderBy: { date: "asc" },
  });

  const area = await db.area.findUnique({
    where: { slug },
    include: {
      goals: { orderBy: [{ status: "asc" }, { order: "asc" }] },
      principles: { orderBy: [{ kind: "asc" }, { order: "asc" }] },
      items: { orderBy: { createdAt: "desc" } },
      // Lần đo xếp CŨ → MỚI để vẽ đường biểu diễn theo đúng chiều thời gian
      metrics: {
        where: { active: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: { entries: { orderBy: { date: "asc" } } },
      },
      memories: {
        orderBy: { date: "desc" },
        take: 20,
        include: { photos: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] } },
      },
      // Ảnh tiến trình: gắn thẳng vào lĩnh vực, KHÔNG thuộc ký ức nào — nếu
      // không lọc `memoryId: null` thì ảnh của mọi ký ức sẽ lọt vào tab này.
      photos: {
        where: { memoryId: null },
        orderBy: [{ takenAt: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!area) notFound();

  // Cho form sửa ký ức đổi được lĩnh vực. Lấy cả lĩnh vực đang ẩn — xem chú
  // thích cùng chỗ ở /os/journey.
  const allAreas = await db.area.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  const counts = {
    goals: area.goals.filter((g) => g.status !== "DROPPED").length,
    principles: area.principles.length,
    items: area.items.filter((i) => i.status !== "DROPPED").length,
    metrics: area.metrics.length,
    memories: area.memories.length,
    photos: area.photos.length,
  };

  /**
   * «Số đo» là tab DUY NHẤT được quét bằng mắt thay vì đọc thành dòng, nên nó
   * dùng trọn bề ngang cột nội dung. Ba tab kia là chữ, mà 760px đã là ngưỡng
   * trên của độ dài dòng dễ đọc — nới ra là hại chứ không lợi.
   *
   * Giới hạn đặt ở phần NỘI DUNG chứ không ở cả trang, để tiêu đề và thanh tab
   * giữ nguyên bề ngang khi đổi tab — nếu không, mỗi lần bấm là thanh tab lại
   * co giãn một nhịp.
   */
  const contentWidth = tab === "metrics" ? "" : "max-w-[760px]";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">
          {area.name}
        </h1>
        {area.tagline && (
          <p className="mt-1.5 text-[15px] text-ink-2">{area.tagline}</p>
        )}
      </header>

      <AreaTabs slug={slug} current={tab} counts={counts} />

      <div className={contentWidth}>
        {tab === "goals" && (
          <GoalsTab
            slug={slug}
            goals={area.goals}
            tracksStudy={area.tracksStudy}
            logs={jpLogs}
          />
        )}
        {tab === "principles" && (
          <PrinciplesTab slug={slug} principles={area.principles} />
        )}
        {tab === "items" && <ItemsTab slug={slug} items={area.items} />}
        {tab === "metrics" && <MetricsTab slug={slug} metrics={area.metrics} />}
        {tab === "photos" && (
          <ProgressPhotos slug={slug} photos={area.photos} />
        )}
        {tab === "memories" && (
          <div className="space-y-8">
            {area.memories.length === 0 ? (
              <EmptyNote>
                Chưa có ký ức nào. Ngày để tự do nên ghi được cả chuyện hồi nhỏ,
                không chỉ từ hôm nay trở đi.
              </EmptyNote>
            ) : (
              <MemoryList
              memories={area.memories}
              areaSlug={slug}
              areas={allAreas}
            />
            )}
            <MemoryForm areaSlug={slug} />
          </div>
        )}
      </div>
    </div>
  );
}
