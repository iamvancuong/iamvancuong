"use client";

import { useRef, useState, useTransition } from "react";
import { setDayHours } from "@/lib/os/baitoActions";
import { fmtDateVN, fmtH, weekdayShortVN } from "@/lib/os/day";

export type BaitoDay = {
  iso: string;
  /** Nhãn ô: "23", hoặc "1/12" ở ngày đầu tháng / ô đầu lịch. */
  label: string;
  min: number;
  /** Tổng 7 ngày kết thúc ở ngày này. */
  sum: number;
  level: "ok" | "near" | "over";
  /** Số ca của ngày — > 1 thì không sửa trong ô được. */
  count: number;
  /** Phút còn thêm được vào ngày này mà không cửa sổ nào vượt 28h. */
  room: number;
};

const LEVEL_TEXT = {
  ok: "text-ink-3",
  near: "text-amber-600 dark:text-amber-400",
  over: "text-down font-semibold",
} as const;

/**
 * Lịch baito — bấm vào ô là gõ số giờ ngay trong ô.
 *
 * Enter = lưu rồi nhảy sang ngày kế tiếp (nhập cả tuần không phải chạm lại),
 * Esc = bỏ, rời ô = lưu. Xóa trống / gõ 0 = xóa ca của ngày đó.
 * Ngày có nhiều ca thì không sửa ở đây: tổng mới không nói được bớt ở ca nào.
 */
export function BaitoCalendar({
  weeks,
  today,
}: {
  weeks: BaitoDay[][];
  today: string;
}) {
  const all = weeks.flat();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  // Ngày ĐANG mở thật sự. Khi Enter nhảy sang ô kế, ô cũ bị gỡ và có thể vẫn
  // bắn `blur` — so với ref này để lần blur muộn đó không lưu nhầm lần hai
  // (ngày trống lưu hai lần là thành hai ca).
  const active = useRef<string | null>(null);

  function open(d: BaitoDay) {
    if (d.count > 1) {
      active.current = null;
      setEditing(null);
      setMsg(`${fmtDateVN(d.iso)} có ${d.count} ca — sửa ở danh sách «Các ca» bên dưới.`);
      return;
    }
    active.current = d.iso;
    setEditing(d.iso);
    setDraft(d.min ? String(Math.round((d.min / 60) * 100) / 100) : "");
    setMsg(null);
  }

  function close() {
    active.current = null;
    setEditing(null);
  }

  function commit(d: BaitoDay, moveNext: boolean) {
    if (active.current !== d.iso) return;
    const next = moveNext ? all[all.findIndex((x) => x.iso === d.iso) + 1] : undefined;
    close();

    const raw = draft.trim().replace(",", ".");
    const h = raw === "" ? 0 : Number(raw);
    if (!Number.isFinite(h) || h < 0 || h > 24) {
      setMsg(`«${draft}» không phải số giờ (0–24).`);
      return;
    }
    if (Math.round(h * 60) !== d.min) {
      setSaving((s) => new Set(s).add(d.iso));
      startTransition(async () => {
        const r = await setDayHours(d.iso, h);
        if (!r.ok) setMsg(r.error ?? "Không lưu được.");
        setSaving((s) => {
          const n = new Set(s);
          n.delete(d.iso);
          return n;
        });
      });
    }
    if (next) open(next);
  }

  const cur = all.find((d) => d.iso === editing);
  const draftMin = Math.round(Number(draft.trim().replace(",", ".") || 0) * 60);
  const maxMin = cur ? cur.min + cur.room : 0;

  return (
    <>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-ink-3">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
          <div key={d} className="pb-1">
            {d}
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {weeks.map((wk) => (
          <div key={wk[0].iso} className="grid grid-cols-7 gap-1">
            {wk.map((d) => {
              const isEditing = editing === d.iso;
              const border =
                d.level === "over"
                  ? "border-down/60 bg-down/5"
                  : isEditing
                    ? "border-accent"
                    : d.iso === today
                      ? "border-ink-3"
                      : "border-line";
              return (
                <div
                  key={d.iso}
                  className={`relative min-h-[62px] rounded-[var(--radius-md)] border px-1 py-1.5 ${border} ${
                    d.iso > today && !isEditing ? "border-dashed" : ""
                  } ${saving.has(d.iso) ? "opacity-50" : ""}`}
                >
                  <div className="text-[11px] text-ink-3">{d.label}</div>
                  {isEditing ? (
                    <input
                      autoFocus
                      onFocus={(e) => e.currentTarget.select()}
                      inputMode="decimal"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commit(d, true);
                        } else if (e.key === "Escape") {
                          close();
                        }
                      }}
                      onBlur={() => commit(d, false)}
                      placeholder="0"
                      aria-label={`Số giờ ngày ${fmtDateVN(d.iso)}`}
                      className="mt-0.5 w-full min-w-0 rounded-[var(--radius-sm)] border border-line bg-bg px-1 py-0.5 text-center text-[16px] font-semibold tabular-nums outline-none focus:border-accent"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => open(d)}
                      aria-label={`${fmtDateVN(d.iso)}: ${d.min ? fmtH(d.min) : "chưa có ca"} — bấm để nhập giờ`}
                      className="absolute inset-0 flex flex-col justify-end rounded-[var(--radius-md)] px-1 pb-1.5 pt-5 text-left hover:bg-surface-2/60"
                    >
                      <span className="text-[14px] font-semibold tabular-nums">
                        {d.min ? fmtH(d.min) : <span className="text-ink-3/50">·</span>}
                      </span>
                      <span className={`text-[10px] tabular-nums ${LEVEL_TEXT[d.level]}`}>
                        {d.sum > 0 ? `Σ${fmtH(d.sum)}` : " "}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <p className="mt-2 min-h-[20px] text-[13px]" aria-live="polite">
        {cur ? (
          <>
            <span className="text-ink-2">
              {weekdayShortVN(cur.iso)} {fmtDateVN(cur.iso)}: tối đa{" "}
              <strong className="text-ink">{fmtH(maxMin) === "0p" ? "0h" : fmtH(maxMin)}</strong>{" "}
              để không lố 28h.
            </span>
            {draftMin > maxMin && (
              <span className="ml-1 font-semibold text-down">
                Nhập {fmtH(draftMin)} là lố {fmtH(draftMin - maxMin)}.
              </span>
            )}
            <span className="ml-1 text-ink-3">Enter lưu + sang ngày sau · Esc bỏ.</span>
          </>
        ) : msg ? (
          <span className="text-down">{msg}</span>
        ) : (
          <span className="text-ink-3">Bấm vào một ô để nhập số giờ (vd 4.5).</span>
        )}
      </p>
    </>
  );
}
