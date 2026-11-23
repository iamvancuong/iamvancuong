import type { Metadata } from "next";
import Link from "next/link";
import type { WorkShift } from "@prisma/client";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import {
  addDaysISO,
  dayUTC,
  fmtDateVN,
  fmtH,
  isoUTC,
  todayISO,
  weekdayShortVN,
} from "@/lib/os/day";
import { mondayISO } from "@/lib/os/period";
import {
  BAITO_LIMIT_MIN,
  WINDOW_DAYS,
  dailyTotals,
  headroom,
  overruns,
  windowLevel,
  windowSum,
} from "@/lib/os/baito";
import { createShift, deleteShift, updateShift } from "@/lib/os/baitoActions";
import {
  ConfirmButton,
  EmptyNote,
  MicroLabel,
  SubmitButton,
  inputSmCls,
} from "@/components/os/formBits";
import { Disclosure } from "@/components/os/Disclosure";
import { BaitoCalendar } from "@/components/os/BaitoCalendar";

export const metadata: Metadata = { title: "Baito" };

/** Số tuần hiện trên lịch: 4 tuần đã qua + tuần này + tuần sau. */
const WEEKS = 6;

const LEVEL_TEXT = {
  ok: "text-ink-3",
  near: "text-amber-600 dark:text-amber-400",
  over: "text-down font-semibold",
} as const;

