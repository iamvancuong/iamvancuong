/**
 * Ngày trong Life OS luôn là NGÀY, không phải thời điểm.
 *
 * Mọi cột `@db.Date` được lưu ở nửa đêm UTC. Thiếu quy ước này là lệch một
 * ngày ngay: ở JST (UTC+9), `new Date("2026-08-04T00:00:00")` quy về UTC
 * thành 2026-08-03T15:00Z.
 */

/** "YYYY-MM-DD" → Date ở nửa đêm UTC. */
export function dayUTC(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

/** Date → "YYYY-MM-DD", đọc bằng getUTC*. */
export function isoUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Hôm nay theo giờ địa phương của người dùng, dạng "YYYY-MM-DD". */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysISO(iso: string, n: number): string {
  const d = dayUTC(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return isoUTC(d);
}

export function daysBetweenISO(a: string, b: string): number {
  return Math.round((dayUTC(b).getTime() - dayUTC(a).getTime()) / 86_400_000);
}

export function fmtDateVN(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const WEEKDAYS = [
  "Chủ nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

export function weekdayVN(iso: string): string {
  return WEEKDAYS[dayUTC(iso).getUTCDay()];
}

/** T2 · T3 … T7 · CN — theo cách viết tắt quen thuộc, không phải cắt chuỗi. */
const WEEKDAYS_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function weekdayShortVN(iso: string): string {
  return WEEKDAYS_SHORT[dayUTC(iso).getUTCDay()];
}

export function fmtH(min: number): string {
  if (min < 60) return `${min}p`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}
