import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { db } from "@/lib/db";
import { deleteDailyLog } from "@/lib/os/dayActions";
import { DailyLogForm } from "@/components/os/DailyLogForm";
import { PomoRow } from "@/components/os/PomoRow";
import { ConfirmButton } from "@/components/os/formBits";
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

  const [log, sessions, studyGoal] = await Promise.all([
    db.dailyLog.findUnique({ where: { date: dayUTC(iso) } }),
    db.pomoSession.findMany({
      where: { date: dayUTC(iso) },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { id: true, order: true, skillId: true },
    }),
    db.studyGoal.findFirst({
      where: { active: true },
      orderBy: { targetDate: "asc" },
      include: { skills: { orderBy: { order: "asc" } } },
    }),
  ]);

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

      {/* Cùng hàng ô với /os, nhưng cho ĐÚNG ngày đang mở — đây là chỗ chữa
          ngày đã qua mà quên tick. Cố ý không có ô nhập số hiệp trong form
          bên dưới: hai đường ghi vào một con số là hai con số trôi khỏi nhau
          (xem chú thích `jpPomo` trong schema). */}
      <section>
        <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
          Pomodoro tiếng Nhật
        </h2>
        <PomoRow
          iso={iso}
          sessions={sessions}
          skills={studyGoal?.skills ?? []}
          targetPomo={studyGoal?.dailyPomo ?? 0}
          extraMin={log?.jpMin ?? 0}
        />
      </section>

      <DailyLogForm iso={iso} log={log} />

      <div className="space-y-4 border-t border-line pt-6">
        <p className="text-[13px] leading-relaxed text-ink-3">
          Ô tick lưu ngay khi bấm, ô chữ lưu khi bạn rời khỏi ô — không có nút
          Lưu. Nếu ngày nào bạn thấy điền cái này mất quá ba phút thì đó là lỗi
          thiết kế: bớt trường đi, đừng cố chịu đựng.
        </p>

        {/* Chính vì lưu-ngay mà cần nút này: ghi nhầm sang ngày khác thì bản
            ghi đã nằm trong database rồi, xóa trắng từng ô không gỡ được nó
            khỏi thống kê. Chỉ hiện khi ngày đó thật sự có bản ghi. */}
        {log && (
          <form action={deleteDailyLog.bind(null, iso)}>
            <ConfirmButton
              label={`Xóa nhật ký ngày ${fmtDateVN(iso)}`}
              confirm={`Xóa nhật ký ngày ${fmtDateVN(iso)}? Mọi ô đã điền và ba việc nền tảng của ngày này mất hết, và ngày đó thôi được tính trong chuỗi ngày. Ký ức cùng ngày KHÔNG mất theo. Không hoàn tác được.`}
              className="text-[12px] text-ink-3 hover:text-down"
            >
              Xóa nhật ký ngày này
            </ConfirmButton>
          </form>
        )}
      </div>
    </div>
  );
}
