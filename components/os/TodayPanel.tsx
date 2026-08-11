import Link from "next/link";
import type { DailyLog } from "@prisma/client";
import { buildingTooMuch, weekStats } from "@/lib/os/stats";
import { fmtH } from "@/lib/os/day";

/**
 * Cuối trang Hôm nay: cảnh báo tuần + đường sang nhật ký.
 *
 * ⚠️ Ba việc nền tảng ĐÃ BỊ GỠ khỏi đây (11/08/2026). Chúng vẫn sống ở
 * `/os/log/[ngày]` và vẫn là thứ tính chuỗi + tô lịch nhiệt — chỉ là không
 * còn nằm trên Dashboard nữa. Lý do: ba ô đó chỉ tick được vào **cuối ngày**
 * (ngủ trước 12h, ăn đủ 3 bữa), mà Dashboard là màn hình mở lúc **sáng dậy**.
 * Đặt việc-cuối-ngày lên màn hình-đầu-ngày thì sáng nào mở lên cũng thấy ba ô
 * trống, và ba ô trống mỗi sáng dạy đúng một điều: đừng nhìn màn hình này.
 */
export function TodayPanel({ iso, logs }: { iso: string; logs: DailyLog[] }) {
  const week = weekStats(logs);

  return (
    <section>
      {buildingTooMuch(week) && (
        <p className="rounded-[var(--radius-md)] border border-line bg-surface px-4 py-3 text-[14px] leading-relaxed">
          <strong className="font-medium">
            Bạn đang xây hệ thống thay vì dùng hệ thống.
          </strong>{" "}
          <span className="text-ink-2">
            Tuần này xây web {fmtH(week.webMin)} · Tiếng Nhật {fmtH(week.jpMin)}.
            Xây công cụ để quản lý việc học không phải là học.
          </span>
        </p>
      )}

      <Link
        href={`/os/log/${iso}`}
        className="mt-3 inline-block text-[14px] text-accent underline decoration-accent/35 underline-offset-[3px] hover:decoration-accent"
      >
        Ghi nhật ký hôm nay → <span className="text-ink-3">ba việc nền tảng, số đo, ba câu</span>
      </Link>
    </section>
  );
}
