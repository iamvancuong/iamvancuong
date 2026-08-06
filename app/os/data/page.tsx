import type { Metadata } from "next";
import { Download } from "lucide-react";
import { db } from "@/lib/db";
import { uploadRoot } from "@/lib/os/upload";
import {
  AreasSection,
  type AreaWithCounts,
} from "@/components/os/AreasSection";

export const metadata: Metadata = { title: "Dữ liệu" };

export default async function DataPage() {
  const [areas, goals, principles, items, memories, photos, logs, focus, posts] =
    await Promise.all([
      db.area.count(),
      db.goal.count(),
      db.principle.count(),
      db.item.count(),
      db.memory.count(),
      db.photo.count(),
      db.dailyLog.count(),
      db.focusItem.count(),
      db.post.count(),
    ]);

  /**
   * Đếm bằng `_count` trong một lượt thay vì bảy truy vấn mỗi lĩnh vực: câu
   * hỏi lại trước khi xóa phải nói đúng con số, mà bảy lĩnh vực × bảy quan hệ
   * là bốn mươi chín lượt gọi cho một trang gần như không ai mở.
   */
  const areaRows = await db.area.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      _count: {
        select: {
          goals: true,
          principles: true,
          items: true,
          metrics: true,
          memories: true,
          photos: true,
          focusItems: true,
        },
      },
    },
  });

  const areasWithCounts: AreaWithCounts[] = areaRows.map(({ _count, ...a }) => ({
    ...a,
    counts: {
      cascade: {
        goals: _count.goals,
        principles: _count.principles,
        items: _count.items,
        metrics: _count.metrics,
      },
      orphan: {
        memories: _count.memories,
        photos: _count.photos,
        focusItems: _count.focusItems,
      },
    },
  }));

  const stats = [
    { label: "Lĩnh vực", value: areas },
    { label: "Mục tiêu", value: goals },
    { label: "Nguyên tắc", value: principles },
    { label: "Đồ dùng", value: items },
    { label: "Ký ức", value: memories },
    { label: "Ảnh", value: photos },
    { label: "Ngày nhật ký", value: logs },
    { label: "Việc trong Focus", value: focus },
    { label: "Bài viết", value: posts },
  ];

  return (
    <div className="max-w-[620px] space-y-10">
      <header className="border-b border-line pb-5">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Dữ liệu</h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">
          Toàn bộ Life OS nằm trong MySQL. Không còn phụ thuộc trình duyệt —
          xóa cache không mất gì nữa.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
          Hiện có
        </h2>
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line">
          {stats.map((s) => (
            <div key={s.label} className="bg-bg p-4">
              <div className="text-[12px] text-ink-3">{s.label}</div>
              <div className="mt-1.5 text-[18px] font-semibold tabular-nums leading-none">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <AreasSection areas={areasWithCounts} />

      <section>
        <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
          Sao lưu
        </h2>
        <a
          href="/api/backup"
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink px-4 py-2.5 text-[14px] font-medium text-bg"
        >
          <Download size={15} strokeWidth={2} />
          Tải JSON toàn bộ
        </a>

        <div className="mt-5 space-y-3 text-[13px] leading-relaxed text-ink-3">
          <p>
            <strong className="font-medium text-ink-2">Ảnh không nằm trong file JSON.</strong>{" "}
            File thật ở <code className="text-ink-2">{uploadRoot()}</code> — sao lưu
            bằng cách copy cả thư mục đó sang OneDrive.
          </p>
          <p>
            Muốn sao lưu cả database ở mức thấp hơn thì chạy:
            <br />
            <code className="mt-1 inline-block text-ink-2">
              docker exec vancuong_mysql mysqldump -ucuong -pdevpass iamvancuong &gt; backup.sql
            </code>
          </p>
          <p>
            Khi chuyển sang hosting thật, dữ liệu đi theo bằng file
            <code className="text-ink-2"> .sql</code> đó — không phải nhập tay lại gì cả.
          </p>
        </div>
      </section>
    </div>
  );
}
