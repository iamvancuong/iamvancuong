"use client";

import { useRef, useState, useTransition } from "react";
import { setDayHours } from "@/lib/os/baitoActions";
import { fmtDateVN, fmtH, weekdayShortVN } from "@/lib/os/day";

export type BaitoJobLite = { id: string; name: string; rate: number };

export type BaitoDay = {
  iso: string;
  /** Nhãn ô: "23", hoặc "1/12" ở ngày đầu tháng / ô đầu lịch. */
  label: string;
  /** Tổng phút mọi việc. */
  min: number;
  /** Phút theo từng việc. */
  byJob: Record<string, number>;
  /** Phút của ca cũ chưa gán việc — gộp vào việc đang chọn khi lưu. */
  unassigned: number;
  /** Việc có > 1 ca trong ngày (dữ liệu cũ) — không sửa trong ô được. */
  multi: string[];
  /** Tổng 7 ngày kết thúc ở ngày này. */
  sum: number;
  level: "ok" | "near" | "over";
  /** Phút còn thêm được vào ngày này mà không cửa sổ nào vượt 28h. */
  room: number;
};

const LEVEL_TEXT = {
  ok: "text-ink-3",
  near: "text-amber-600 dark:text-amber-400",
  over: "text-down font-semibold",
} as const;

/** Màu chấm của từng việc, theo thứ tự. */
const JOB_DOT = ["bg-accent", "bg-amber-500", "bg-up", "bg-ink-3"];

/** Cùng cách viết với `fmtYen` (money.ts) — không import file đó vào client vì nó kéo theo @prisma/client. */
const yen = (n: number) => n.toLocaleString("vi-VN");
const hNum = (min: number) => String(Math.round((min / 60) * 100) / 100);

/**
 * Lịch baito — chọn việc ở hàng chip, rồi bấm ô và gõ số giờ của việc đó.
 *
 * Giống hàng pomodoro: chọn TRƯỚC rồi bấm. Nhập cả tuần giao báo thì chọn
 * «Giao báo» một lần rồi Enter–Enter qua từng ngày.
 * Enter = lưu + sang ngày sau · Esc = bỏ · rời ô = lưu · trống/0 = xóa.
 */
export function BaitoCalendar({
  weeks,
  today,
  jobs,
}: {
  weeks: BaitoDay[][];
  today: string;
  jobs: BaitoJobLite[];
}) {
  const all = weeks.flat();
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  // Ngày ĐANG mở thật sự. Khi Enter nhảy sang ô kế, ô cũ bị gỡ và có thể vẫn
  // bắn `blur` — so với ref này để lần blur muộn đó không lưu nhầm lần hai
  // (ngày trống lưu hai lần là thành hai ca).
  const active = useRef<string | null>(null);

  const job = jobs.find((j) => j.id === jobId);
  const jobMin = (d: BaitoDay) => (d.byJob[jobId] ?? 0) + d.unassigned;

  function open(d: BaitoDay) {
    if (!job) return;
    if (d.multi.includes(jobId)) {
      active.current = null;
      setEditing(null);
      setMsg(`${fmtDateVN(d.iso)} có nhiều ca «${job.name}» — không sửa trong ô được.`);
      return;
    }
    active.current = d.iso;
    setEditing(d.iso);
    const m = jobMin(d);
    setDraft(m ? hNum(m) : "");
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
    // Có ca chưa gán việc thì luôn lưu, để gộp chúng vào việc đang chọn.
    if (Math.round(h * 60) !== jobMin(d) || d.unassigned > 0) {
      const id = jobId;
      setSaving((s) => new Set(s).add(d.iso));
      startTransition(async () => {
        const r = await setDayHours(d.iso, id, h);
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
  const draftMin = Math.round(Number(draft.trim().replace(",", ".") || 0) * 60) || 0;
  const maxMin = cur ? jobMin(cur) + cur.room : 0;

  if (jobs.length === 0) {
    return <p className="text-[14px] text-ink-3">Chưa có việc nào — chạy file SQL tạo việc trước.</p>;
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Nhập giờ cho việc">
        {jobs.map((j, i) => {
          const on = j.id === jobId;
          return (
            <button
              key={j.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => {
                close();
                setJobId(j.id);
              }}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[14px] transition-colors ${
                on ? "border-ink bg-ink text-bg" : "border-line text-ink-2 hover:border-ink-3"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${JOB_DOT[i % JOB_DOT.length]}`} />
              {j.name}
              <span className={on ? "opacity-70" : "text-ink-3"}>{yen(j.rate)}¥/h</span>
            </button>
          );
        })}
      </div>

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
                  className={`relative min-h-[66px] rounded-[var(--radius-md)] border px-1 py-1.5 ${border} ${
                    d.iso > today && !isEditing ? "border-dashed" : ""
                  } ${saving.has(d.iso) ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center justify-between gap-0.5 text-[11px] text-ink-3">
                    <span>{d.label}</span>
                    <span className="flex gap-0.5">
                      {jobs.map((j, i) =>
                        d.byJob[j.id] ? (
                          <span
                            key={j.id}
                            className={`h-1.5 w-1.5 rounded-full ${JOB_DOT[i % JOB_DOT.length]}`}
                          />
                        ) : null,
                      )}
                    </span>
                  </div>
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
                      aria-label={`Số giờ ${job?.name} ngày ${fmtDateVN(d.iso)}`}
                      className="mt-0.5 w-full min-w-0 rounded-[var(--radius-sm)] border border-line bg-bg px-1 py-0.5 text-center text-[16px] font-semibold tabular-nums outline-none focus:border-accent"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => open(d)}
                      aria-label={`${fmtDateVN(d.iso)}: ${d.min ? fmtH(d.min) : "chưa có ca"} — bấm để nhập giờ ${job?.name}`}
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

      <p className="mt-2 min-h-[40px] text-[13px] leading-relaxed" aria-live="polite">
        {cur && job ? (
          <>
            <span className="text-ink-2">
              {weekdayShortVN(cur.iso)} {fmtDateVN(cur.iso)} · <strong className="text-ink">{job.name}</strong>
              {draftMin > 0 && <> ≈ {yen(Math.round((draftMin * job.rate) / 60))}¥</>}
              {" · "}tối đa <strong className="text-ink">{maxMin ? fmtH(maxMin) : "0h"}</strong> để không lố 28h.
            </span>
            {draftMin > maxMin && (
              <span className="ml-1 font-semibold text-down">
                Nhập {fmtH(draftMin)} là lố {fmtH(draftMin - maxMin)}.
              </span>
            )}
            {jobs
              .filter((j) => j.id !== jobId && cur.byJob[j.id])
              .map((j) => (
                <span key={j.id} className="ml-1 text-ink-3">
                  ({j.name} ngày này: {fmtH(cur.byJob[j.id])})
                </span>
              ))}
            {cur.unassigned > 0 && (
              <span className="ml-1 text-ink-3">
                Gồm {fmtH(cur.unassigned)} ca cũ chưa gán việc — lưu sẽ gán vào {job.name}.
              </span>
            )}
            <span className="ml-1 text-ink-3">Enter lưu + sang ngày sau · Esc bỏ.</span>
          </>
        ) : msg ? (
          <span className="text-down">{msg}</span>
        ) : (
          <span className="text-ink-3">
            Chọn việc ở trên, rồi bấm vào ô để nhập số giờ của việc đó (vd 4.5).
          </span>
        )}
      </p>
    </>
  );
}
