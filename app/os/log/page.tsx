import Link from "next/link";
import type { Metadata } from "next";
import { Bed, Check, Dumbbell, PenLine, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { jpTotal } from "@/lib/os/japanese";
import { PhotoGrid } from "@/components/PhotoGrid";
import { Streak } from "@/components/os/Streak";
import { EmptyNote } from "@/components/os/formBits";
import {
  addDaysISO,
  dayUTC,
  fmtH,
  isoUTC,
  todayISO,
  weekdayShortVN,
} from "@/lib/os/day";
import {
  dayLevel,
  keystoneStreak,
  longestStreak,
  periodStats,
} from "@/lib/os/stats";

export const metadata: Metadata = { title: "Nhật ký" };

/**
 * Danh sách nhật ký kiểu app Journal: mỗi ngày một thẻ, mới nhất lên trên,
 * gom theo tháng.
 *
 * Thẻ gộp cả **ký ức cùng ngày** — ảnh và chuyện xảy ra hôm đó nằm chung
 * với số liệu hôm đó. Đó mới là "một ngày", chứ không phải hai danh sách
 * rời nhau.
 */
export default async function LogListPage() {
  const today = todayISO();
  const since = dayUTC(addDaysISO(today, -365));

  const [logs, memories, streakLogs, tasks] = await Promise.all([
    db.dailyLog.findMany({ where: { date: { gte: since } }, orderBy: { date: "desc" } }),
    db.memory.findMany({
      where: { date: { gte: since } },
      orderBy: { date: "desc" },
      include: {
        photos: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      },
    }),
    db.dailyLog.findMany({
      where: { date: { gte: dayUTC(addDaysISO(today, -400)) } },
      orderBy: { date: "desc" },
    }),
    // Đếm việc mỗi ngày để danh sách nói được "hôm đó định làm gì, xong mấy".
    db.dayTask.groupBy({
      by: ["date", "done"],
      where: { date: { gte: since } },
      _count: { _all: true },
    }),
  ]);

  // Gộp nhật ký và ký ức theo ngày
  const days = new Map<
    string,
    {
      log?: (typeof logs)[number];
      memories: typeof memories;
      tasks: { done: number; total: number };
    }
  >();

  const blank = () => ({ memories: [] as typeof memories, tasks: { done: 0, total: 0 } });

  for (const l of logs) {
    days.set(isoUTC(l.date), { ...blank(), log: l });
  }
  for (const m of memories) {
    const iso = isoUTC(m.date);
    if (!days.has(iso)) days.set(iso, blank());
    days.get(iso)!.memories.push(m);
  }
  /**
   * Ngày CHỈ có việc — không nhật ký, không ký ức — vẫn phải hiện ra. Trước đây
   * danh sách dựng từ hai nguồn kia nên một ngày lên kế hoạch đầy đủ mà quên
   * ghi nhật ký thì biến mất khỏi lịch sử.
   */
  for (const t of tasks) {
    const iso = isoUTC(t.date);
    if (!days.has(iso)) days.set(iso, blank());
    const d = days.get(iso)!.tasks;
    d.total += t._count._all;
    if (t.done) d.done += t._count._all;
  }

  const sorted = [...days.entries()].sort((a, b) => b[0].localeCompare(a[0]));

  // Gom theo tháng để cuộn dài vẫn định vị được
  const months = new Map<string, typeof sorted>();
  for (const entry of sorted) {
    const key = entry[0].slice(0, 7);
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(entry);
  }

  const hasToday = days.has(today);

  const streakStats = {
    current: keystoneStreak(streakLogs),
    best: longestStreak(streakLogs),
    month: periodStats(streakLogs, "month"),
    year: periodStats(streakLogs, "year"),
  };

  return (
    <div className="max-w-[680px] space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Nhật ký</h1>
          <p className="mt-1 text-[15px] text-ink-2">
            {sorted.length === 0
              ? "Chưa có ngày nào."
              : `${sorted.length} ngày đã ghi`}
          </p>
        </div>

        <Link
          href={`/os/log/${today}`}
          className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-ink px-4 py-2 text-[14px] font-medium text-bg"
        >
          <PenLine size={15} strokeWidth={2} />
          {hasToday ? "Sửa hôm nay" : "Ghi hôm nay"}
        </Link>
      </header>

      <Streak logs={streakLogs} stats={streakStats} />

      {sorted.length === 0 ? (
        <EmptyNote>
          Chưa ghi ngày nào. Ba dòng mỗi tối là đủ — đừng đợi tới lúc có
          chuyện gì to tát mới ghi.
        </EmptyNote>
      ) : (
        [...months.entries()].map(([month, entries]) => {
          const [y, m] = month.split("-");
          return (
            <section key={month}>
              <h2 className="sticky top-0 z-[1] -mx-1 bg-bg/95 px-1 py-2 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3 backdrop-blur">
                Tháng {m}, {y}
              </h2>

              <ul className="space-y-3">
                {entries.map(([iso, { log, memories: mems, tasks: tk }]) => (
                  <li key={iso}>
                    <DayCard
                      iso={iso}
                      log={log}
                      memories={mems}
                      tasks={tk}
                      isToday={iso === today}
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}

type DayLog = Awaited<ReturnType<typeof db.dailyLog.findMany>>[number];
type DayMemory = Awaited<
  ReturnType<
    typeof db.memory.findMany<{ include: { photos: true } }>
  >
>[number];

function DayCard({
  iso,
  log,
  memories,
  tasks,
  isToday,
}: {
  tasks: { done: number; total: number };
  iso: string;
  log?: DayLog;
  memories: DayMemory[];
  isToday: boolean;
}) {
  const day = dayUTC(iso).getUTCDate();
  const level = dayLevel(log);
  const photos = memories.flatMap((m) => m.photos).slice(0, 4);

  const lines = [log?.journalWhat, log?.journalLearn, log?.journalChange].filter(
    Boolean,
  ) as string[];

  return (
    <Link
      href={`/os/log/${iso}`}
      className="flex gap-4 rounded-[var(--radius-lg)] border border-line p-4 transition-colors hover:bg-surface"
    >
      {/* Cột ngày — như tem ngày trên app Journal */}
      <div className="w-11 shrink-0 text-center">
        <div className="text-[22px] font-semibold leading-none tabular-nums tracking-[-0.02em]">
          {day}
        </div>
        <div className="mt-1 text-[11px] text-ink-3">{weekdayShortVN(iso)}</div>
        <div className="mt-2 flex justify-center gap-[2px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`size-1.5 rounded-full ${
                i < level ? "bg-ink" : "bg-line"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        {isToday && (
          <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">
            Hôm nay
          </div>
        )}

        {memories.length > 0 && (
          <div className="mb-1.5 flex items-start gap-1.5">
            <Sparkles size={13} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink-3" />
            <span className="text-[15px] font-medium leading-snug">
              {memories.map((m) => m.title).join(" · ")}
            </span>
          </div>
        )}

        {lines.length > 0 ? (
          <p className="line-clamp-3 whitespace-pre-line text-[14px] leading-relaxed text-ink-2">
            {lines.join(" — ")}
          </p>
        ) : (
          memories.length === 0 && (
            <p className="text-[14px] text-ink-3">Chỉ có số liệu, chưa viết gì.</p>
          )
        )}

        <PhotoGrid photos={photos} variant="row" />

        {(log || tasks.total > 0) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-3">
            {/* Việc trong ngày — trước đây danh sách này hoàn toàn không nhắc
                tới chúng, nên qua ngày là không nhìn lại được nữa. */}
            {tasks.total > 0 && (
              <span className="tabular-nums">
                ✓ {tasks.done}/{tasks.total} việc
              </span>
            )}
            {log?.sleepAt && (
              <span className="flex items-center gap-1">
                <Bed size={12} strokeWidth={1.75} />
                {log.sleepAt}
              </span>
            )}
            {/* ⚠️ jpTotal, KHÔNG phải log.jpMin: từ khi có pomodoro thì `jpMin`
                chỉ còn là phút LẺ. Đọc thẳng nó làm một ngày học 7 hiệp mà không
                có phút lẻ nào hiện ra thành "không giờ nào". */}
            {jpTotal(log) > 0 && <span>日 {fmtH(jpTotal(log))}</span>}
            {(log?.itMin ?? 0) > 0 && <span>IT {fmtH(log!.itMin)}</span>}
            {log?.workout && (
              <span className="flex items-center gap-1">
                <Dumbbell size={12} strokeWidth={1.75} />
                tập
              </span>
            )}
            {log?.spend != null && <span>¥{log.spend.toLocaleString("vi-VN")}</span>}
            {log?.publishable && (
              <span className="flex items-center gap-1 text-ink-2">
                <Check size={12} strokeWidth={2.5} />
                đáng viết
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
