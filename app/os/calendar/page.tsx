import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GoalStatus, Horizon } from "@prisma/client";
import { db } from "@/lib/db";
import { addDaysISO, dayUTC, isoUTC, todayISO } from "@/lib/os/day";
import {
  mondayISO,
  monthStartISO,
  nextPeriodStartISO,
  periodEndISO,
  periodLabel,
  prevPeriodStartISO,
} from "@/lib/os/period";
import { dayLevel } from "@/lib/os/stats";
import { jpSum, jpTotal } from "@/lib/os/japanese";
import { POMO_MIN } from "@/lib/os/constants";
import { fmtH } from "@/lib/os/day";
import { EmptyNote, MicroLabel } from "@/components/os/formBits";
import { OutcomeBadge } from "@/components/os/GoalReview";

export const metadata: Metadata = { title: "Lịch" };

/**
 * Lịch tháng, nhưng đọc theo TUẦN.
 *
 * Một cam kết thuộc về cả tuần chứ không thuộc về một ngày, nên lưới ngày
 * thuần không diễn tả được nó. Ở đây mỗi hàng là một tuần: bên trái là bảy ô
 * ngày tô theo số việc nền tảng đã làm, bên phải là cam kết của chính tuần đó.
 *
 * Nhờ vậy hai thứ nằm cạnh nhau và so được ngay: tuần này mình đã hứa gì, và
 * tuần này mình thật sự đã sống thế nào.
 */

const DOW = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const FILL: Record<0 | 1 | 2 | 3, string> = {
  0: "bg-surface-2",
  1: "bg-ink/20",
  2: "bg-ink/55",
  3: "bg-ink",
};

/**
 * Mốc để vẽ vạch giờ học khi CHƯA đặt đợt nào — 5 giờ là vạch đầy.
 * Chỉ để các vạch so được với nhau; không có ý nghĩa như một cái đích.
 */
const NO_GOAL_FULL_MIN = 300;

