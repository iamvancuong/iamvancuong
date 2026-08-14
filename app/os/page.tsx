import Link from "next/link";
import {
  FocusStatus,
  GoalStatus,
  Horizon,
  PrincipleKind,
} from "@prisma/client";
import { db } from "@/lib/db";
import { ageNow } from "@/lib/os/age";
import {
  addDaysISO,
  dayUTC,
  fmtDateVN,
  isoUTC,
  todayISO,
  weekdayVN,
} from "@/lib/os/day";
import { periodCountdown, periodLabel, periodState } from "@/lib/os/period";
import { keystoneStreak, longestStreak, periodStats } from "@/lib/os/stats";
import { dailyBuckets, monthlyBuckets } from "@/lib/os/japanese";
import { Streak } from "@/components/os/Streak";
import { MAX_NOW, POMO_MIN } from "@/lib/os/constants";
import { horizonText } from "@/components/os/GoalsTab";
import { OutcomeBadge, OutcomeButtons } from "@/components/os/GoalReview";
import { EmptyNote } from "@/components/os/formBits";
import { TodayPanel } from "@/components/os/TodayPanel";
import { DayPlan } from "@/components/os/DayPlan";
import { JapaneseToday } from "@/components/os/JapaneseToday";
import { DashTabs, toDashTab } from "@/components/os/DashTabs";
import { WhyPanel } from "@/components/os/WhyPanel";

/** Bao nhiêu nguyên tắc hiện mỗi ngày. Một câu quá dễ lướt qua, ba câu thì không. */
const DAILY_PRINCIPLES = 3;

/**
 * Trang «Hôm nay» — chia làm BỐN TAB (14/08), không còn là một trang dài.
 *
 *   Nên nhớ    ← mặc định: nỗ lực để làm gì + 3 nguyên tắc trong ngày
 *   Việc       ← đường vào nhật ký + việc hôm nay/ngày mai + đang tập trung
 *   Tiếng Nhật ← pomodoro + nhịp đợt + biểu đồ
 *   Nhìn lại   ← kỳ chưa chấm · cam kết kỳ này · chuỗi ngày · mục tiêu gần nhất
 *
 * Lý do chia + vì sao «Nên nhớ» là tab đầu: xem chú thích trong `DashTabs.tsx`.
 *
 * ⚠️ Mục «Lĩnh vực đang có việc» đã GỠ (14/08). Nó chỉ là bảy đường tắt sang
 * thứ vốn nằm sẵn ở thanh bên, và chiếm chỗ đúng bằng một màn hình điện thoại.
 *
 * Mọi truy vấn vẫn chạy cho MỌI tab, không lọc theo tab đang mở: hai badge
 * (việc chưa xong · kỳ chưa chấm) cần số của tab đang đóng, và đây là app một
 * người dùng — vài truy vấn thừa rẻ hơn nhiều so với một badge sai.
 */