/**
 * Giờ làm baito và giới hạn 28 giờ / 7 ngày liên tục.
 *
 * Mỗi ô lịch ghi hai số: giờ làm của ngày đó, và «Σ» = tổng 7 ngày KẾT THÚC
 * ở ngày đó. Ô nào Σ quá 28h là một cửa sổ vi phạm — đó là cách luật đếm,
 * không phải tuần T2–CN. Xem `lib/os/baito.ts`.
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

  // Lấy rộng ra 6 ngày hai đầu: Σ của ô đầu lịch cần 6 ngày trước nó, và
  // «còn được làm» của ô cuối cần 6 ngày sau nó. Ca tương lai lấy hết để cảnh
  // báo cả những ca đã xếp lịch xa.
  const shifts = await db.workShift.findMany({
    where: { date: { gte: dayUTC(addDaysISO(first, -(WINDOW_DAYS - 1))) } },
    orderBy: [{ date: "desc" }, { start: "asc" }, { createdAt: "asc" }],
  });

  const totals = dailyTotals(shifts);
  const shiftCount = new Map<string, number>();
  for (const s of shifts) {
    const k = isoUTC(s.date);
    shiftCount.set(k, (shiftCount.get(k) ?? 0) + 1);
  }
  const lastShift = shifts.length ? isoUTC(shifts[0].date) : last;
  const scanEnd = [last, today, addDaysISO(lastShift, WINDOW_DAYS - 1)].sort().at(-1)!;
  const overs = overruns(totals, first, scanEnd);

  const past7 = windowSum(totals, today);
  const roomToday = headroom(totals, today);

  const days: string[] = [];
  for (let d = first; d <= last; d = addDaysISO(d, 1)) days.push(d);
  const weeks = Array.from({ length: WEEKS }, (_, i) => days.slice(i * 7, i * 7 + 7));

  const next7 = Array.from({ length: 7 }, (_, i) => addDaysISO(today, i));

  const inRange = shifts.filter((s) => {
    const d = isoUTC(s.date);
    return d >= first && d <= last;
  });

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
            value={fmtH(past7) === "0p" ? "0h" : fmtH(past7)}
            hint={`trần ${BAITO_LIMIT_MIN / 60}h`}
            level={windowLevel(past7)}
          />
          <Tile
            label="Hôm nay còn được làm"
            value={roomToday === 0 ? "0h" : fmtH(roomToday)}
            hint="đã tính cả ca xếp trong 6 ngày tới"
            level={roomToday === 0 ? "over" : "ok"}
          />
          <Tile
            label="Ca trên lịch này"
            value={String(inRange.length)}
            hint={`${fmtDateVN(first)} → ${fmtDateVN(last)}`}
            level="ok"
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
          weeks={weeks.map((wk) =>
            wk.map((d) => {
              const sum = windowSum(totals, d);
              return {
                iso: d,
                label:
                  d.slice(8) === "01" || d === first
                    ? `${Number(d.slice(8))}/${Number(d.slice(5, 7))}`
                    : String(Number(d.slice(8))),
                min: totals.get(d) ?? 0,
                sum,
                level: windowLevel(sum),
                count: shiftCount.get(d) ?? 0,
                room: headroom(totals, d),
              };
            }),
          )}
        />
        <p className="mt-2 text-[12px] leading-relaxed text-ink-3">
          Bấm ô để nhập giờ. Số to = giờ làm ngày đó. Σ = tổng 7 ngày kết thúc ở ngày đó —{" "}
          <span className={LEVEL_TEXT.near}>vàng từ 24h</span>,{" "}
          <span className={LEVEL_TEXT.over}>đỏ khi quá 28h</span>. Viền đứt =
          ngày chưa tới.
        </p>
      </section>

      <section>
        <h2 className="mb-3">
          <MicroLabel>Thêm ca</MicroLabel>
        </h2>
        <form
          action={createShift}
          className="space-y-2 rounded-[var(--radius-lg)] border border-line p-3"
        >
          <ShiftFields defaultDate={today} />
          <div className="flex justify-end">
            <SubmitButton>Thêm ca</SubmitButton>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-3">
          <MicroLabel>Các ca trên lịch này</MicroLabel>
        </h2>
        {inRange.length === 0 ? (
          <EmptyNote>Chưa có ca nào trong khoảng này.</EmptyNote>
        ) : (
          <ul className="divide-y divide-line-soft rounded-[var(--radius-lg)] border border-line">
            {inRange.map((s) => (
              <ShiftRow key={s.id} s={s} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ShiftRow({ s }: { s: WorkShift }) {
  const d = isoUTC(s.date);
  return (
    <li className="p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <span className="text-[15px] font-medium tabular-nums">
            {weekdayShortVN(d)} {fmtDateVN(d)}
          </span>
          <span className="ml-2 text-[13px] text-ink-3">
            {[
              s.start && s.end ? `${s.start}–${s.end}` : null,
              s.breakMin ? `nghỉ ${s.breakMin}p` : null,
              s.place,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
          {s.note && <p className="mt-1 text-[13px] text-ink-2">{s.note}</p>}
        </div>
        <span className="text-[16px] font-semibold tabular-nums">{fmtH(s.minutes)}</span>
      </div>
      <Disclosure label="Sửa" small>
        <div className="space-y-3 rounded-[var(--radius-lg)] border border-line p-3">
          <form action={updateShift.bind(null, s.id)} className="space-y-2">
            <ShiftFields shift={s} />
            <div className="flex justify-end">
              <SubmitButton>Lưu</SubmitButton>
            </div>
          </form>
          <form action={deleteShift.bind(null, s.id)} className="border-t border-line-soft pt-3">
            <ConfirmButton
              label="Xóa ca này"
              confirm={`Xóa ca ${fmtDateVN(d)} (${fmtH(s.minutes)})?`}
              className="text-[12px] text-ink-3 hover:text-down"
            >
              Xóa ca
            </ConfirmButton>
          </form>
        </div>
      </Disclosure>
    </li>
  );
}

/** Dùng chung cho form thêm và sửa. Có giờ bắt đầu + kết thúc thì bỏ qua ô «số giờ». */
function ShiftFields({ shift, defaultDate }: { shift?: WorkShift; defaultDate?: string }) {
  const hasTimes = !!(shift?.start && shift?.end);
  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label className="col-span-2 sm:col-span-1">
          <span className="text-[12px] text-ink-3">Ngày</span>
          <input
            type="date"
            name="date"
            required
            defaultValue={shift ? isoUTC(shift.date) : defaultDate}
            className={inputSmCls}
          />
        </label>
        <label>
          <span className="text-[12px] text-ink-3">Bắt đầu</span>
          <input type="time" name="start" defaultValue={shift?.start ?? ""} className={inputSmCls} />
        </label>
        <label>
          <span className="text-[12px] text-ink-3">Kết thúc</span>
          <input type="time" name="end" defaultValue={shift?.end ?? ""} className={inputSmCls} />
        </label>
        <label>
          <span className="text-[12px] text-ink-3">Nghỉ (phút)</span>
          <input
            name="breakMin"
            inputMode="numeric"
            defaultValue={shift?.breakMin || ""}
            placeholder="0"
            className={inputSmCls}
          />
        </label>
        <label>
          <span className="text-[12px] text-ink-3">hoặc số giờ</span>
          <input
            name="hours"
            inputMode="decimal"
            defaultValue={shift && !hasTimes ? String(shift.minutes / 60) : ""}
            placeholder="vd 4.5"
            className={inputSmCls}
          />
        </label>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="place"
          defaultValue={shift?.place ?? ""}
          placeholder="Chỗ làm (không bắt buộc)"
          className={inputSmCls}
        />
        <input
          name="note"
          defaultValue={shift?.note ?? ""}
          placeholder="Ghi chú"
          className={inputSmCls}
        />
      </div>
      <p className="text-[12px] text-ink-3">
        Có đủ bắt đầu + kết thúc thì tính từ đó (trừ nghỉ); kết thúc nhỏ hơn bắt
        đầu = ca qua đêm, tính vào ngày bắt đầu. Không thì dùng ô «số giờ».
      </p>
    </>
  );
}

function Tile({
  label,
  value,
  hint,
  level,
}: {
  label: string;
  value: string;
  hint?: string;
  level: "ok" | "near" | "over";
}) {
  return (
    <div className="bg-bg p-4">
      <div className="text-[12px] leading-snug text-ink-3">{label}</div>
      <div
        className={`mt-1.5 text-[22px] font-semibold tabular-nums leading-none ${
          level === "over" ? "text-down" : level === "near" ? LEVEL_TEXT.near : ""
        }`}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-[11px] text-ink-3">{hint}</div>}
    </div>
  );
}