export default async function CalendarPage({
  searchParams,
}: PageProps<"/os/calendar">) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.m) ? sp.m[0] : sp.m;

  const today = todayISO();
  // ?m=YYYY-MM — tháng đang xem. Sai định dạng thì về tháng này.
  const monthStart =
    raw && /^\d{4}-\d{2}$/.test(raw) ? `${raw}-01` : monthStartISO(today);

  const monthEnd = periodEndISO(Horizon.MONTH, monthStart);
  const gridStart = mondayISO(monthStart); // lùi về thứ Hai để hàng đầu đủ 7 ô
  const gridEnd = addDaysISO(mondayISO(monthEnd), 6);

  const [logs, goals, studyGoal] = await Promise.all([
    db.dailyLog.findMany({
      where: { date: { gte: dayUTC(gridStart), lte: dayUTC(gridEnd) } },
    }),
    // Lấy cả cam kết tuần lẫn tháng chạm vào khoảng đang xem
    db.goal.findMany({
      where: {
        horizon: { in: [Horizon.WEEK, Horizon.MONTH] },
        periodStart: { gte: dayUTC(gridStart), lte: dayUTC(gridEnd) },
        status: { not: GoalStatus.DROPPED },
      },
      include: { area: { select: { name: true, slug: true } } },
      orderBy: [{ periodStart: "asc" }, { order: "asc" }],
    }),
    db.studyGoal.findFirst({ where: { active: true }, orderBy: { targetDate: "asc" } }),
  ]);

  const logByDay = new Map(logs.map((l) => [isoUTC(l.date), l]));

  /**
   * Giờ học chỉ ĐỌC ở đây, không nhập.
   *
   * Vạch dưới mỗi ô ngày là số hiệp so với nhịp đã cam kết. Cố ý không thêm ô
   * giờ hay sự kiện: STATE.md §8 ghi lịch hẹn giờ là thứ **cố ý không làm**,
   * Google Calendar là nguồn duy nhất. Ở đây chỉ trả lời "tháng này tôi học
   * đều tới đâu" — câu mà bảng ngày + cam kết tuần đã sẵn sàng trả lời.
   */
  const dailyTargetMin = studyGoal ? studyGoal.dailyPomo * POMO_MIN : 0;
  const inGoal = (iso: string) =>
    !!studyGoal &&
    isoUTC(studyGoal.startDate) <= iso &&
    iso <= isoUTC(studyGoal.targetDate);

  const monthJpMin = jpSum(
    logs,
    monthStart,
    periodEndISO(Horizon.MONTH, monthStart),
  );

  const weekGoals = new Map<string, typeof goals>();
  const monthGoals: typeof goals = [];
  for (const g of goals) {
    if (!g.periodStart) continue;
    if (g.horizon === Horizon.MONTH) {
      if (isoUTC(g.periodStart) === monthStart) monthGoals.push(g);
      continue;
    }
    const k = isoUTC(g.periodStart);
    if (!weekGoals.has(k)) weekGoals.set(k, []);
    weekGoals.get(k)!.push(g);
  }

  // Dựng danh sách tuần phủ hết tháng
  const weeks: string[] = [];
  for (let w = gridStart; w <= gridEnd; w = addDaysISO(w, 7)) weeks.push(w);

  const [y, m] = monthStart.split("-");
  const prevMonth = prevPeriodStartISO(Horizon.MONTH, monthStart).slice(0, 7);
  const nextMonth = nextPeriodStartISO(Horizon.MONTH, monthStart).slice(0, 7);

  return (
    <div className="max-w-[860px] space-y-8">
      <header className="border-b border-line pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[24px] font-semibold tracking-[-0.02em]">
            Tháng {Number(m)}, {y}
          </h1>
          <nav className="flex items-center gap-1">
            <MonthLink to={prevMonth} label="Tháng trước">
              <ChevronLeft size={16} strokeWidth={1.75} />
            </MonthLink>
            <Link
              href="/os/calendar"
              className="rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[13px] text-ink-2 transition-colors hover:bg-surface hover:text-ink"
            >
              Hôm nay
            </Link>
            <MonthLink to={nextMonth} label="Tháng sau">
              <ChevronRight size={16} strokeWidth={1.75} />
            </MonthLink>
          </nav>
        </div>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">
          Mỗi hàng là một tuần: ô ngày bên trái là mình đã sống thế nào, cam kết
          bên phải là mình đã hứa gì.
        </p>
        <p className="mt-1.5 text-[13px] tabular-nums text-ink-3">
          Tiếng Nhật tháng này:{" "}
          <strong className="font-medium text-ink-2">{fmtH(monthJpMin)}</strong>
          {studyGoal && ` · đang chạy đợt «${studyGoal.name}», nhịp ${studyGoal.dailyPomo} hiệp/ngày`}
        </p>
      </header>

      {monthGoals.length > 0 && (
        <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-4">
          <div className="mb-2">
            <MicroLabel>Cam kết cả tháng</MicroLabel>
          </div>
          <ul className="space-y-2">
            {monthGoals.map((g) => (
              <GoalLine key={g.id} goal={g} />
            ))}
          </ul>
        </section>
      )}

      <section className="overflow-hidden rounded-[var(--radius-lg)] border border-line">
        <div className="hidden border-b border-line bg-surface px-3 py-2 sm:flex">
          <div className="flex w-[240px] shrink-0 gap-1">
            {DOW.map((d) => (
              <span
                key={d}
                className="w-8 text-center text-[11px] text-ink-3"
              >
                {d}
              </span>
            ))}
          </div>
          <span className="pl-4 text-[11px] text-ink-3">Cam kết tuần</span>
        </div>

        <ul className="divide-y divide-line-soft">
          {weeks.map((w) => {
            const list = weekGoals.get(w) ?? [];
            const isThisWeek = w === mondayISO(today);

            return (
              <li
                key={w}
                className={`flex flex-col gap-3 px-3 py-3 sm:flex-row ${
                  isThisWeek ? "bg-surface" : ""
                }`}
              >
                <div className="w-[240px] shrink-0">
                  <div className="flex gap-1">
                    {Array.from({ length: 7 }, (_, i) => {
                      const iso = addDaysISO(w, i);
                      const inMonth = iso.slice(0, 7) === monthStart.slice(0, 7);
                      const log = logByDay.get(iso);
                      const level = dayLevel(log);
                      const jpMin = jpTotal(log);
                      const target = inGoal(iso) ? dailyTargetMin : 0;

                      return (
                        <div key={iso} className={inMonth ? "" : "opacity-30"}>
                          <Link
                            href={`/os/log/${iso}`}
                            title={`${iso} — ${level}/3 việc nền tảng · tiếng Nhật ${fmtH(jpMin)}${
                              target ? ` / đích ${fmtH(target)}` : ""
                            }`}
                            className={`flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-[11px] tabular-nums transition-opacity hover:opacity-70 ${
                              FILL[level]
                            } ${level >= 2 ? "text-bg" : "text-ink-2"} ${
                              iso === today
                                ? "ring-1 ring-ink ring-offset-1 ring-offset-bg"
                                : ""
                            }`}
                          >
                            {Number(iso.slice(8))}
                          </Link>

                          {/* Vạch giờ tiếng Nhật. Nền xám = đích ngày đó,
                              phần đậm = đã học. Đủ nhịp thì vạch đầy hẳn. */}
                          <div className="mt-0.5 h-[3px] w-8 overflow-hidden rounded-full bg-surface-2">
                            {jpMin > 0 && (
                              <div
                                className={`h-full rounded-full ${
                                  target && jpMin >= target ? "bg-ink" : "bg-ink/45"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.round(
                                      (jpMin / (target || NO_GOAL_FULL_MIN)) * 100,
                                    ),
                                  )}%`,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {isThisWeek && (
                    <div className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">
                      Tuần này
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 sm:pl-1">
                  {list.length === 0 ? (
                    <p className="text-[13px] text-ink-3">
                      Không có cam kết nào.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {list.map((g) => (
                        <GoalLine key={g.id} goal={g} />
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {goals.length === 0 && (
        <EmptyNote>
          Chưa có cam kết nào trong tháng này. Thêm ở trang từng lĩnh vực — chọn
          mốc <strong className="font-medium text-ink-2">Tuần</strong> rồi viết
          thứ cụ thể, đo được: <em>tuần này chi dưới 10.000¥</em> ·{" "}
          <em>tuần này không uống nước ngọt</em> ·{" "}
          <em>tuần này ngủ trước 12h ít nhất 5 đêm</em>.
        </EmptyNote>
      )}

      <p className="border-t border-line pt-6 text-[13px] leading-relaxed text-ink-3">
        Ô ngày càng đậm là hôm đó làm được càng nhiều việc nền tảng; vạch mảnh
        dưới ô là giờ tiếng Nhật so với nhịp đã cam kết. Đặt cạnh
        cam kết để thấy thứ khó thấy nhất:{" "}
        <strong className="font-medium text-ink-2">
          tuần mình hứa nhiều nhất có phải tuần mình sống tốt nhất không.
        </strong>
      </p>
    </div>
  );
}

function MonthLink({
  to,
  label,
  children,
}: {
  to: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/os/calendar?m=${to}`}
      aria-label={label}
      title={label}
      className="flex size-9 items-center justify-center rounded-[var(--radius-sm)] text-ink-2 transition-colors hover:bg-surface hover:text-ink"
    >
      {children}
    </Link>
  );
}

type GoalWithArea = {
  id: string;
  title: string;
  horizon: Horizon;
  periodStart: Date | null;
  outcome: import("@prisma/client").GoalOutcome | null;
  metric: string | null;
  current: string | null;
  target: string | null;
  area: { name: string; slug: string };
};

function GoalLine({ goal: g }: { goal: GoalWithArea }) {
  return (
    <li className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <Link
        href={`/os/a/${g.area.slug}`}
        className="text-[14px] leading-snug transition-colors hover:text-accent"
      >
        {g.title}
      </Link>
      <span className="text-[12px] text-ink-3">{g.area.name}</span>
      {g.metric && (
        <span className="text-[12px] tabular-nums text-ink-3">
          · {g.current || "—"}
          {g.target ? ` / ${g.target}` : ""}
        </span>
      )}
      {g.outcome ? (
        <OutcomeBadge outcome={g.outcome} />
      ) : (
        <span className="text-[12px] text-ink-3">· chưa chấm</span>
      )}
      {g.periodStart && g.horizon === Horizon.MONTH && (
        <span className="text-[12px] text-ink-3">
          · {periodLabel(g.horizon, isoUTC(g.periodStart))}
        </span>
      )}
    </li>
  );
}
