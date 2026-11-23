import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { addDaysISO, dayUTC, fmtDateVN, fmtH, isoUTC, todayISO, weekdayShortVN } from "@/lib/os/day";
import { mondayISO, monthStartISO } from "@/lib/os/period";
import {
  BAITO_LIMIT_MIN,
  WINDOW_DAYS,
  dailyTotals,
  headroom,
  overruns,
  payByJob,
  windowLevel,
  windowSum,
} from "@/lib/os/baito";
import { fmtYen, monthLabelVN } from "@/lib/os/money";
import { updateJob } from "@/lib/os/baitoActions";
import { MicroLabel, SubmitButton, inputSmCls } from "@/components/os/formBits";
import { Disclosure } from "@/components/os/Disclosure";
import { BaitoCalendar, type BaitoDay } from "@/components/os/BaitoCalendar";

export const metadata: Metadata = { title: "Baito" };

/** Số tuần hiện trên lịch: 4 tuần đã qua + tuần này + tuần sau. */
const WEEKS = 6;

const NEAR_TEXT = "text-amber-600 dark:text-amber-400";

/** "YYYY-MM-01" của tháng kế tiếp. */
function nextMonthISO(m: string): string {
  const [y, mo] = m.split("-").map(Number);
  return mo === 12 ? `${y + 1}-01-01` : `${y}-${String(mo + 1).padStart(2, "0")}-01`;
}

/**
 * Giờ làm baito: giới hạn 28 giờ / 7 ngày liên tục + tiền theo tháng.
 *
 * Mỗi ô lịch ghi hai số: giờ làm của ngày đó, và «Σ» = tổng 7 ngày KẾT THÚC
 * ở ngày đó. Ô nào Σ quá 28h là một cửa sổ vi phạm — đó là cách luật đếm,
 * không phải tuần T2–CN. Xem `lib/os/baito.ts`.
 *
 * Lịch là chỗ nhập DUY NHẤT (chọn việc → bấm ô → gõ giờ). Không có danh sách
 * ca riêng: nhìn lịch là đủ.
 */
