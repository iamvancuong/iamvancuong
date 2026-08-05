import Link from "next/link";
import {
  FocusStatus,
  GoalStatus,
  Horizon,
  PrincipleKind,
} from "@prisma/client";
import { db } from "@/lib/db";
import { ageNow } from "@/lib/os/age";
import { addDaysISO, dayUTC, isoUTC, todayISO } from "@/lib/os/day";
import { periodCountdown, periodLabel, periodState } from "@/lib/os/period";
import { Streak } from "@/components/os/Streak";
import { MAX_NOW } from "@/lib/os/constants";
import { horizonText } from "@/components/os/GoalsTab";
import { OutcomeBadge, OutcomeButtons } from "@/components/os/GoalReview";
import { EmptyNote } from "@/components/os/formBits";
import { TodayPanel } from "@/components/os/TodayPanel";

/**
 * Dashboard trả lời đúng ba câu:
 *   1. Tôi đang tập trung vào gì?
 *   2. Hôm nay tôi đã làm gì?
 *   3. Tôi có đang đi đúng hướng không?
 */
export default async function DashboardPage() {
  const iso = todayISO();

  const [areas, nearGoals, principles, logs, nowItems, periodGoals] =
    await Promise.all([
      db.area.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
        select: {
          slug: true,
          name: true,
          tagline: true,
          _count: { select: { goals: true, principles: true, items: true } },
        },
      }),
      // Mốc dài hạn — cam kết tuần/tháng có mục riêng bên dưới, không trộn vào
      db.goal.findMany({
        where: {
          status: { in: [GoalStatus.NOT_STARTED, GoalStatus.DOING] },
          horizon: { notIn: [Horizon.WEEK, Horizon.MONTH] },
        },
        include: { area: { select: { name: true, slug: true } } },
        orderBy: [{ horizon: "asc" }, { horizonAge: "asc" }],
        take: 3,
      }),
      db.principle.findMany({
        where: { active: true },
        include: { area: { select: { name: true, slug: true } } },
      }),
      // Đủ một năm để lịch nhiệt và thống kê tháng/năm có dữ liệu
      db.dailyLog.findMany({
        where: { date: { gte: dayUTC(addDaysISO(iso, -400)) } },
        orderBy: { date: "desc" },
      }),
      db.focusItem.findMany({
        where: { status: FocusStatus.NOW },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        take: MAX_NOW,
        include: { area: { select: { slug: true, name: true } } },
      }),
      // Cam kết của tuần và tháng đang chạy, cộng kỳ đã qua mà chưa chấm
      db.goal.findMany({
        where: {
          horizon: { in: [Horizon.WEEK, Horizon.MONTH] },
          status: { not: GoalStatus.DROPPED },
          periodStart: { gte: dayUTC(addDaysISO(iso, -40)) },
        },
        include: { area: { select: { name: true, slug: true } } },
        orderBy: [{ periodStart: "desc" }, { order: "asc" }],
      }),
    ]);

  const age = ageNow();
  const todayLog = logs.find((l) => isoUTC(l.date) === iso) ?? null;

  // Lĩnh vực đang có việc ở NOW. Chưa đặt việc nào thì hiện cả danh sách —
  // lúc đó nó là lời mời bắt đầu, không phải 28 ô trống bắt điền cho đủ.
  const nowSlugs = new Set(
    nowItems.map((f) => f.area?.slug).filter((s): s is string => !!s),
  );
  const focusedAreas = nowSlugs.size
    ? areas.filter((a) => nowSlugs.has(a.slug))
    : areas;

  // Cam kết: đang trong kỳ, và kỳ đã qua mà chưa chấm.
  // Kỳ đã chấm rồi thì thôi — Dashboard không phải chỗ lưu trữ.
  const withPeriod = periodGoals.filter((g) => g.periodStart);
  const livePeriods = withPeriod.filter(
    (g) => periodState(g.horizon, isoUTC(g.periodStart!), iso) === "current",
  );
  const toReview = withPeriod.filter(
    (g) =>
      periodState(g.horizon, isoUTC(g.periodStart!), iso) === "past" &&
      !g.outcome,
  );

  /**
   * Một nguyên tắc mỗi ngày. Chọn theo NGÀY chứ không ngẫu nhiên thật —
   * mở lại trang trong cùng một ngày vẫn ra cùng một câu, nên nó có cơ hội
   * đọng lại thay vì lướt qua.
   */
  const today = new Date();
  const dayIndex =
    today.getFullYear() * 372 + today.getMonth() * 31 + today.getDate();
  const daily = principles.length
    ? principles[dayIndex % principles.length]
    : null;

  return (
    <div className="max-w-[880px] space-y-12">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-5">
        <h1 className="text-[20px] font-semibold tracking-[-0.01em]">
          Hôm nay
        </h1>
        <span className="text-[13px] text-ink-3">
          {age.years} tuổi {age.months} tháng
        </span>
      </header>

      {nowItems.length > 0 && (
        <section>
          <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
            Đang tập trung
          </h2>
          <ol className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line md:grid-cols-3">
            {nowItems.map((f, i) => (
              <li key={f.id} className="bg-bg p-4">
                <div className="text-[12px] text-ink-3">
                  {String(i + 1).padStart(2, "0")}
                  {f.area && ` · ${f.area.name}`}
                </div>
                <div className="mt-1 text-[15px] font-medium leading-snug">
                  {f.title}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Kỳ đã hết mà chưa chấm — để trên cùng vì đây là việc có hạn.
          Để lâu thì không còn nhớ tuần đó xảy ra chuyện gì nữa. */}
      {toReview.length > 0 && (
        <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
            Kỳ đã qua — chưa chấm
          </h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">
            Chấm nhanh ở đây, hoặc mở lĩnh vực để viết lại vì sao.
          </p>
          <ul className="mt-4 space-y-4">
            {toReview.map((g) => (
              <li key={g.id}>
                <div className="text-[15px] leading-snug">{g.title}</div>
                <div className="mt-0.5 text-[12px] text-ink-3">
                  {g.area.name} ·{" "}
                  {periodLabel(g.horizon, isoUTC(g.periodStart!))} ·{" "}
                  {periodCountdown(g.horizon, isoUTC(g.periodStart!), iso)}
                </div>
                <div className="mt-2">
                  <OutcomeButtons goal={g} slug={g.area.slug} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {livePeriods.length > 0 && (
        <section>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
              Cam kết kỳ này
            </h2>
            <Link
              href="/os/calendar"
              className="text-[12px] text-ink-3 transition-colors hover:text-ink"
            >
              Xem lịch →
            </Link>
          </div>
          <ul className="divide-y divide-line-soft border-y border-line-soft">
            {livePeriods.map((g) => (
              <li key={g.id} className="py-3">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[15px] leading-snug">{g.title}</span>
                  {g.outcome && <OutcomeBadge outcome={g.outcome} />}
                </div>
                <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[12px] text-ink-3">
                  <span>{g.area.name}</span>
                  <span>
                    · {periodLabel(g.horizon, isoUTC(g.periodStart!))}
                  </span>
                  <span>
                    ·{" "}
                    {periodCountdown(g.horizon, isoUTC(g.periodStart!), iso)}
                  </span>
                  {g.metric && (
                    <span className="tabular-nums">
                      · {g.metric} {g.current || "—"}
                      {g.target ? ` / ${g.target}` : ""}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Nguyên tắc trong ngày — đọc mất ba giây, nhưng là cách duy nhất
          để những dòng đó không thành chữ chết. */}
      {daily && (
        <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
          <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
            {daily.kind === PrincipleKind.DO ? "Nên nhớ" : "Đừng quên"}
          </div>
          <p className="mt-2 text-[17px] leading-snug">{daily.text}</p>
          {daily.why && (
            <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
              {daily.why}
            </p>
          )}
          <Link
            href={`/os/a/${daily.area.slug}?tab=principles`}
            className="mt-3 inline-block text-[12px] text-ink-3 transition-colors hover:text-ink"
          >
            {daily.area.name} →
          </Link>
        </section>
      )}

      {/* Chỉ số + 3 việc nền tảng — tick ngay tại đây, không phải mở trang khác */}
      <TodayPanel iso={iso} log={todayLog} logs={logs} />

      <Streak logs={logs} />

      <section>
        <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
          Mục tiêu gần nhất
        </h2>
        {nearGoals.length === 0 ? (
          <EmptyNote>
            Chưa có mục tiêu nào. Mở một lĩnh vực bên trái và viết ra thứ bạn
            muốn đạt.
          </EmptyNote>
        ) : (
          <ul className="divide-y divide-line-soft border-y border-line-soft">
            {nearGoals.map((g) => (
              <li key={g.id} className="flex items-baseline gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] leading-snug">{g.title}</div>
                  <div className="mt-0.5 text-[12px] text-ink-3">
                    {g.area.name} · {horizonText(g)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/os/goals"
          className="mt-3 inline-block text-[14px] text-accent underline decoration-accent/35 underline-offset-[3px] hover:decoration-accent"
        >
          Xem tất cả theo mốc tuổi →
        </Link>
      </section>

      {/*
        Chỉ hiện lĩnh vực đang có việc ở NOW — OS-DESIGN §10.3.

        Bảy lĩnh vực × bốn loại nội dung là 28 ô trống. Bày cả 28 ô ra mỗi lần
        mở Dashboard sẽ sinh đúng cái phản xạ mà hệ thống này được dựng ra để
        tránh: đi điền cho đầy. Những lĩnh vực còn lại vẫn nằm nguyên ở thanh
        bên, im lặng, mở ra lúc nào cũng được.
      */}
      {focusedAreas.length > 0 && (
        <section>
          <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
            Lĩnh vực đang có việc
          </h2>
          <ul className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {focusedAreas.map((a) => {
              const total =
                a._count.goals + a._count.principles + a._count.items;
              return (
                <li key={a.slug}>
                  <Link
                    href={`/os/a/${a.slug}`}
                    className="block h-full bg-bg p-4 transition-colors hover:bg-surface"
                  >
                    <div className="text-[15px] font-medium">{a.name}</div>
                    {a.tagline && (
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
                        {a.tagline}
                      </p>
                    )}
                    <div className="mt-2 text-[12px] text-ink-3">
                      {total === 0
                        ? "chưa có gì — chưa cần thiết"
                        : `${total} mục`}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[12px] leading-relaxed text-ink-3">
            {areas.length - focusedAreas.length > 0
              ? `${areas.length - focusedAreas.length} lĩnh vực khác đang nằm im ở thanh bên. Trống là bình thường.`
              : null}
          </p>
        </section>
      )}
    </div>
  );
}
