import Link from "next/link";
import type { DailyLog, PomoSession, StudyGoal, StudySkill } from "@prisma/client";
import {
  goalPace,
  jpPeriodTotal,
  jpStreak,
  jpTotal,
  skillProgress,
  unassignedPomo,
  type Bucket,
} from "@/lib/os/japanese";
import { fmtDateVN, fmtH, isoUTC } from "@/lib/os/day";
import { POMO_MIN } from "@/lib/os/constants";
import { PomoRow } from "./PomoRow";
import { StudyChart } from "./StudyChart";
import { MicroLabel } from "./formBits";

/**
 * Tiếng Nhật hôm nay — hàng pomodoro, nhịp so với mục tiêu, và biểu đồ.
 *
 * Đây là mục ĐẦU TIÊN sau danh sách việc, cố ý: tiếng Nhật là ưu tiên #1 của
 * cả hệ thống (PLAN §6), nên nó phải nằm ở chỗ mắt chạm trước, không phải nằm
 * lẫn giữa chín mục khác.
 */
export function JapaneseToday({
  iso,
  log,
  logs,
  goal,
  skills,
  todaySessions,
  goalSessions,
  daily,
  monthly,
}: {
  iso: string;
  log: DailyLog | null;
  logs: DailyLog[];
  goal: (StudyGoal & { skills: StudySkill[] }) | null;
  skills: StudySkill[];
  todaySessions: Pick<PomoSession, "id" | "order" | "skillId">[];
  /** Mọi hiệp NẰM TRONG đợt — ngân sách mảng tính trên đợt, không phải cả đời. */
  goalSessions: { skillId: string | null }[];
  daily: Bucket[];
  monthly: Bucket[];
}) {
  const pomo = todaySessions.length;
  const todayMin = jpTotal(log);
  const targetPomo = goal?.dailyPomo ?? 0;

  const pace = goal ? goalPace(goal, logs, iso) : null;
  const month = jpPeriodTotal(logs, "month", iso);
  const year = jpPeriodTotal(logs, "year", iso);
  const streak = jpStreak(logs, iso);

  const bySkill = skillProgress(skills, goalSessions);
  const unassigned = unassignedPomo(goalSessions);

  return (
    <section className="rounded-[var(--radius-lg)] border border-line p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <MicroLabel>Tiếng Nhật hôm nay</MicroLabel>
        <span className="text-[13px] tabular-nums text-ink-2">
          {targetPomo > 0 ? `${pomo}/${targetPomo} hiệp · ` : `${pomo} hiệp · `}
          <strong className="font-medium text-ink">{fmtH(todayMin)}</strong>
        </span>
      </div>

      {/* Số CÒN LẠI đặt ngay trên hàng ô, không giấu dưới thanh tiến độ: đây
          là câu duy nhất mà mỗi lần bấm một ô đều trả lời — "còn bao nhiêu
          nữa". Nó tụt đúng một hiệp mỗi lần bấm. */}
      {pace && pace.totalMin > 0 && (
        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 border-t border-line-soft pt-3">
          <span className="text-[24px] font-semibold leading-none tabular-nums tracking-[-0.02em]">
            {fmtH(pace.remainMin)}
          </span>
          <span className="text-[13px] text-ink-2">
            còn lại / {fmtH(pace.totalMin)}
          </span>
          <span className="text-[12px] text-ink-3">
            {pace.remainMin === 0
              ? "· đã đủ số giờ của cả đợt"
              : `· ${Math.ceil(pace.remainMin / POMO_MIN)} hiệp nữa`}
          </span>
        </div>
      )}

      <div className="mt-3">
        <PomoRow
          iso={iso}
          sessions={todaySessions}
          skills={skills}
          targetPomo={targetPomo}
          extraMin={log?.jpMin ?? 0}
        />
      </div>

      {/* ---- Nhịp so với mục tiêu ---- */}
      {goal && pace ? (
        <div className="mt-5 border-t border-line-soft pt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="text-[15px] font-medium">{goal.name}</span>
            <span className="text-[12px] tabular-nums text-ink-3">
              {pace.state === "future"
                ? `bắt đầu ${fmtDateVN(isoUTC(goal.startDate))}`
                : pace.state === "ended"
                  ? `đã hết hạn ${fmtDateVN(isoUTC(goal.targetDate))}`
                  : `còn ${pace.daysLeft} ngày · tới ${fmtDateVN(isoUTC(goal.targetDate))}`}
            </span>
          </div>

          {/* Thanh tiến độ: nền là cả đợt, phần đậm là đã học, vạch dọc là mốc
              "đáng lẽ phải tới đây". Không có vạch đó thì thanh đầy 40% không
              nói được là nhanh hay chậm. */}
          <div className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full rounded-full ${
                pace.aheadMin >= 0 ? "bg-ink" : "bg-ink/45"
              }`}
              style={{ width: `${pace.percent}%` }}
            />
            {pace.dueMin > 0 && pace.dueMin < pace.totalMin && (
              <div
                className="absolute inset-y-0 w-px bg-accent"
                style={{ left: `${(pace.dueMin / pace.totalMin) * 100}%` }}
                title={`Đáng lẽ đã học ${fmtH(pace.dueMin)}`}
              />
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 text-[13px] tabular-nums text-ink-2">
            <span>
              <strong className="font-medium text-ink">{fmtH(pace.doneMin)}</strong>{" "}
              / {fmtH(pace.totalMin)}
            </span>
            <span className="text-ink-3">· {pace.percent}%</span>
            {pace.state === "running" && (
              <span
                className={
                  pace.aheadMin >= 0 ? "text-ink-2" : "font-medium text-accent"
                }
              >
                ·{" "}
                {pace.aheadMin >= 0
                  ? `vượt ${fmtH(pace.aheadMin)}`
                  : `nợ ${fmtH(-pace.aheadMin)}`}
              </span>
            )}
          </div>

          {pace.state === "running" && pace.pomoPerDayLeft != null && (
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink-3">
              {pace.pomoPerDayLeft <= 0 ? (
                "Đã đủ số giờ của cả đợt. Phần học thêm từ giờ là lãi."
              ) : (
                <>
                  Còn {pace.daysLeft} ngày, cần{" "}
                  <strong className="font-medium text-ink-2">
                    {pace.pomoPerDayLeft} hiệp/ngày
                  </strong>{" "}
                  để vẫn kịp
                  {/* Nói thẳng khi nhịp đã đặt KHÔNG đủ để tới đích. Không có
                      câu này thì hàng ô sáng đủ 7/7 mỗi ngày vẫn về đích thiếu
                      cả trăm giờ, mà mỗi ngày đều thấy "hoàn thành". */}
                  {pace.pomoPerDayLeft > goal.dailyPomo ? (
                    <>
                      {" "}— nhịp đang đặt là {goal.dailyPomo}, tức là{" "}
                      <strong className="font-medium text-accent">
                        đủ 7/7 mỗi ngày vẫn không kịp
                      </strong>
                      . Nâng nhịp, lùi ngày đích, hoặc bớt giờ.
                    </>
                  ) : (
                    ` (nhịp đã đặt là ${goal.dailyPomo}).`
                  )}
                </>
              )}
            </p>
          )}

          {/* Ngân sách từng mảng. Đây mới là chỗ nói được "học nhiều rồi
              nhưng nghe thì chưa đụng tới" — con số tổng giấu mất điều đó. */}
          {bySkill.length > 0 && (
            <ul className="mt-4 space-y-2.5">
              {bySkill.map((s) => (
                <li key={s.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-[13px]">
                    <span>
                      {s.icon && <span className="mr-1.5">{s.icon}</span>}
                      {s.name}
                    </span>
                    <span className="tabular-nums text-ink-3">
                      {fmtH(s.doneMin)}
                      {s.targetMin > 0 && ` / ${Math.round(s.targetMin / 60)}h`}
                      {s.pomoLeft > 0 && ` · còn ${s.pomoLeft} hiệp`}
                    </span>
                  </div>
                  {s.targetMin > 0 && (
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full bg-ink/70"
                        style={{ width: `${s.percent}%` }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {unassigned > 0 && (
            <p className="mt-2.5 text-[12px] leading-relaxed text-ink-3">
              {unassigned} hiệp chưa gắn mảng nào — chúng vẫn vào tổng giờ, chỉ
              không vào ngân sách nào cả.
            </p>
          )}
        </div>
      ) : (
        <p className="mt-5 border-t border-line-soft pt-4 text-[13px] leading-relaxed text-ink-3">
          Chưa đặt đợt học nào, nên các ô trên chỉ đếm chứ không so được với
          đích nào cả.{" "}
          <Link
            href="/os/data#muc-tieu-hoc"
            className="text-accent underline decoration-accent/35 underline-offset-[3px] hover:decoration-accent"
          >
            Đặt mục tiêu →
          </Link>
        </p>
      )}

      {/* ---- Tổng kết + biểu đồ ---- */}
      <div className="mt-5 grid grid-cols-4 gap-3 border-t border-line-soft pt-4">
        <Cell label="Hôm nay" value={fmtH(todayMin)} />
        <Cell label="Tháng này" value={fmtH(month)} />
        <Cell label="Năm nay" value={fmtH(year)} />
        <Cell label="Chuỗi học" value={`${streak} ngày`} />
      </div>

      <div className="mt-4">
        <StudyChart daily={daily} monthly={monthly} />
      </div>
    </section>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[12px] text-ink-3">{label}</div>
      <div className="mt-0.5 text-[16px] font-medium tabular-nums">{value}</div>
    </div>
  );
}
