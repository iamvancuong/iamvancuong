import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, List } from "lucide-react";
import { db } from "@/lib/db";
import { deleteDailyLog, toggleDayTask } from "@/lib/os/dayActions";
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

  const [log, sessions, studyGoal, tasks] = await Promise.all([
    db.dailyLog.findUnique({ where: { date: dayUTC(iso) } }),
    db.pomoSession.findMany({
      where: { date: dayUTC(iso) },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { id: true, order: true, goalId: true },
    }),
    db.goal.findFirst({
      where: {
        parentId: null,
        targetHours: { not: null },
        area: { tracksStudy: true },
      },
      orderBy: { studyEnd: "asc" },
      include: { children: { orderBy: { order: "asc" } } },
    }),
    // Việc đã đặt ra cho ngày này. Trước đây KHÔNG trang nào hiện chúng sau khi
    // ngày trôi qua — dữ liệu nằm nguyên trong database mà không nhìn lại được.
    db.dayTask.findMany({
      where: { date: dayUTC(iso) },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  return (
    <div className="max-w-[560px] space-y-10">
      <header className="border-b border-line pb-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/os/log/${addDaysISO(iso, -1)}`}
            aria-label="Ngày trước"
            className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
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
              className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <ChevronRight size={18} strokeWidth={1.75} />
            </Link>
          )}
        </div>
      </header>

      {tasks.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-baseline justify-between text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
            Việc của ngày này
            <span className="tabular-nums normal-case tracking-normal">
              {tasks.filter((t) => t.done).length}/{tasks.length} xong
            </span>
          </h2>
          {/* Tick được luôn, không chỉ để đọc: ngày hôm qua quên tick một việc
              đã làm thì đây là chỗ duy nhất chữa lại. */}
          <ul className="rounded-[var(--radius-lg)] border border-line p-2">
            {tasks.map((t) => (
              <li key={t.id}>
                <form action={toggleDayTask.bind(null, t.id)}>
                  <button
                    type="submit"
                    aria-pressed={t.done}
                    className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2 py-2.5 text-left transition-colors hover:bg-surface-2"
                  >
                    <span
                      /* Viền `ink-3` chứ không phải `line` — xem chú thích cùng
                         loại ở TodayPanel.tsx. */
                      className={`flex size-[22px] shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-colors ${
                        t.done ? "border-ink bg-ink text-bg" : "border-ink-3 bg-bg"
                      }`}
                    >
                      {t.done && <Check size={14} strokeWidth={3} />}
                    </span>
                    <span
                      className={`min-w-0 text-[15px] leading-snug ${
                        t.done ? "text-ink-3 line-through" : "text-ink"
                      }`}
                    >
                      {t.title}
                    </span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

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
          subGoals={studyGoal?.children ?? []}
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
