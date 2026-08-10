"use client";

import { useState } from "react";
import type { DailyLog } from "@prisma/client";
import { Flame } from "lucide-react";
import { recentLevels } from "@/lib/os/stats";
import { dayUTC, fmtDateVN, weekdayShortVN } from "@/lib/os/day";

/**
 * Chuỗi ngày làm đủ ba việc nền tảng.
 *
 * Tô đậm nhạt theo số việc làm được (0–3) chứ không phải xong/chưa xong.
 * Ngày làm 2/3 vẫn hơn ngày bỏ trắng, và nhìn thấy điều đó thì đỡ nản hơn
 * là một ô đỏ.
 *
 * Ba tầm nhìn vì ba câu hỏi khác nhau:
 *   14 ngày — tôi có đang đều không?
 *   3 tháng — tháng này có khá hơn tháng trước không?
 *   1 năm   — nhìn tổng thể thì năm nay tôi sống thế nào?
 */

const FILL: Record<0 | 1 | 2 | 3, string> = {
  0: "bg-surface-2",
  1: "bg-ink/20",
  2: "bg-ink/55",
  3: "bg-ink",
};

const VIEWS = [
  { key: "d14", label: "14 ngày", days: 14 },
  { key: "m3", label: "3 tháng", days: 91 },
  { key: "y1", label: "1 năm", days: 364 },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

export function Streak({
  logs,
  stats,
}: {
  logs: DailyLog[];
  stats: {
    current: number;
    best: number;
    month: { full: number; elapsed: number };
    year: { full: number; elapsed: number };
  };
}) {
  const [view, setView] = useState<ViewKey>("d14");

  // Tính ở SERVER (giờ JST cố định), truyền xuống — không phụ thuộc múi giờ máy.
  const { current, best, month, year } = stats;

  const days = VIEWS.find((v) => v.key === view)!.days;

  return (
    <section className="rounded-[var(--radius-lg)] border border-line p-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
            <Flame
              size={13}
              strokeWidth={2}
              className={current > 0 ? "text-ink" : ""}
            />
            Chuỗi hiện tại
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-[34px] font-semibold leading-none tabular-nums tracking-[-0.03em]">
              {current}
            </span>
            <span className="text-[14px] text-ink-2">ngày</span>
          </div>
        </div>

        <div className="flex gap-5 text-right">
          <Stat label="Dài nhất" value={`${best} ngày`} />
          <Stat
            label="Tháng này"
            value={`${month.full}/${month.elapsed}`}
            hint={pct(month.full, month.elapsed)}
          />
          <Stat
            label="Năm nay"
            value={`${year.full}`}
            hint={pct(year.full, year.elapsed)}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-1">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setView(v.key)}
            aria-pressed={v.key === view}
            className={`rounded-[var(--radius-sm)] px-2.5 py-1 text-[12px] transition-colors ${
              v.key === view
                ? "bg-ink text-bg"
                : "text-ink-2 hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        {view === "d14" ? (
          <Strip logs={logs} days={days} />
        ) : (
          <Heatmap logs={logs} days={days} />
        )}
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-ink-3">
        {current === 0 && best === 0
          ? "Chưa có ngày nào đủ ba việc. Bắt đầu tối nay là được."
          : current === 0
            ? `Chuỗi đang đứt. Không sao — làm lại từ hôm nay, kỷ lục cũ là ${best} ngày.`
            : "Ô càng đậm là ngày làm được càng nhiều. Bỏ một ngày là bình thường; bỏ hai ngày liên tiếp thì hạ ngưỡng xuống."}
      </p>
    </section>
  );
}

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "");

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="text-[12px] text-ink-3">{label}</div>
      <div className="text-[16px] font-medium tabular-nums">{value}</div>
      {hint && <div className="text-[11px] text-ink-3">{hint}</div>}
    </div>
  );
}

/** Dải ngang có nhãn thứ — đọc được từng ngày một. */
function Strip({ logs, days }: { logs: DailyLog[]; days: number }) {
  const cells = recentLevels(logs, days);

  return (
    <div className="flex gap-[3px]">
      {cells.map((c) => (
        <div key={c.iso} className="flex flex-1 flex-col items-center gap-1">
          <div
            title={`${fmtDateVN(c.iso)} — ${c.level}/3 việc nền tảng`}
            className={`h-7 w-full rounded-[3px] ${FILL[c.level]} ${
              c.isToday ? "ring-1 ring-ink ring-offset-1 ring-offset-bg" : ""
            }`}
          />
          <span className="text-[10px] leading-none text-ink-3">
            {weekdayShortVN(c.iso)}
          </span>
        </div>
      ))}
    </div>
  );
}

const MONTHS_VN = [
  "Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
  "Th7", "Th8", "Th9", "Th10", "Th11", "Th12",
];

/**
 * Lịch nhiệt: mỗi cột một tuần (bắt đầu từ Thứ Hai), mỗi hàng một thứ.
 * Cuộn ngang trên màn hình hẹp thay vì bóp nhỏ đến mức không nhìn được.
 */
function Heatmap({ logs, days }: { logs: DailyLog[]; days: number }) {
  const cells = recentLevels(logs, days);

  // Đệm đầu cho ô đầu tiên rơi đúng Thứ Hai
  const firstDow = dayUTC(cells[0].iso).getUTCDay(); // 0 = CN
  const pad = (firstDow + 6) % 7; // T2 -> 0, CN -> 6

  const weeks: (typeof cells[number] | null)[][] = [];
  const flat: (typeof cells[number] | null)[] = [
    ...Array<null>(pad).fill(null),
    ...cells,
  ];
  for (let i = 0; i < flat.length; i += 7) weeks.push(flat.slice(i, i + 7));

  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-block min-w-full">
        <div className="mb-1 flex gap-[3px]">
          {weeks.map((w, i) => {
            const first = w.find(Boolean);
            const prevFirst = i > 0 ? weeks[i - 1].find(Boolean) : null;
            const month = first ? first.iso.slice(5, 7) : null;
            const prevMonth = prevFirst ? prevFirst.iso.slice(5, 7) : null;
            const show = month && month !== prevMonth;

            return (
              <div key={i} className="w-[11px] shrink-0">
                {show && (
                  <span className="block text-[9px] leading-none text-ink-3">
                    {MONTHS_VN[Number(month) - 1]}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-[3px]">
          {weeks.map((w, i) => (
            <div key={i} className="flex w-[11px] shrink-0 flex-col gap-[3px]">
              {w.map((c, j) =>
                c ? (
                  <div
                    key={c.iso}
                    title={`${fmtDateVN(c.iso)} — ${c.level}/3 việc nền tảng`}
                    className={`size-[11px] rounded-[2px] ${FILL[c.level]} ${
                      c.isToday ? "ring-1 ring-ink ring-offset-1 ring-offset-bg" : ""
                    }`}
                  />
                ) : (
                  <div key={`pad-${j}`} className="size-[11px]" />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
