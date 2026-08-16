"use client";

import { useMemo, useState } from "react";
import type { HeatCell } from "@/lib/streaks";

/**
 * Lịch hoạt động CẢ NĂM — 53 cột × 7 hàng, có nút chọn năm.
 *
 * ## Vì sao là cả năm chứ không phải một cửa sổ trượt
 *
 * Bản trước đổ 119 ngày gần nhất vào một dải rồi cho cuộn ngang. Hai vấn đề:
 * ô phải nhỏ mới vừa, và một dải "119 ngày gần đây" **không có mốc nào** —
 * không biết đang nhìn tháng mấy, không so được năm nay với năm ngoái.
 *
 * Một năm là đơn vị người ta thật sự nghĩ bằng. Có nhãn tháng ở trên, nhãn thứ
 * ở bên trái, và nút năm — ba thứ đó biến một dải màu thành một cái LỊCH.
 *
 * ## Màu xanh lá, không phải xanh dương
 *
 * Xanh dương ở đây trùng với `--color-accent` vốn dùng cho link và cho mọi
 * điểm nhấn khác; lịch nhiệt tô kín cả một băng bằng đúng màu đó thì màu nhấn
 * hết còn nhấn được gì. Xanh lá (`--color-up`) đã là màu "đang tốt" trong
 * `/os`, nên nó vừa tách ra khỏi màu nhấn, vừa nói đúng nghĩa.
 *
 * ## Chỉ nhận dữ liệu, không tính gì thêm
 *
 * Server gửi mức 0–3 của mọi ngày CÓ nhật ký (`getPublicStreaks`). Ngày không
 * có bản ghi thì vắng mặt và được vẽ là ô trống — không cần gửi hàng trăm số 0
 * qua mạng để nói "không có gì".
 */

/** Bốn sắc độ xanh lá. Ô trống dùng nền chìm, không phải xanh nhạt nhất —
 *  nếu không thì "chưa ghi" và "có ghi một chút" trông gần như nhau. */
const FILL: Record<0 | 1 | 2 | 3, string> = {
  0: "bg-surface-2",
  1: "bg-up/25",
  2: "bg-up/55",
  3: "bg-up",
};

/** Tuần bắt đầu THỨ HAI — thống nhất với period.ts và lịch nhiệt trong /os. */
const WD = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const MONTHS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];

/** Thứ trong tuần theo quy ước THỨ HAI = 0. `getUTCDay()` trả Chủ nhật = 0. */
const dow = (d: Date) => (d.getUTCDay() + 6) % 7;

export function Heatmap({ cells, label }: { cells: HeatCell[]; label: string }) {
  const byIso = useMemo(() => new Map(cells.map((c) => [c.iso, c])), [cells]);

  /**
   * Chỉ những năm THẬT SỰ có dữ liệu mới thành nút.
   *
   * Bày ra một nút năm rồi bấm vào thấy lưới trắng trơn là hứa suông. Chưa có
   * ngày nào thì rơi về năm hiện tại, để lưới vẫn hiện đúng hình hài.
   */
  const years = useMemo(() => {
    const set = new Set(cells.map((c) => Number(c.iso.slice(0, 4))));
    if (set.size === 0) set.add(new Date().getUTCFullYear());
    return [...set].sort((a, b) => b - a);
  }, [cells]);

  const [year, setYear] = useState(years[0]);
  const y = years.includes(year) ? year : years[0];

  const { cols, monthAt, done, total } = useMemo(() => {
    const jan1 = new Date(Date.UTC(y, 0, 1));
    // Lùi về thứ Hai của tuần chứa 1/1 — cột đầu phải là một tuần đầy đủ, nếu
    // không thì hàng "T2" của cột đầu rơi vào năm trước và lệch cả lưới.
    const start = new Date(jan1);
    start.setUTCDate(start.getUTCDate() - dow(jan1));

    const cols: ({ iso: string; level: 0 | 1 | 2 | 3; isToday: boolean; inYear: boolean } | null)[][] = [];
    const monthAt = new Map<number, string>();
    let done = 0;
    let total = 0;

    const cur = new Date(start);
    for (let col = 0; col < 53; col++) {
      const week: (typeof cols)[number] = [];
      for (let row = 0; row < 7; row++) {
        const inYear = cur.getUTCFullYear() === y;
        const iso = cur.toISOString().slice(0, 10);
        if (inYear) {
          total++;
          // Nhãn tháng đặt ở cột chứa ngày mùng 1 — mốc thật, không chia đều.
          if (cur.getUTCDate() === 1) monthAt.set(col, MONTHS[cur.getUTCMonth()]);
          const hit = byIso.get(iso);
          if (hit && hit.level > 0) done++;
          week.push({
            iso,
            level: hit?.level ?? 0,
            isToday: hit?.isToday ?? false,
            inYear: true,
          });
        } else {
          week.push(null); // ngày của năm khác — chừa chỗ nhưng không vẽ
        }
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
      cols.push(week);
    }
    return { cols, monthAt, done, total };
  }, [y, byIso]);

  return (
    <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="tag">
          {label} · {total} ngày
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="tag">
            {done} ngày có hoạt động · {Math.round((done / total) * 100)}%
          </span>

          {/* Nút năm. Một năm thì vẫn hiện — nó là nhãn cho biết đang xem năm
              nào, chứ không chỉ là nút bấm. */}
          <div className="flex items-center gap-1 rounded-full border border-line p-1">
            {years.map((yy) => (
              <button
                key={yy}
                type="button"
                onClick={() => setYear(yy)}
                aria-pressed={yy === y}
                className={`tag rounded-full px-2.5 py-1 tabular-nums transition-colors ${
                  yy === y
                    ? "bg-ink text-bg"
                    : "text-ink-3 hover:text-ink"
                }`}
              >
                {yy}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        {/* Nhãn thứ. Chỉ hiện xen kẽ — bảy nhãn cạnh nhau ở cỡ chữ này thì
            chúng dính vào nhau và không đọc được nhãn nào. */}
        <div className="flex shrink-0 flex-col gap-[3px] pt-[16px]">
          {WD.map((d, i) => (
            <span
              key={d}
              className="tag flex h-[13px] items-center leading-none"
              style={{ visibility: i % 2 === 0 ? "visible" : "hidden" }}
            >
              {d}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-[3px]">
            {cols.map((week, col) => (
              <div key={col} className="flex flex-col gap-[3px]">
                <span className="tag h-[13px] leading-none">
                  {monthAt.get(col) ?? ""}
                </span>
                {week.map((c, row) =>
                  c ? (
                    <span
                      key={c.iso}
                      title={`${c.iso} · ${c.level}/3 việc nền tảng`}
                      className={`size-[13px] rounded-[3px] ${FILL[c.level]} ${
                        c.isToday ? "ring-1 ring-ink" : ""
                      }`}
                    />
                  ) : (
                    <span key={`x${col}-${row}`} className="size-[13px]" />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chú giải: không có nó thì bốn sắc độ chỉ là bốn sắc độ. */}
      <div className="mt-4 flex items-center justify-end gap-1.5">
        <span className="tag">ít</span>
        {([0, 1, 2, 3] as const).map((l) => (
          <span key={l} className={`size-[13px] rounded-[3px] ${FILL[l]}`} />
        ))}
        <span className="tag">nhiều</span>
      </div>
    </div>
  );
}
