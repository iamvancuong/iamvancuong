"use client";

import { useState } from "react";
import type { PomoSession, StudySkill } from "@prisma/client";
import { setPomodoro } from "@/lib/os/dayActions";
import { POMO_MIN, POMO_SLOTS } from "@/lib/os/constants";
import { fmtH } from "@/lib/os/day";

/**
 * Hàng ô pomodoro — dùng chung cho `/os` (hôm nay) và `/os/log/[ngày]`
 * (chữa ngày đã qua). Nhận `iso` nên không tự giả định là hôm nay.
 *
 * Ô reset theo ngày là chuyện tự nhiên, không phải một cơ chế: mỗi ngày là một
 * tập `PomoSession` khóa theo `date`, còn `/os` luôn hỏi `todayISO()` (giờ Nhật
 * cố định). Nửa đêm JST là hàng ô trắng lại, ngày cũ giữ nguyên số của nó.
 *
 * Chọn mảng TRƯỚC rồi bấm ô: hiệp mới ghi vào mảng đang chọn. Học hai mảng
 * trong một ngày thì đổi chip rồi bấm tiếp — hiệp cũ giữ nguyên mảng của chúng.
 */
export function PomoRow({
  iso,
  sessions,
  skills,
  targetPomo,
  extraMin,
}: {
  iso: string;
  sessions: (Pick<PomoSession, "id" | "order"> & { skillId: string | null })[];
  skills: Pick<StudySkill, "id" | "name" | "icon">[];
  targetPomo: number;
  extraMin: number;
}) {
  const pomo = sessions.length;

  /**
   * Mảng đang chọn. Mặc định là mảng của hiệp GẦN NHẤT hôm đó — đang học dở
   * từ vựng thì bấm hiệp kế tiếp không phải chọn lại. Chưa học gì thì mảng đầu.
   */
  const [skillId, setSkillId] = useState<string | null>(
    sessions.at(-1)?.skillId ?? skills[0]?.id ?? null,
  );

  const skillOf = new Map(skills.map((s) => [s.id, s]));
  const label = (id: string | null) => {
    const s = id ? skillOf.get(id) : null;
    return s ? (s.icon ?? s.name.slice(0, 1)) : "";
  };

  return (
    <div>
      {skills.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSkillId(s.id)}
              aria-pressed={s.id === skillId}
              className={`rounded-full px-2.5 py-1 text-[12px] transition-colors ${
                s.id === skillId
                  ? "bg-ink text-bg"
                  : "border border-line text-ink-2 hover:bg-surface hover:text-ink"
              }`}
            >
              {s.icon && <span className="mr-1">{s.icon}</span>}
              {s.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSkillId(null)}
            aria-pressed={skillId === null}
            title="Ghi hiệp mà chưa gắn mảng nào"
            className={`rounded-full px-2.5 py-1 text-[12px] transition-colors ${
              skillId === null
                ? "bg-ink text-bg"
                : "border border-dashed border-line text-ink-3 hover:text-ink"
            }`}
          >
            chưa gắn
          </button>
        </div>
      )}

      <div className="flex gap-1.5">
        {Array.from({ length: POMO_SLOTS }, (_, i) => {
          const n = i + 1;
          const on = n <= pomo;
          // Ô vượt đích vẫn bấm được nhưng vẽ nhạt hơn: học thêm là tốt, chỉ
          // là nó không còn là thứ đang bị đòi hỏi.
          const beyond = targetPomo > 0 && n > targetPomo;
          const mark = on ? label(sessions[i]?.skillId ?? null) : "";

          return (
            <form
              key={n}
              action={setPomodoro.bind(null, iso, n, skillId)}
              className="flex-1"
            >
              <button
                type="submit"
                aria-pressed={on}
                aria-label={`${n} hiệp — ${fmtH(n * POMO_MIN)}`}
                title={`${n} hiệp · ${fmtH(n * POMO_MIN)}`}
                className={`flex h-11 w-full items-center justify-center rounded-[var(--radius-sm)] border text-[13px] tabular-nums transition-colors ${
                  on
                    ? beyond
                      ? "border-ink bg-ink/55 text-bg"
                      : "border-ink bg-ink text-bg"
                    : /* Viền `ink-3` chứ không phải `line`: viền của một ĐIỀU
                         KHIỂN cần ≥3:1, mà `line` chỉ được 1.3:1 ở chế độ tối.
                         Cùng lý do đã ghi ở TodayPanel.tsx. */
                      `border-ink-3 bg-bg text-ink-3 hover:bg-surface ${
                        beyond ? "border-dashed opacity-60" : ""
                      }`
                }`}
              >
                {mark || n}
              </button>
            </form>
          );
        })}
      </div>

      <p className="mt-2 text-[12px] text-ink-3">
        Một ô = {POMO_MIN} phút. Bấm ô cuối đang sáng để lùi một hiệp.
        {extraMin > 0 && ` Cộng ${fmtH(extraMin)} lẻ đã ghi ở nhật ký.`}
      </p>
    </div>
  );
}
