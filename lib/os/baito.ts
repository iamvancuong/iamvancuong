/**
 * Giờ làm baito — giới hạn 資格外活動 28 giờ.
 *
 * Luật: trong BẤT KỲ 7 ngày liên tục nào, tổng giờ làm không quá 28 giờ.
 * Không phải tuần T2–CN: làm 14h vào T6–CN tuần này và 15h vào T2–T4 tuần sau
 * là 29h trong 7 ngày liên tục — hai «tuần lịch» đều trông sạch mà vẫn vượt.
 * Nên ở đây mọi phép tính đều là CỬA SỔ TRƯỢT, mỗi ngày là đuôi của một cửa sổ.
 *
 * File thuần: không chạm database, kiểm ở `scripts/test.ts`.
 */
import { addDaysISO, isoUTC } from "./day";

/** 28 giờ, tính bằng phút. 28h đúng là HỢP LỆ; vượt là từ 28h01. */
export const BAITO_LIMIT_MIN = 28 * 60;
export const WINDOW_DAYS = 7;

type ShiftLike = { date: Date; minutes: number };

/** "HH:MM" → phút từ nửa đêm, sai định dạng → null. Nhận cả "24:00". */
export function parseHM(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (mi > 59 || h > 24 || (h === 24 && mi > 0)) return null;
  return h * 60 + mi;
}

/**
 * Số phút thật của một ca. Kết thúc ≤ bắt đầu = ca qua nửa đêm (22:00 → 06:00
 * là 8h), cả ca tính vào ngày bắt đầu. Nghỉ nhiều hơn ca thì về 0.
 */
export function shiftMinutes(start: string, end: string, breakMin = 0): number | null {
  const a = parseHM(start);
  const b = parseHM(end);
  if (a == null || b == null) return null;
  const span = b > a ? b - a : b + 24 * 60 - a;
  return Math.max(0, span - Math.max(0, breakMin));
}

/** Tổng phút theo ngày: "YYYY-MM-DD" → phút. */
export function dailyTotals(shifts: ShiftLike[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const s of shifts) {
    const k = isoUTC(s.date);
    m.set(k, (m.get(k) ?? 0) + s.minutes);
  }
  return m;
}

/** Tổng 7 ngày KẾT THÚC ở `endISO` (gồm cả ngày đó và 6 ngày trước). */
export function windowSum(totals: Map<string, number>, endISO: string): number {
  let s = 0;
  for (let i = 0; i < WINDOW_DAYS; i++) s += totals.get(addDaysISO(endISO, -i)) ?? 0;
  return s;
}

/**
 * Ngày `iso` còn làm thêm được tối đa bao nhiêu phút mà không cửa sổ nào vượt.
 *
 * Một ngày nằm trong ĐÚNG 7 cửa sổ (kết thúc ở chính nó và 6 ngày sau), nên
 * phải nhìn cả về sau: hôm nay còn 10h trống tính lùi, nhưng nếu đã xếp ca
 * 25h cho 6 ngày tới thì hôm nay chỉ còn 3h. Đã vượt sẵn thì 0.
 */
export function headroom(totals: Map<string, number>, iso: string): number {
  let room = Infinity;
  for (let k = 0; k < WINDOW_DAYS; k++) {
    room = Math.min(room, BAITO_LIMIT_MIN - windowSum(totals, addDaysISO(iso, k)));
  }
  return Math.max(0, room);
}

export type Overrun = {
  /** Ngày đầu / cuối của cửa sổ 7 ngày nặng nhất trong đợt vượt. */
  start: string;
  end: string;
  minutes: number;
  /** Vượt bao nhiêu phút so với 28h. */
  over: number;
};

/**
 * Mọi đợt vượt trong khoảng [fromISO, toISO] (tính theo ngày CUỐI cửa sổ).
 *
 * Một ngày làm nặng làm vượt tới 7 cửa sổ liền nhau — liệt kê cả 7 thì một lỗi
 * hiện thành bảy dòng. Nên gộp các ngày cuối liên tiếp thành MỘT đợt, và báo
 * cửa sổ nặng nhất của đợt đó.
 */
export function overruns(
  totals: Map<string, number>,
  fromISO: string,
  toISO: string,
): Overrun[] {
  const out: Overrun[] = [];
  let cur: Overrun | null = null;
  for (let d = fromISO; d <= toISO; d = addDaysISO(d, 1)) {
    const sum = windowSum(totals, d);
    if (sum > BAITO_LIMIT_MIN) {
      const w = { start: addDaysISO(d, -(WINDOW_DAYS - 1)), end: d, minutes: sum, over: sum - BAITO_LIMIT_MIN };
      if (!cur) cur = w;
      else if (sum > cur.minutes) cur = w;
    } else if (cur) {
      out.push(cur);
      cur = null;
    }
  }
  if (cur) out.push(cur);
  return out;
}

/** Mức của một tổng 7 ngày: ổn · sát (≥ 24h) · vượt. */
export function windowLevel(min: number): "ok" | "near" | "over" {
  if (min > BAITO_LIMIT_MIN) return "over";
  if (min >= 24 * 60) return "near";
  return "ok";
}

/* ------------------------------------------------------------- tiền */

/** Tiền của một ca: phút × lương giờ, làm tròn yên. */
export function payOf(minutes: number, rate: number): number {
  return Math.round((minutes * rate) / 60);
}

export type JobPay = { jobId: string | null; minutes: number; pay: number };

/**
 * Giờ + tiền theo từng việc trong [fromISO, toISO).
 *
 * Lấy lương giờ CHỤP LẠI trên ca (`rate`); ca cũ chưa có thì dùng lương hiện
 * tại của việc. Ca không gán việc vẫn đếm giờ nhưng tiền = 0 — không đoán.
 */
export function payByJob(
  shifts: { date: Date; minutes: number; jobId: string | null; rate: number | null }[],
  jobRates: Map<string, number>,
  fromISO: string,
  toISO: string,
): JobPay[] {
  const by = new Map<string | null, JobPay>();
  for (const s of shifts) {
    const d = isoUTC(s.date);
    if (d < fromISO || d >= toISO) continue;
    const rate = s.rate ?? (s.jobId ? jobRates.get(s.jobId) : undefined) ?? 0;
    const cur = by.get(s.jobId) ?? { jobId: s.jobId, minutes: 0, pay: 0 };
    cur.minutes += s.minutes;
    cur.pay += payOf(s.minutes, rate);
    by.set(s.jobId, cur);
  }
  return [...by.values()];
}

/**
 * Tiền baito theo tháng: "YYYY-MM" → ¥. Đây là THU NHẬP của trang Tiền —
 * nguồn duy nhất, không nhập tay. Tháng không có ca thì không có khóa.
 * Cùng quy tắc lương với `payByJob`: lương chụp trên ca, rồi tới lương hiện tại.
 */
export function payByMonth(
  shifts: { date: Date; minutes: number; jobId: string | null; rate: number | null }[],
  jobRates: Map<string, number>,
): Map<string, number> {
  const m = new Map<string, number>();
  for (const s of shifts) {
    const k = isoUTC(s.date).slice(0, 7);
    const rate = s.rate ?? (s.jobId ? jobRates.get(s.jobId) : undefined) ?? 0;
    m.set(k, (m.get(k) ?? 0) + payOf(s.minutes, rate));
  }
  return m;
}