export default async function BaitoPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const { w } = await searchParams;
  // Lùi/tiến theo tuần; kẹp để URL tay không kéo truy vấn đi quá xa.
  const offset = Math.max(-104, Math.min(52, Math.trunc(Number(w) || 0)));

  const today = todayISO();
  const lastMonday = addDaysISO(mondayISO(today), 7 + offset * 7);
  const first = addDaysISO(lastMonday, -(WEEKS - 1) * 7);
  const last = addDaysISO(lastMonday, 6);

  const thisMonth = monthStartISO(today);
  const prevMonth = monthStartISO(addDaysISO(thisMonth, -1));

  // Lấy rộng ra 6 ngày hai đầu (Σ của ô đầu lịch cần 6 ngày trước nó, «còn
  // được làm» của ô cuối cần 6 ngày sau nó), và lùi tới đầu tháng trước để
  // tính tiền. Ca tương lai lấy hết để cảnh báo cả ca đã xếp lịch xa.
  const from = [addDaysISO(first, -(WINDOW_DAYS - 1)), prevMonth].sort()[0];
  const [shifts, jobs] = await Promise.all([
    db.workShift.findMany({
      where: { date: { gte: dayUTC(from) } },
      orderBy: [{ date: "desc" }, { createdAt: "asc" }],
    }),
    db.baitoJob.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
  ]);

  const totals = dailyTotals(shifts);
  const lastShift = shifts.length ? isoUTC(shifts[0].date) : last;
  const scanEnd = [last, today, addDaysISO(lastShift, WINDOW_DAYS - 1)].sort().at(-1)!;
  const overs = overruns(totals, first, scanEnd);

  const past7 = windowSum(totals, today);
  // Hai việc gộp chung một trần 28h — nên ô tổng phải nói rõ mỗi việc góp bao nhiêu.
  const past7ByJob = payByJob(shifts, new Map(), addDaysISO(today, -(WINDOW_DAYS - 1)), addDaysISO(today, 1));
  const roomToday = headroom(totals, today);

  // Phút theo (ngày, việc) + việc nào có > 1 ca trong ngày.
  const perDay = new Map<string, { byJob: Record<string, number>; unassigned: number; cnt: Record<string, number> }>();
  for (const s of shifts) {
    const k = isoUTC(s.date);
    const e = perDay.get(k) ?? { byJob: {}, unassigned: 0, cnt: {} };
    if (s.jobId) {
      e.byJob[s.jobId] = (e.byJob[s.jobId] ?? 0) + s.minutes;
      e.cnt[s.jobId] = (e.cnt[s.jobId] ?? 0) + 1;
    } else {
      e.unassigned += s.minutes;
    }
    perDay.set(k, e);
  }

  const days: string[] = [];
  for (let d = first; d <= last; d = addDaysISO(d, 1)) days.push(d);
  const weeks: BaitoDay[][] = Array.from({ length: WEEKS }, (_, i) =>
    days.slice(i * 7, i * 7 + 7).map((d) => {
      const e = perDay.get(d);
      const sum = windowSum(totals, d);
      return {
        iso: d,
        label:
          d.slice(8) === "01" || d === first
            ? `${Number(d.slice(8))}/${Number(d.slice(5, 7))}`
            : String(Number(d.slice(8))),
        min: totals.get(d) ?? 0,
        byJob: e?.byJob ?? {},
        unassigned: e?.unassigned ?? 0,
        multi: e ? Object.keys(e.cnt).filter((j) => e.cnt[j] > 1) : [],
        sum,
        level: windowLevel(sum),
        room: headroom(totals, d),
      };
    }),
  );

  const next7 = Array.from({ length: 7 }, (_, i) => addDaysISO(today, i));

  const rates = new Map(jobs.map((j) => [j.id, j.rate]));
  const months = [thisMonth, prevMonth].map((m) => {
    const rows = payByJob(shifts, rates, m, nextMonthISO(m));
    return {
      month: m,
      rows,
      minutes: rows.reduce((s, r) => s + r.minutes, 0),
      pay: rows.reduce((s, r) => s + r.pay, 0),
    };
  });
  const jobName = (id: string | null) =>
    id ? (jobs.find((j) => j.id === id)?.name ?? "?") : "Chưa gán việc";

  return (
    <div className="max-w-[820px] space-y-10">
      <header className="border-b border-line pb-5">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Baito</h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">
          Giới hạn 資格外活動: tổng giờ làm trong <strong>bất kỳ 7 ngày liên
          tục nào</strong> không quá 28 giờ — không phải tuần T2–CN. Ghi cả ca
          đã xếp lịch để biết trước tuần nào sắp lố.
        </p>
      </header>

      {overs.length > 0 && (
        <section
          role="alert"
          className="rounded-[var(--radius-lg)] border border-down/40 bg-down/5 p-4"
        >
          <div className="flex items-center gap-2 text-[15px] font-semibold text-down">
            <AlertTriangle size={18} strokeWidth={2} />
            Lố 28 giờ ở {overs.length} đợt
          </div>
          <ul className="mt-2 space-y-1 text-[14px] text-ink-2">
            {overs.map((o) => (
              <li key={o.end}>
                <span className="tabular-nums">
                  {fmtDateVN(o.start)} → {fmtDateVN(o.end)}
                </span>
                : <strong className="text-ink">{fmtH(o.minutes)}</strong>{" "}
                <span className="text-down">(vượt {fmtH(o.over)})</span>
                {o.end > today && <span className="text-ink-3"> · lịch sắp tới</span>}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12px] text-ink-3">
            Mỗi dòng là cửa sổ 7 ngày nặng nhất của một đợt. Bớt ca trong khoảng
            đó tới khi dòng này biến mất.
          </p>
        </section>
      )}

      <section>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-3">
          <Tile
            label="7 ngày tính đến hôm nay"
            value={past7 ? fmtH(past7) : "0h"}
            hint={
              [
                ...past7ByJob.map((r) => `${jobName(r.jobId)} ${fmtH(r.minutes)}`),
                `trần ${BAITO_LIMIT_MIN / 60}h`,
              ].join(" · ")
            }
            tone={windowLevel(past7)}
          />
          <Tile
            label="Hôm nay còn được làm"
            value={roomToday ? fmtH(roomToday) : "0h"}
            hint="đã tính cả ca xếp trong 6 ngày tới"
            tone={roomToday === 0 ? "over" : "ok"}
          />
          <Tile
            label={`Tiền ${monthLabelVN(thisMonth)}`}
            value={`${fmtYen(months[0].pay)}¥`}
            hint={`${months[0].minutes ? fmtH(months[0].minutes) : "0h"} · gồm cả ca đã xếp`}
            tone="ok"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-1">
          <MicroLabel>Còn được làm — 7 ngày tới</MicroLabel>
        </h2>
        <p className="mb-3 text-[13px] text-ink-3">
          Số giờ tối đa xếp thêm vào từng ngày mà không cửa sổ 7 ngày nào vượt
          28h. Mỗi ngày tính riêng — xếp ca vào một ngày thì các ngày quanh nó
          giảm theo.
        </p>
        <div className="grid grid-cols-7 gap-1">
          {next7.map((d) => {
            const room = headroom(totals, d);
            return (
              <div
                key={d}
                className={`rounded-[var(--radius-md)] border px-1 py-2 text-center ${
                  d === today ? "border-ink-3" : "border-line"
                }`}
              >
                <div className="text-[11px] text-ink-3">
                  {weekdayShortVN(d)} {Number(d.slice(8))}
                </div>
                <div
                  className={`mt-0.5 text-[15px] font-semibold tabular-nums ${
                    room === 0 ? "text-down" : ""
                  }`}
                >
                  {room === 0 ? "0" : fmtH(room)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2>
            <MicroLabel>Lịch</MicroLabel>
          </h2>
          <nav className="flex items-center gap-1 text-[13px]">
            <Link
              href={`/os/baito?w=${offset - WEEKS}`}
              aria-label="Lùi"
              className="rounded-[var(--radius-sm)] p-1 text-ink-3 hover:bg-surface-2 hover:text-ink"
            >
              <ChevronLeft size={16} />
            </Link>
            {offset !== 0 && (
              <Link href="/os/baito" className="px-1 text-accent">
                hôm nay
              </Link>
            )}
            <Link
              href={`/os/baito?w=${offset + WEEKS}`}
              aria-label="Tiến"
              className="rounded-[var(--radius-sm)] p-1 text-ink-3 hover:bg-surface-2 hover:text-ink"
            >
              <ChevronRight size={16} />
            </Link>
          </nav>
        </div>

        <BaitoCalendar
          today={today}
          weeks={weeks}
          jobs={jobs.map((j) => ({ id: j.id, name: j.name, rate: j.rate }))}
        />
        <p className="mt-1 text-[12px] leading-relaxed text-ink-3">
          Dòng màu = giờ từng việc, số đậm = tổng cả hai việc (trần 28h tính trên số này). Σ = tổng 7
          ngày kết thúc ở ngày đó — <span className={NEAR_TEXT}>vàng từ 24h</span>,{" "}
          <span className="font-semibold text-down">đỏ khi quá 28h</span>. Viền
          đứt = ngày chưa tới. Dòng dưới mỗi tuần là tổng T2–CN để nhìn tổng quan —
          luật vẫn tính theo Σ (7 ngày liên tục bất kỳ).
        </p>
      </section>

      <section>
        <h2 className="mb-3">
          <MicroLabel>Tiền theo tháng</MicroLabel>
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {months.map((m) => (
            <div key={m.month} className="rounded-[var(--radius-lg)] border border-line p-3">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[14px] font-medium">{monthLabelVN(m.month)}</span>
                <span className="text-[18px] font-semibold tabular-nums">{fmtYen(m.pay)}¥</span>
              </div>
              {m.rows.length === 0 ? (
                <p className="text-[13px] text-ink-3">Chưa có ca.</p>
              ) : (
                <ul className="space-y-1 text-[13px]">
                  {m.rows.map((r) => (
                    <li key={r.jobId ?? "none"} className="flex justify-between gap-2 tabular-nums">
                      <span className="text-ink-2">
                        {jobName(r.jobId)} · {fmtH(r.minutes)}
                      </span>
                      <span>{fmtYen(r.pay)}¥</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-3">
          Giờ × lương giờ, chưa trừ thuế/bảo hiểm, chưa tính phụ cấp đêm hay
          tiền tàu. Tính theo tháng lịch — nếu chỗ làm chốt lương ngày khác (締め日)
          thì số này lệch với phiếu lương.
        </p>

        <Disclosure label="Sửa tên việc / lương giờ" small>
          <div className="space-y-2 rounded-[var(--radius-lg)] border border-line p-3">
            {jobs.map((j) => (
              <form key={j.id} action={updateJob.bind(null, j.id)} className="flex flex-wrap gap-2">
                <input
                  name="name"
                  required
                  defaultValue={j.name}
                  aria-label="Tên việc"
                  className={`${inputSmCls} min-w-[140px] flex-1`}
                />
                <input
                  name="rate"
                  required
                  inputMode="numeric"
                  defaultValue={j.rate}
                  aria-label="Lương giờ ¥"
                  className={`${inputSmCls} !w-[110px]`}
                />
                <SubmitButton>Lưu</SubmitButton>
              </form>
            ))}
            <p className="text-[12px] text-ink-3">
              Đổi lương giờ chỉ áp cho ca nhập/sửa từ giờ trở đi — tiền các ca
              đã lưu giữ nguyên lương lúc đó.
            </p>
          </div>
        </Disclosure>
      </section>
    </div>
  );
}

function Tile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: "ok" | "near" | "over";
}) {
  return (
    <div className="bg-bg p-4">
      <div className="text-[12px] leading-snug text-ink-3">{label}</div>
      <div
        className={`mt-1.5 text-[22px] font-semibold tabular-nums leading-none ${
          tone === "over" ? "text-down" : tone === "near" ? NEAR_TEXT : ""
        }`}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-[11px] text-ink-3">{hint}</div>}
    </div>
  );
}
