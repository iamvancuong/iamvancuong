import type { StudyGoal, StudySkill } from "@prisma/client";
import { Trash2 } from "lucide-react";
import {
  createStudyGoal,
  createStudySkill,
  deleteStudyGoal,
  deleteStudySkill,
  toggleStudyGoal,
} from "@/lib/os/studyActions";
import { POMO_MIN, POMO_SLOTS } from "@/lib/os/constants";
import { daysBetweenISO, fmtDateVN, fmtH, isoUTC, todayISO } from "@/lib/os/day";
import { ConfirmButton, SubmitButton, inputSmCls } from "./formBits";
import { Disclosure } from "./Disclosure";

/**
 * Đặt đợt học ở /os/data chứ không ở /os.
 *
 * Đây là việc làm **một lần mỗi vài tháng** — cùng hạng với thêm lĩnh vực và
 * tải sao lưu. Đặt form này lên Dashboard thì mỗi sáng đều phải nhìn một cái
 * form không dùng tới, trong khi Dashboard chỉ nên hiện KẾT QUẢ của nó.
 */
export function StudyGoalSection({
  goals,
  areas,
}: {
  goals: (StudyGoal & { skills: StudySkill[] })[];
  areas: { id: string; name: string }[];
}) {
  const today = todayISO();

  return (
    <section id="muc-tieu-hoc" className="scroll-mt-8">
      <h2 className="mb-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
        Mục tiêu học
      </h2>
      <p className="mb-3 text-[13px] leading-relaxed text-ink-3">
        Một đợt có kỳ hạn và có nhịp mỗi ngày. Đợt đang bật là đợt hiện ở{" "}
        <strong className="font-medium text-ink-2">Hôm nay</strong> — bật đợt
        mới thì đợt cũ tự tắt.
      </p>

      {goals.length > 0 && (
        <ul className="mb-4 divide-y divide-line-soft border-y border-line-soft">
          {goals.map((g) => {
            const start = isoUTC(g.startDate);
            const end = isoUTC(g.targetDate);
            const days = daysBetweenISO(start, end) + 1;
            // Tổng nhập tay thắng nhịp — cùng luật với `goalPace`, đừng để hai
            // chỗ tính khác nhau rồi /os và /os/data nói hai con số.
            const totalMin = g.targetHours
              ? g.targetHours * 60
              : days * g.dailyPomo * POMO_MIN;
            const capacityMin = days * g.dailyPomo * POMO_MIN;
            const left = daysBetweenISO(today, end);

            return (
              <li key={g.id} className="flex items-start gap-3 py-3">
                <form action={toggleStudyGoal.bind(null, g.id)}>
                  <button
                    type="submit"
                    aria-pressed={g.active}
                    title={g.active ? "Đang chạy — bấm để tắt" : "Bật đợt này"}
                    className={`mt-0.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.06em] transition-colors ${
                      g.active
                        ? "bg-ink text-bg"
                        : "border border-ink-3 text-ink-3 hover:text-ink"
                    }`}
                  >
                    {g.active ? "đang chạy" : "đã tắt"}
                  </button>
                </form>

                <div className="min-w-0 flex-1">
                  <div className="text-[15px] leading-snug">{g.name}</div>
                  <div className="mt-0.5 text-[12px] tabular-nums text-ink-3">
                    {fmtDateVN(start)} → {fmtDateVN(end)} · {days} ngày ·{" "}
                    {g.dailyPomo} hiệp/ngày · tổng {fmtH(totalMin)}
                    {g.targetHours ? " (nhập tay)" : " (suy từ nhịp)"}
                    {g.active && left >= 0 && ` · còn ${left + 1} ngày`}
                  </div>

                  {/* Nhịp đã đặt không chứa nổi tổng giờ đã cam kết — nói ngay
                      tại chỗ đặt kế hoạch, đừng để phát hiện vào tháng thứ ba. */}
                  {g.targetHours && capacityMin < totalMin && (
                    <p className="mt-1 text-[12px] leading-relaxed text-accent">
                      Nhịp {g.dailyPomo} hiệp/ngày chỉ chứa {fmtH(capacityMin)}{" "}
                      trong {days} ngày — thiếu {fmtH(totalMin - capacityMin)}.
                      Cần {(totalMin / days / POMO_MIN).toFixed(1)} hiệp/ngày,
                      hoặc lùi ngày đích.
                    </p>
                  )}
                  {g.note && (
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
                      {g.note}
                    </p>
                  )}

                  <Skills goal={g} totalMin={totalMin} />
                </div>

                <form action={deleteStudyGoal.bind(null, g.id)}>
                  <ConfirmButton
                    confirm={`Xóa đợt «${g.name}»? Giờ đã học không mất — nó nằm ở nhật ký từng ngày, chỉ mất cái đích để so.`}
                    label={`Xóa ${g.name}`}
                    className="p-1.5 text-ink-3 hover:text-ink"
                  >
                    <Trash2 size={15} strokeWidth={1.75} />
                  </ConfirmButton>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      <Disclosure
        label={
          goals.length === 0
            ? "Đặt đợt học đầu tiên — ví dụ: N3 trong 4 tháng, 7 hiệp/ngày"
            : "Thêm đợt mới"
        }
      >
        <form action={createStudyGoal} className="space-y-3">
          <label className="block">
            <span className="block text-[12px] text-ink-3">Tên đợt</span>
            <input
              name="name"
              required
              maxLength={120}
              placeholder="JLPT N3"
              className={`mt-1 ${inputSmCls}`}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-[12px] text-ink-3">Bắt đầu</span>
              <input
                type="date"
                name="startDate"
                required
                defaultValue={today}
                className={`mt-1 ${inputSmCls}`}
              />
            </label>
            <label className="block">
              <span className="block text-[12px] text-ink-3">Đích</span>
              <input
                type="date"
                name="targetDate"
                required
                className={`mt-1 ${inputSmCls}`}
              />
            </label>
            {/* Ô quan trọng nhất của form: người ta nghĩ bằng TỔNG GIỜ
                ("N3 khoảng 800 giờ"), không nghĩ bằng nhịp. Để trống thì hệ
                thống suy tổng từ nhịp như trước. */}
            <label className="block">
              <span className="block text-[12px] text-ink-3">
                Tổng số giờ cần
              </span>
              <input
                type="number"
                name="targetHours"
                min={0}
                max={5000}
                placeholder="800"
                className={`mt-1 ${inputSmCls}`}
              />
            </label>
            <label className="block">
              <span className="block text-[12px] text-ink-3">
                Hiệp mỗi ngày ({POMO_MIN}p/hiệp)
              </span>
              <input
                type="number"
                name="dailyPomo"
                min={1}
                max={POMO_SLOTS}
                defaultValue={7}
                className={`mt-1 ${inputSmCls}`}
              />
            </label>
            <label className="block">
              <span className="block text-[12px] text-ink-3">Lĩnh vực</span>
              <select name="areaId" className={`mt-1 ${inputSmCls}`}>
                <option value="">—</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="block text-[12px] text-ink-3">Ghi chú</span>
            <textarea
              name="note"
              rows={2}
              maxLength={500}
              placeholder="Vì sao đợt này, và đo bằng gì?"
              className={`mt-1 ${inputSmCls} resize-y`}
            />
          </label>

          <SubmitButton>Tạo đợt</SubmitButton>
        </form>
      </Disclosure>
    </section>
  );
}

/**
 * Chia đợt thành các mảng có ngân sách giờ riêng.
 *
 * Có tổng giờ của đợt để đối chiếu ngay tại chỗ: cộng sáu mảng lại mà vượt
 * tổng thì kế hoạch đã bất khả thi từ trên giấy, và biết điều đó lúc **đặt kế
 * hoạch** rẻ hơn nhiều so với biết vào tháng thứ ba.
 */
function Skills({
  goal,
  totalMin,
}: {
  goal: StudyGoal & { skills: StudySkill[] };
  totalMin: number;
}) {
  const budgetMin = goal.skills.reduce((s, k) => s + k.targetHours * 60, 0);
  const over = budgetMin > totalMin;

  return (
    <div className="mt-2.5">
      {goal.skills.length > 0 && (
        <>
          <ul className="space-y-1">
            {goal.skills.map((k) => (
              <li
                key={k.id}
                className="flex items-baseline gap-2 text-[13px] text-ink-2"
              >
                <span className="min-w-0 flex-1">
                  {k.icon && <span className="mr-1.5">{k.icon}</span>}
                  {k.name}
                </span>
                <span className="tabular-nums text-ink-3">
                  {k.targetHours}h
                </span>
                <form action={deleteStudySkill.bind(null, k.id)}>
                  <ConfirmButton
                    confirm={`Xóa mảng «${k.name}»? Giờ đã học KHÔNG mất — các hiệp của nó rơi về «chưa gắn mảng» và vẫn nằm trong tổng.`}
                    label={`Xóa mảng ${k.name}`}
                    className="text-ink-3 hover:text-ink"
                  >
                    <Trash2 size={13} strokeWidth={1.75} />
                  </ConfirmButton>
                </form>
              </li>
            ))}
          </ul>

          <p
            className={`mt-1.5 text-[12px] tabular-nums ${
              over ? "text-accent" : "text-ink-3"
            }`}
          >
            Ngân sách các mảng {Math.round(budgetMin / 60)}h / tổng đợt{" "}
            {Math.round(totalMin / 60)}h
            {over
              ? " — các mảng cộng lại vượt tổng, phải cắt bớt hoặc nâng tổng."
              : budgetMin < totalMin
                ? ` · chưa chia ${Math.round((totalMin - budgetMin) / 60)}h`
                : ""}
          </p>
        </>
      )}

      <Disclosure small label={goal.skills.length ? "Thêm mảng" : "Chia mảng (từ vựng · nghe · đọc…)"}>
        <form
          action={createStudySkill.bind(null, goal.id)}
          className="flex flex-wrap items-end gap-2"
        >
          <label className="w-14">
            <span className="block text-[11px] text-ink-3">Icon</span>
            <input
              name="icon"
              maxLength={8}
              placeholder="🎧"
              className={`mt-1 ${inputSmCls}`}
            />
          </label>
          <label className="min-w-[140px] flex-1">
            <span className="block text-[11px] text-ink-3">Tên mảng</span>
            <input
              name="name"
              required
              maxLength={80}
              placeholder="Nghe"
              className={`mt-1 ${inputSmCls}`}
            />
          </label>
          <label className="w-20">
            <span className="block text-[11px] text-ink-3">Giờ</span>
            <input
              type="number"
              name="targetHours"
              min={0}
              max={2000}
              placeholder="150"
              className={`mt-1 ${inputSmCls}`}
            />
          </label>
          <SubmitButton>Thêm</SubmitButton>
        </form>
      </Disclosure>
    </div>
  );
}
