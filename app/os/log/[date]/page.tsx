import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { db } from "@/lib/db";
import { DailyLogForm } from "@/components/os/DailyLogForm";
import {
  addDaysISO,
  dayUTC,
  fmtDateVN,
  todayISO,
  weekdayVN,
} from "@/lib/os/day";

export const metadata: Metadata = { title: "Nhật ký" };

export default async function LogDayPage({
  params,
}: PageProps<"/os/log/[date]">) {
  const { date: iso } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) notFound();

  const isToday = iso === todayISO();
  const log = await db.dailyLog.findUnique({ where: { date: dayUTC(iso) } });

  return (
    <div className="max-w-[560px] space-y-10">
      <header className="border-b border-line pb-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/os/log/${addDaysISO(iso, -1)}`}
            aria-label="Ngày trước"
            className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-ink-2 transition-colors hover:bg-surface hover:text-ink"
          >
            <ChevronLeft size={18} strokeWidth={1.75} />
          </Link>

          <div className="text-center">
            <h1 className="text-[18px] font-semibold tracking-[-0.01em]">
              {weekdayVN(iso)}, {fmtDateVN(iso)}
            </h1>
            <Link
              href="/os/log"
              className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-ink-3 transition-colors hover:text-ink"
            >
              <List size={12} strokeWidth={2} />
              tất cả nhật ký
            </Link>
          </div>

          {isToday ? (
            <span className="size-11 shrink-0" aria-hidden />
          ) : (
            <Link
              href={`/os/log/${addDaysISO(iso, 1)}`}
              aria-label="Ngày sau"
              className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-ink-2 transition-colors hover:bg-surface hover:text-ink"
            >
              <ChevronRight size={18} strokeWidth={1.75} />
            </Link>
          )}
        </div>
      </header>

      <DailyLogForm iso={iso} log={log} />

      <p className="border-t border-line pt-6 text-[13px] leading-relaxed text-ink-3">
        Ô tick lưu ngay khi bấm, ô chữ lưu khi bạn rời khỏi ô — không có nút
        Lưu. Nếu ngày nào bạn thấy điền cái này mất quá ba phút thì đó là lỗi
        thiết kế: bớt trường đi, đừng cố chịu đựng.
      </p>
    </div>
  );
}
