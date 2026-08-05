import { Horizon } from "@prisma/client";
import { addDaysISO, dayUTC, fmtDateVN, isoUTC, todayISO } from "./day";

/**
 * Kỳ của một cam kết — tuần hoặc tháng.
 *
 * Tuần bắt đầu từ **Thứ Hai**, thống nhất với lịch nhiệt ở Streak.tsx. Đây là
 * quy ước phải nhất quán toàn hệ thống: lệch một ngày là cam kết rơi nhầm tuần
 * và mọi thống kê sau đó sai theo.
 *
 * Mọi thứ ở đây đi qua dayUTC/isoUTC nên luôn nằm ở nửa đêm UTC, giống mọi
 * cột @db.Date khác (xem lib/os/day.ts).
 */

export const PERIOD_HORIZONS = [Horizon.WEEK, Horizon.MONTH] as const;

/** Cam kết có kỳ (tuần/tháng) hay mốc dài hạn? */
export function isPeriod(h: Horizon): boolean {
  return h === Horizon.WEEK || h === Horizon.MONTH;
}

/** Thứ Hai của tuần chứa `iso`. */
export function mondayISO(iso: string): string {
  const dow = dayUTC(iso).getUTCDay(); // 0 = Chủ nhật
  return addDaysISO(iso, -((dow + 6) % 7));
}

/** Ngày 1 của tháng chứa `iso`. */
export function monthStartISO(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

/** Ngày đầu kỳ tương ứng với `horizon`, tính từ một ngày bất kỳ trong kỳ. */
export function periodStartISO(horizon: Horizon, iso: string): string {
  return horizon === Horizon.WEEK ? mondayISO(iso) : monthStartISO(iso);
}

/** Ngày cuối kỳ (bao gồm). */
export function periodEndISO(horizon: Horizon, startISO: string): string {
  if (horizon === Horizon.WEEK) return addDaysISO(startISO, 6);

  const d = dayUTC(startISO);
  // Ngày 0 của tháng sau = ngày cuối của tháng này
  return isoUTC(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)));
}

/** Mọi ngày trong kỳ, cũ → mới. */
export function periodDays(horizon: Horizon, startISO: string): string[] {
  const end = periodEndISO(horizon, startISO);
  const out: string[] = [];
  for (let d = startISO; d <= end; d = addDaysISO(d, 1)) out.push(d);
  return out;
}

export type PeriodState = "past" | "current" | "future";

export function periodState(
  horizon: Horizon,
  startISO: string,
  today = todayISO(),
): PeriodState {
  if (today < startISO) return "future";
  return today > periodEndISO(horizon, startISO) ? "past" : "current";
}

/** "Tuần 03/08 – 09/08" · "Tháng 8, 2026" */
export function periodLabel(horizon: Horizon, startISO: string): string {
  if (horizon === Horizon.MONTH) {
    const [y, m] = startISO.split("-");
    return `Tháng ${Number(m)}, ${y}`;
  }
  const end = periodEndISO(horizon, startISO);
  const short = (iso: string) => iso.slice(8) + "/" + iso.slice(5, 7);
  return `Tuần ${short(startISO)} – ${short(end)}`;
}

/**
 * "còn 3 ngày" · "hôm nay là ngày cuối" · "đã xong 2 ngày trước".
 * Nói bằng ngày chứ không bằng ngày tháng — đọc lướt là biết còn gấp không.
 */
export function periodCountdown(
  horizon: Horizon,
  startISO: string,
  today = todayISO(),
): string {
  const state = periodState(horizon, startISO, today);

  if (state === "future") {
    const days = Math.round(
      (dayUTC(startISO).getTime() - dayUTC(today).getTime()) / 86_400_000,
    );
    return days === 1 ? "bắt đầu ngày mai" : `bắt đầu sau ${days} ngày`;
  }

  const end = periodEndISO(horizon, startISO);

  if (state === "past") {
    const days = Math.round(
      (dayUTC(today).getTime() - dayUTC(end).getTime()) / 86_400_000,
    );
    return days === 1 ? "kết thúc hôm qua" : `kết thúc ${days} ngày trước`;
  }

  const left = Math.round(
    (dayUTC(end).getTime() - dayUTC(today).getTime()) / 86_400_000,
  );
  if (left === 0) return "hôm nay là ngày cuối";
  return left === 1 ? "còn 1 ngày" : `còn ${left} ngày`;
}

/** Kỳ hiện tại, để đặt mặc định cho form. */
export function currentPeriodStart(horizon: Horizon, today = todayISO()): string {
  return periodStartISO(horizon, today);
}

/** Đầu kỳ kế tiếp — dùng khi chép một cam kết sang tuần/tháng sau. */
export function nextPeriodStartISO(horizon: Horizon, startISO: string): string {
  return addDaysISO(periodEndISO(horizon, startISO), 1);
}

/** Đầu kỳ liền trước. */
export function prevPeriodStartISO(horizon: Horizon, startISO: string): string {
  return periodStartISO(horizon, addDaysISO(startISO, -1));
}

/** Nhãn dài dùng ở đầu trang lịch. */
export function periodRangeText(horizon: Horizon, startISO: string): string {
  return `${fmtDateVN(startISO)} – ${fmtDateVN(periodEndISO(horizon, startISO))}`;
}
