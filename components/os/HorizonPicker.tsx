"use client";

import { useState } from "react";
import { Horizon } from "@prisma/client";
import type { AgeMilestone } from "@/lib/os/age";
import { isPeriod } from "@/lib/os/period";

/**
 * Chọn mốc thời gian cho một mục tiêu.
 *
 * Là client component vì hai lý do, cả hai đều về việc bớt thứ phải nghĩ:
 *
 *  1. **Chỉ hiện đúng ô cần dùng.** Trước đây form bày cùng lúc ô ngày (cho
 *     tuần/tháng) và ô tuổi, kèm một đoạn chữ giải thích ô nào dùng khi nào —
 *     tức là bắt người dùng đọc hướng dẫn để điền một cái form.
 *  2. **Mốc tuổi tính sẵn, không gõ tay.** Hệ thống biết ngày sinh thì việc
 *     tra "25 tuổi là năm nào, còn bao lâu" là việc của nó. Chọn xong thấy
 *     ngay ngày và thời gian còn lại.
 *
 * Danh sách mốc do server tính rồi truyền xuống, không tính ở client — nếu
 * tính hai nơi thì lệch múi giờ là ra hai kết quả khác nhau, và React sẽ báo
 * lỗi hydrate.
 */
export function HorizonPicker({
  milestones,
  defaultHorizon,
  defaultAge,
  defaultPeriod,
}: {
  milestones: AgeMilestone[];
  defaultHorizon: Horizon;
  defaultAge: number | null;
  /** "YYYY-MM-DD" — một ngày bất kỳ trong kỳ */
  defaultPeriod: string;
}) {
  const [horizon, setHorizon] = useState<Horizon>(defaultHorizon);

  // Mốc mặc định: giữ cái đang có nếu còn hợp lệ, không thì lấy mốc tròn gần
  // nhất (thường là 25 hoặc 30) — thứ người ta hay đặt mục tiêu nhất.
  const fallback =
    milestones.find((m) => m.age % 5 === 0)?.age ?? milestones[0]?.age ?? 25;
  const initialAge =
    defaultAge && milestones.some((m) => m.age === defaultAge)
      ? defaultAge
      : fallback;

  const [age, setAge] = useState(initialAge);
  const chosen = milestones.find((m) => m.age === age);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <select
          name="horizon"
          value={horizon}
          onChange={(e) => setHorizon(e.target.value as Horizon)}
          aria-label="Mốc thời gian"
          className="rounded-[var(--radius-sm)] border border-line bg-bg px-3 py-2 text-[14px] outline-none focus:border-ink-3"
        >
          <optgroup label="Cam kết có kỳ">
            <option value={Horizon.WEEK}>Tuần</option>
            <option value={Horizon.MONTH}>Tháng</option>
          </optgroup>
          <optgroup label="Mốc dài hạn">
            <option value={Horizon.THIS_YEAR}>Năm nay</option>
            <option value={Horizon.NEXT_YEAR}>Năm sau</option>
            <option value={Horizon.AGE}>Mốc tuổi</option>
            <option value={Horizon.LIFE}>Cả đời</option>
          </optgroup>
        </select>

        {isPeriod(horizon) && (
          <input
            name="periodStart"
            type="date"
            defaultValue={defaultPeriod}
            aria-label="Ngày trong kỳ"
            className="rounded-[var(--radius-sm)] border border-line bg-bg px-3 py-2 text-[14px] tabular-nums outline-none focus:border-ink-3"
          />
        )}

        {horizon === Horizon.AGE && (
          <select
            name="horizonAge"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            aria-label="Mốc tuổi"
            className="rounded-[var(--radius-sm)] border border-line bg-bg px-3 py-2 text-[14px] tabular-nums outline-none focus:border-ink-3"
          >
            {milestones.map((m) => (
              <option key={m.age} value={m.age}>
                {m.age} tuổi — {m.year}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Ô nhập ẩn đi vẫn phải gửi giá trị, nếu không server nhận thiếu và
          mục tiêu mất mốc khi sửa. */}
      {!isPeriod(horizon) && (
        <input type="hidden" name="periodStart" value="" />
      )}
      {horizon !== Horizon.AGE && (
        <input type="hidden" name="horizonAge" value={age} />
      )}

      <p className="text-[12px] leading-relaxed text-ink-3">
        {isPeriod(horizon) ? (
          <>
            Gõ <strong className="font-medium text-ink-2">ngày nào trong kỳ</strong>{" "}
            cũng được — hệ thống tự nắn về{" "}
            {horizon === Horizon.WEEK ? "thứ Hai của tuần đó" : "ngày 1 của tháng"}.
            Hết kỳ sẽ có chỗ chấm kết quả và viết lại vì sao.
          </>
        ) : horizon === Horizon.AGE && chosen ? (
          <>
            Sinh nhật {chosen.age} tuổi rơi vào{" "}
            <strong className="font-medium text-ink-2">{chosen.dateVN}</strong> —{" "}
            {chosen.until}.
          </>
        ) : horizon === Horizon.LIFE ? (
          "Không có hạn — thứ mình muốn giữ suốt đời."
        ) : (
          "Mốc dài hạn, không có ngày kết thúc cụ thể."
        )}
      </p>
    </div>
  );
}
