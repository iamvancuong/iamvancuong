import { setSkillPomodoro } from "@/lib/os/dayActions";
import { POMO_MIN } from "@/lib/os/constants";
import { fmtH } from "@/lib/os/day";

/**
 * Checklist học tiếng Nhật theo TỪNG mảng — mỗi ô là một hiệp {POMO_MIN} phút.
 *
 * Khác hàng ô sao ở `/os` (đặt TỔNG rồi gắn mảng đang chọn): ở đây mỗi mảng có
 * dãy ô riêng đúng bằng KẾ HOẠCH `dailyPomo`, tick thẳng vào mảng đó. Cả hai
 * đều ghi qua `PomoSession` nên cùng một tổng, cùng một bất biến
 * `jpPomo == số dòng PomoSession` (xem `setSkillPomodoro`).
 *
 * Không có state client: mỗi ô là một form gửi thẳng server action, giống hàng
 * sao. Bấm ô cuối đang sáng của một mảng để lùi một hiệp.
 */
export type SkillPlan = {
  id: string;
  title: string;
  icon: string | null;
  /** Kế hoạch hiệp/ngày (`Goal.dailyPomo`). 0 = chưa đặt kế hoạch. */
  planned: number;
  /** Số hiệp đã tick cho mảng này hôm nay. */
  done: number;
};

export function PomoChecklist({
  iso,
  skills,
  totalPomo,
  extraMin,
  untagged,
}: {
  iso: string;
  skills: SkillPlan[];
  /** Tổng hiệp cả ngày = số dòng PomoSession. */
  totalPomo: number;
  /** Phút lẻ ngoài pomodoro (`DailyLog.jpMin`). */
  extraMin: number;
  /** Số hiệp chưa gắn mảng nào — nói thẳng thay vì im lặng nuốt mất. */
  untagged: number;
}) {
  const totalMin = totalPomo * POMO_MIN + extraMin;

  return (
    <div className="space-y-3">
      {skills.map((s) => {
        // Luôn hiện đủ chỗ cho cả kế hoạch LẪN phần đã làm vượt kế hoạch — nếu
        // không, hiệp vượt sẽ không có ô để hiện và trông như bị mất.
        const boxes = Math.max(s.planned, s.done);

        return (
          <div key={s.id}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-[14px] leading-snug">
                {s.icon && <span className="mr-1.5">{s.icon}</span>}
                {s.title}
              </span>
              <span className="shrink-0 text-[12px] tabular-nums text-ink-3">
                {s.done}/{s.planned || boxes} hiệp
              </span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: boxes }, (_, i) => {
                const n = i + 1;
                const on = i < s.done;
                // Ô vượt kế hoạch vẫn bấm được nhưng nhạt hơn: học thêm là tốt,
                // chỉ là nó không còn là thứ đang bị đòi hỏi. Cùng quy ước với
                // hàng ô sao (PomoRow).
                const beyond = s.planned > 0 && n > s.planned;

                return (
                  <form
                    key={n}
                    action={setSkillPomodoro.bind(null, iso, s.id, n)}
                    className="flex-1"
                  >
                    <button
                      type="submit"
                      aria-pressed={on}
                      aria-label={`${s.title}: ${n} hiệp — ${fmtH(n * POMO_MIN)}`}
                      title={`${n} hiệp · ${fmtH(n * POMO_MIN)}`}
                      className={`flex h-10 w-full items-center justify-center rounded-[var(--radius-sm)] border text-[13px] tabular-nums transition-colors ${
                        on
                          ? beyond
                            ? "border-ink bg-ink/55 text-bg"
                            : "border-ink bg-ink text-bg"
                          : /* Viền `ink-3` chứ không `line`: viền của một ĐIỀU
                               KHIỂN cần ≥3:1, mà `line` chỉ 1.3:1 ở chế độ tối.
                               Cùng lý do ở PomoRow / TodayPanel. */
                            `border-ink-3 bg-bg text-ink-3 hover:bg-surface-2 ${
                              beyond ? "border-dashed opacity-60" : ""
                            }`
                      }`}
                    >
                      {on ? "✓" : n}
                    </button>
                  </form>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="pt-0.5 text-[12px] leading-relaxed text-ink-3">
        Mỗi ô = 1 hiệp {POMO_MIN} phút. Bấm ô cuối đang sáng của một mảng để lùi
        một hiệp. Tổng hôm nay:{" "}
        <strong className="font-medium text-ink-2">
          {totalPomo} hiệp · {fmtH(totalMin)}
        </strong>
        {extraMin > 0 && ` (gồm ${fmtH(extraMin)} lẻ)`}
        {untagged > 0 && ` · ${untagged} hiệp chưa gắn mảng`}.
      </p>
    </div>
  );
}