export default async function DashboardPage({
  searchParams,
}: PageProps<"/os">) {
  const sp = await searchParams;
  const tab = toDashTab(sp.tab);

  const iso = todayISO();
  const tomorrow = addDaysISO(iso, 1);
  const yesterday = addDaysISO(iso, -1);

  const [
    nearGoals,
    principles,
    logs,
    nowItems,
    periodGoals,
    dayTasks,
    yesterdayUndone,
    studyGoal,
  ] = await Promise.all([
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
      // Chỉ nguyên tắc ĐƯỢC GHIM mới lên Dashboard (1 câu/ngày xoay vòng).
      db.principle.findMany({
        where: { active: true, pinned: true },
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
      // Việc của hôm nay VÀ ngày mai trong một lượt — tab «Ngày mai» đổi tại
      // chỗ, không gọi lại server.
      db.dayTask.findMany({
        where: { date: { in: [dayUTC(iso), dayUTC(tomorrow)] } },
        orderBy: [{ done: "asc" }, { order: "asc" }],
      }),
      db.dayTask.count({ where: { date: dayUTC(yesterday), done: false } }),
      /**
       * Mục tiêu học đang chạy: một `Goal` CHA (không có parentId) có
       * `targetHours`, thuộc lĩnh vực đã bật `tracksStudy`.
       *
       * `targetHours != null` là dấu hiệu duy nhất — không có cột "loại" nào,
       * nên mục tiêu thường không bao giờ lọt vào đây.
       */
      db.goal.findFirst({
        where: {
          parentId: null,
          targetHours: { not: null },
          status: { not: GoalStatus.DROPPED },
          area: { tracksStudy: true },
        },
        orderBy: { studyEnd: "asc" },
        include: {
          area: { select: { slug: true } },
          children: { orderBy: { order: "asc" } },
        },
      }),
    ]);

  // Hai truy vấn hiệp pomodoro phụ thuộc đợt đang chạy nên phải chờ nó xong.
  // Ngân sách mảng tính TRONG KHOẢNG của đợt, không phải cả đời: 250 giờ từ
  // vựng là 250 giờ cho đợt N3, giờ học từ năm ngoái không được tính vào.
  const [todaySessions, goalSessions] = await Promise.all([
    db.pomoSession.findMany({
      where: { date: dayUTC(iso) },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { id: true, order: true, goalId: true },
    }),
    studyGoal?.studyStart && studyGoal.studyEnd
      ? db.pomoSession.findMany({
          where: {
            date: { gte: studyGoal.studyStart, lte: studyGoal.studyEnd },
          },
          select: { goalId: true },
        })
      : Promise.resolve([]),
  ]);

  const age = ageNow();
  const todayLog = logs.find((l) => isoUTC(l.date) === iso) ?? null;

  const todayTasks = dayTasks.filter((t) => isoUTC(t.date) === iso);
  const tomorrowTasks = dayTasks.filter((t) => isoUTC(t.date) === tomorrow);

  /**
   * Đích phút của một ngày — chỉ những ngày NẰM TRONG đợt mới có đích. Ngày
   * ngoài đợt trả 0 nên biểu đồ không vẽ vạch đích ở đó, thay vì vẽ một vạch
   * mà ngày đó chưa hề cam kết gì.
   */
  const startISO = studyGoal?.studyStart ? isoUTC(studyGoal.studyStart) : null;
  const endISO = studyGoal?.studyEnd ? isoUTC(studyGoal.studyEnd) : null;
  const targetOn = (d: string) =>
    startISO && endISO && startISO <= d && d <= endISO
      ? (studyGoal?.dailyPomo ?? 0) * POMO_MIN
      : 0;

  const daily = dailyBuckets(logs, 30, targetOn, iso);
  const monthly = monthlyBuckets(logs, 12, iso);

  // Chuỗi + thống kê tính ở SERVER (todayISO cố định JST) để không phụ thuộc
  // múi giờ trình duyệt — trước đây Streak tính ở client nên máy lệch giờ thì
  // ra sai. Nay giống cách trang chủ công khai làm.
  const streakStats = {
    current: keystoneStreak(logs),
    best: longestStreak(logs),
    month: periodStats(logs, "month"),
    year: periodStats(logs, "year"),
  };

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
   * BA nguyên tắc mỗi ngày (trước đây một).
   *
   * Chọn theo NGÀY chứ không ngẫu nhiên thật — mở lại trang trong cùng một
   * ngày vẫn ra đúng ba câu đó, nên chúng có cơ hội đọng lại thay vì lướt qua.
   * Cửa sổ trượt một bước mỗi ngày: hôm nay [i, i+1, i+2], mai [i+1, i+2, i+3]
   * — mỗi sáng có một câu mới, hai câu còn lại là câu vừa đọc hôm qua. Đọc lại
   * chính là chỗ nguyên tắc bám vào, nên trùng lặp ở đây là cố ý.
   *
   * Ghim ít hơn ba câu thì hiện đúng số đang có, không lặp lại cho đủ ba.
   */
  const dayIndex = Math.floor(dayUTC(iso).getTime() / 86_400_000);
  const dailyPrinciples = Array.from(
    { length: Math.min(DAILY_PRINCIPLES, principles.length) },
    (_, i) => principles[(dayIndex + i) % principles.length],
  );

  // Badge của tab — chỉ đếm thứ CÓ HẠN, xem chú thích trong `DashTabs.tsx`.
  const undoneToday = todayTasks.filter((t) => !t.done).length;

  return (
    <div className="max-w-[880px]">
      <header className="flex flex-wrap items-baseline justify-between gap-2 pb-4">
        <h1 className="text-[20px] font-semibold tracking-[-0.01em]">
          Hôm nay
          <span className="ml-2.5 text-[15px] font-normal text-ink-3">
            {weekdayVN(iso)}, {fmtDateVN(iso)}
          </span>
        </h1>
        <span className="text-[13px] text-ink-3">
          {age.years} tuổi {age.months} tháng
        </span>
      </header>

      <DashTabs
        current={tab}
        badges={{ viec: undoneToday, "nhin-lai": toReview.length }}
      />

      <div className="mt-8 space-y-12">
        {tab === "nho" && (
          <>
            {/* Vì sao phải cố. Cố định trong code — xem WhyPanel.tsx. */}
            <WhyPanel />

            {/* Nguyên tắc trong ngày — đọc mất ba giây, nhưng là cách duy nhất
                để những dòng đó không thành chữ chết. */}
            {dailyPrinciples.length > 0 && (
              <section>
                <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
                  Nguyên tắc hôm nay
                </h2>
                <ul className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line">
                  {dailyPrinciples.map((p) => (
                    <li key={p.id} className="bg-surface p-4">
                      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">
                        {p.kind === PrincipleKind.DO ? "Nên" : "Không nên"}
                      </div>
                      <p className="mt-1.5 text-[16px] leading-snug">{p.text}</p>
                      {p.why && (
                        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
                          {p.why}
                        </p>
                      )}
                      <Link
                        href={`/os/a/${p.area.slug}?tab=principles`}
                        className="mt-2 inline-block text-[12px] text-ink-3 transition-colors hover:text-ink"
                      >
                        {p.area.name} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        {tab === "viec" && (
          <>
            {/* Cảnh báo tuần + đường sang nhật ký. Ba việc nền tảng đã dọn khỏi
                Dashboard — xem chú thích đầu TodayPanel.tsx. */}
            <TodayPanel iso={iso} logs={logs} />

            {/* Việc hôm nay — câu duy nhất cần trả lời lúc vừa mở mắt.
                Viết được từ tối hôm trước qua tab «Ngày mai». */}
            <DayPlan
              todayISO={iso}
              tomorrowISO={tomorrow}
              todayTasks={todayTasks}
              tomorrowTasks={tomorrowTasks}
              yesterdayISO={yesterday}
              yesterdayUndone={yesterdayUndone}
            />

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
          </>
        )}

        {tab === "tieng-nhat" && (
          <JapaneseToday
            iso={iso}
            log={todayLog}
            logs={logs}
            areaSlug={studyGoal?.area.slug ?? null}
            goal={studyGoal}
            todaySessions={todaySessions}
            goalSessions={goalSessions}
            daily={daily}
            monthly={monthly}
          />
        )}

        {tab === "nhin-lai" && (
          <>
            {/* Kỳ đã hết mà chưa chấm — trên cùng vì đây là việc có hạn.
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
                        <span className="text-[15px] leading-snug">
                          {g.title}
                        </span>
                        {g.outcome && <OutcomeBadge outcome={g.outcome} />}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[12px] text-ink-3">
                        <span>{g.area.name}</span>
                        <span>
                          · {periodLabel(g.horizon, isoUTC(g.periodStart!))}
                        </span>
                        <span>
                          ·{" "}
                          {periodCountdown(
                            g.horizon,
                            isoUTC(g.periodStart!),
                            iso,
                          )}
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

            <Streak logs={logs} stats={streakStats} />

            <section>
              <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
                Mục tiêu gần nhất
              </h2>
              {nearGoals.length === 0 ? (
                <EmptyNote>
                  Chưa có mục tiêu nào. Mở một lĩnh vực bên trái và viết ra thứ
                  bạn muốn đạt.
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
          </>
        )}
      </div>
    </div>
  );
}
