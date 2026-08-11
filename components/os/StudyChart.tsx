"use client";

import { useState } from "react";
import type { Bucket } from "@/lib/os/japanese";
import { fmtDateVN, fmtH } from "@/lib/os/day";

/**
 * Biểu đồ cột giờ học. Tự vẽ bằng div, không cài thư viện — cùng lý do với
 * `Sparkline.tsx` (PLAN §3): dự án có 0 dependency giao diện, mà thứ cần ở đây
 * là mấy chục cột có chiều cao tỉ lệ.
 *
 * Hai tầm nhìn vì hai câu hỏi khác nhau:
 *   30 ngày  — mấy hôm nay tôi có đều không, hôm nào rơi?
 *   12 tháng — nhìn cả năm thì tôi đang lên hay xuống?
 */

const VIEWS = [
  { key: "d30", label: "30 ngày" },
  { key: "m12", label: "12 tháng" },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

export function StudyChart({
  daily,
  monthly,
}: {
  daily: Bucket[];
  monthly: Bucket[];
}) {
  const [view, setView] = useState<ViewKey>("d30");
  const rows = view === "d30" ? daily : monthly;

  // Trần của trục: cao nhất trong khoảng, nhưng không thấp hơn đích ngày —
  // nếu không thì một tuần nghỉ sẽ làm cột 1 hiệp trông cao như ngày 7 hiệp.
  const peak = Math.max(1, ...rows.map((r) => Math.max(r.min, r.target)));
  const total = rows.reduce((s, r) => s + r.min, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
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
        <span className="text-[12px] tabular-nums text-ink-3">
          tổng {fmtH(total)}
        </span>
      </div>

      <div className="mt-3 flex h-24 items-end gap-[3px]">
        {rows.map((r) => {
          const h = Math.round((r.min / peak) * 100);
          const hit = r.target > 0 && r.min >= r.target;

          return (
            <div
              key={r.key}
              title={
                view === "d30"
                  ? `${fmtDateVN(r.key)} — ${fmtH(r.min)}${
                      r.target > 0 ? ` / đích ${fmtH(r.target)}` : ""
                    }`
                  : `${r.key} — ${fmtH(r.min)}`
              }
              className="relative flex h-full flex-1 items-end"
            >
              {/* Vạch đích của ngày đó. Cột chạm vạch = hôm đó đủ nhịp. */}
              {r.target > 0 && (
                <div
                  className="absolute inset-x-0 border-t border-dashed border-ink-3/50"
                  style={{ bottom: `${(r.target / peak) * 100}%` }}
                />
              )}
              <div
                className={`w-full rounded-[2px] ${
                  r.min === 0
                    ? "bg-surface-2"
                    : hit
                      ? "bg-ink"
                      : "bg-ink/45"
                }`}
                style={{ height: r.min === 0 ? "2px" : `${Math.max(4, h)}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-1.5 flex justify-between text-[10px] text-ink-3">
        <span>{rows[0]?.label}</span>
        <span>{rows[rows.length - 1]?.label}</span>
      </div>
    </div>
  );
}
