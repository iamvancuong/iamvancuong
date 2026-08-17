import type { DailyLog } from "@prisma/client";
import { addDaysISO, isoUTC, todayISO } from "./day";
import { jpTotal } from "./japanese";

/**
 * Mọi con số trên Dashboard tính ra từ đây — không nhập tay.
 * Trước đây file này đọc localStorage; giờ nhận thẳng bản ghi từ MySQL.
 */

export type Trend = "up" | "flat" | "down";

export type WeekStats = {
  jpMin: number;
  itMin: number;
  webMin: number;
  workouts: number;
  daysLogged: number;
  keystoneDays: number;
  spend: number;
};

const indexByDay = (logs: DailyLog[]) =>
  new Map(logs.map((l) => [isoUTC(l.date), l]));

/** 7 ngày kết thúc hôm nay; offset = 1 là tuần trước đó. */
export function weekDates(offset = 0, end = todayISO()): string[] {
  const last = addDaysISO(end, -7 * offset);
  return Array.from({ length: 7 }, (_, i) => addDaysISO(last, -(6 - i)));
}

/**
 * `end` nhận vào được để kiểm được — cùng khuôn với `weekDates(offset, end)`
 * và `periodStats(logs, scope, today)`. Trước đây nó tự gọi `todayISO()` bên
 * trong, nên phép kiểm dùng ngày ghim cứng chạy được đúng một tuần rồi hỏng,
 * và triệu chứng («cộng phút tiếng Nhật trong tuần» sai) không hề chỉ về
 * nguyên nhân là *hôm nay đã trôi qua cái tuần đó*.
 */
export function weekStats(
  logs: DailyLog[],
  offset = 0,
  end = todayISO(),
): WeekStats {
  const map = indexByDay(logs);
  const week = weekDates(offset, end)
    .map((d) => map.get(d))
    .filter((l): l is DailyLog => l != null);

  return {
    // jpTotal, KHÔNG phải l.jpMin: từ khi có pomodoro thì `jpMin` chỉ còn là
    // phần phút lẻ. Đọc thẳng nó ở đây từng làm cảnh báo `buildingTooMuch`
    // nhìn thấy 0 phút tiếng Nhật của một tuần học 30 tiếng.
    jpMin: week.reduce((s, l) => s + jpTotal(l), 0),
    itMin: week.reduce((s, l) => s + l.itMin, 0),
    webMin: week.reduce((s, l) => s + l.webMin, 0),
    workouts: week.filter((l) => l.workout).length,
    daysLogged: week.length,
    keystoneDays: week.filter((l) => l.kSleep && l.kJapanese && l.kEat).length,
    spend: week.reduce((s, l) => s + (l.spend ?? 0), 0),
  };
}

export function trend(now: number, prev: number, tolerance = 0.1): Trend {
  if (prev === 0) return now > 0 ? "up" : "flat";
  const change = (now - prev) / prev;
  if (change > tolerance) return "up";
  if (change < -tolerance) return "down";
  return "flat";
}

/**
 * Chuỗi ngày liên tiếp CÓ LÀM — tick ít nhất 1 trong 3 việc nền tảng là ngày
 * đó tính vào chuỗi (không cần đủ cả 3). Ô đậm nhạt (0–3) vẫn cho thấy làm
 * được nhiều hay ít, còn chuỗi chỉ hỏi "hôm đó có xuất hiện không".
 * Nếu hôm nay chưa ghi thì tính từ hôm qua — chuỗi không bị coi là đứt chỉ
 * vì buổi tối chưa tới.
 */
export function keystoneStreak(logs: DailyLog[]): number {
  const map = indexByDay(logs);
  const active = (d: string) => dayLevel(map.get(d)) >= 1;

  let cursor = todayISO();
  if (!active(cursor)) cursor = addDaysISO(cursor, -1);

  let streak = 0;
  while (active(cursor)) {
    streak++;
    cursor = addDaysISO(cursor, -1);
  }
  return streak;
}

/**
 * Chuỗi ngày liên tiếp thoả một điều kiện tuỳ ý (ghi nhật ký / học tiếng Nhật /
 * IT…). Cùng quy ước với keystoneStreak: hôm nay chưa ghi thì tính từ hôm qua.
 */
export function streakOf(
  logs: DailyLog[],
  done: (l: DailyLog) => boolean,
): number {
  const map = indexByDay(logs);
  const ok = (d: string) => {
    const l = map.get(d);
    return !!l && done(l);
  };

  let cursor = todayISO();
  if (!ok(cursor)) cursor = addDaysISO(cursor, -1);

  let streak = 0;
  while (ok(cursor)) {
    streak++;
    cursor = addDaysISO(cursor, -1);
  }
  return streak;
}

/**
 * Chuỗi DÀI NHẤT từng đạt cho một tiêu chí bất kỳ.
 *
 * `longestStreak` bên dưới chỉ tính theo việc nền tảng (`dayLevel >= 1`), nên
 * không dùng lại được cho "ngày có học tiếng Nhật" hay "ngày có code". Hàm này
 * nhận thẳng vị từ, cùng chuẩn với `streakOf` — nhờ vậy con số "hiện tại" và
 * "dài nhất" của cùng một thẻ luôn đo bằng một thước.
 */
export function longestStreakOf(
  logs: DailyLog[],
  done: (l: DailyLog) => boolean,
): number {
  const days = logs
    .filter(done)
    .map((l) => isoUTC(l.date))
    .sort();

  let best = 0;
  let run = 0;
  let prev: string | null = null;

  for (const d of days) {
    if (d === prev) continue; // hai bản ghi cùng ngày không được tính hai lần
    run = prev && addDaysISO(prev, 1) === d ? run + 1 : 1;
    if (run > best) best = run;
    prev = d;
  }
  return best;
}

/** Tổng số NGÀY thỏa tiêu chí — cộng dồn, không cần liên tiếp. */
export function daysWith(
  logs: DailyLog[],
  done: (l: DailyLog) => boolean,
): number {
  return new Set(logs.filter(done).map((l) => isoUTC(l.date))).size;
}

/** Chuỗi dài nhất từng đạt — cùng chuẩn với chuỗi hiện tại (ngày có làm ≥1). */
export function longestStreak(logs: DailyLog[]): number {
  const days = logs
    .filter((l) => dayLevel(l) >= 1)
    .map((l) => isoUTC(l.date))
    .sort();

  let best = 0;
  let run = 0;
  let prev: string | null = null;

  for (const d of days) {
    run = prev && addDaysISO(prev, 1) === d ? run + 1 : 1;
    if (run > best) best = run;
    prev = d;
  }
  return best;
}

/** 0–3 việc nền tảng đã làm trong ngày. Dùng để tô đậm nhạt ô lịch. */
export function dayLevel(log: DailyLog | undefined): 0 | 1 | 2 | 3 {
  if (!log) return 0;
  const n = [log.kSleep, log.kJapanese, log.kEat].filter(Boolean).length;
  return n as 0 | 1 | 2 | 3;
}

export type Intensity = 0 | 1 | 2 | 3 | 4 | 5 | 6;
/** Mức cao nhất — giao diện dùng để dựng đủ số ô chú giải. */
export const INTENSITY_MAX = 6;

/**
 * Mốc số hiệp pomodoro. Nhịp của đợt JLPT là **7 hiệp/ngày** (xem STATE.md
 * §5), nên thang này lấy chính nhịp đó làm chuẩn: học lai rai thì 1 điểm, học
 * nửa buổi thì 2, gần đủ chỉ tiêu thì 3.
 */
const POMO_STEPS = [1, 3, 6] as const;

/**
 * Độ đậm 0–6 cho lịch hoạt động CÔNG KHAI — gộp hai thứ đo hai chuyện khác nhau.
 *
 *     ba việc nền tảng   0–3   ngủ trước 00:00 · tiếng Nhật ≥60' · ăn đủ ba bữa
 *     số hiệp pomodoro   0–3   0 hiệp · 1–2 · 3–5 · ≥6
 *
 * ## Vì sao KHÔNG dùng lại `dayLevel`
 *
 * `dayLevel` chỉ đếm ba cái tick, nên mọi ngày đủ ba việc đều đậm như nhau —
 * một ngày học **một** hiệp và một ngày học **tám** hiệp ra cùng một ô. Trong
 * khi cả đợt JLPT được đo bằng đúng con số hiệp đó, thì lịch trên trang chủ lại
 * là thứ duy nhất không nhìn thấy nó.
 *
 * `dayLevel` vẫn giữ nguyên và vẫn là thước của chuỗi ngày: chuỗi hỏi «hôm đó
 * có xuất hiện không», còn thang này hỏi «hôm đó làm được bao nhiêu». Hai câu
 * khác nhau thì không nên ép chung một hàm — và đổi `dayLevel` thì kéo theo cả
 * `/os/calendar`, `/os/log`, `keystoneStreak` và `longestStreak`.
 *
 * ## Tiếng Nhật được tính HAI lần, và đó là chủ ý
 *
 * Đủ 60 phút thì việc nền tảng «Tiếng Nhật» tự bật, mà 2 hiệp đã là 100 phút —
 * nên một ngày học nhiều vừa được điểm ở cột nền tảng vừa được ở cột pomodoro.
 * Ghi ra đây để lần sau không ai tưởng đó là lỗi: tiếng Nhật là ưu tiên số một
 * của cả hệ thống (STATE.md §10), nên nó nặng hơn là đúng.
 */
export function dayIntensity(log: DailyLog | undefined): Intensity {
  if (!log) return 0;

  const keys = [log.kSleep, log.kJapanese, log.kEat].filter(Boolean).length;
  const pomo = POMO_STEPS.filter((step) => log.jpPomo >= step).length;

  return (keys + pomo) as Intensity;
}

/** Mức của N ngày gần nhất, cũ → mới. */
export function recentLevels(
  logs: DailyLog[],
  days = 14,
): { iso: string; level: 0 | 1 | 2 | 3; isToday: boolean }[] {
  const map = indexByDay(logs);
  const today = todayISO();

  return Array.from({ length: days }, (_, i) => {
    const iso = addDaysISO(today, -(days - 1 - i));
    return { iso, level: dayLevel(map.get(iso)), isToday: iso === today };
  });
}

/**
 * Số ngày đủ 3 việc trong một khoảng, kèm tổng số ngày đã trôi qua.
 *
 * `today` nhận vào được để kiểm được — hàm nào tự đọc đồng hồ bên trong thì
 * kết quả đổi theo ngày chạy, và không viết được phép kiểm nào cho nó. Cùng
 * khuôn với `todayISO(now)` và `weekDates(offset, end)`.
 */
export function periodStats(
  logs: DailyLog[],
  scope: "month" | "year",
  today = todayISO(),
): { full: number; elapsed: number } {
  const [y, m] = today.split("-").map(Number);
  const d = Number(today.slice(8));

  const prefix = scope === "month" ? today.slice(0, 7) : today.slice(0, 4);

  const full = logs.filter(
    (l) => isoUTC(l.date).startsWith(prefix) && dayLevel(l) >= 1,
  ).length;

  // Số ngày đã qua tính tới hôm nay, không tính ngày tương lai
  const elapsed =
    scope === "month"
      ? d
      : Math.round(
          (Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86_400_000,
        ) + 1;

  return { full, elapsed };
}

/**
 * Cảnh báo quan trọng nhất của cả hệ thống: tiếng Nhật là ưu tiên #1,
 * website là #7. Nếu ngược lại thì hệ thống đang phản chủ.
 *
 * ⚠️ Trước đây hàm này so `itMin` với `jpMin`, và **đo nhầm cả hai đầu**:
 * `itMin` là phút HỌC IT — thứ phục vụ thẳng mục tiêu việc làm, nên phạt nó
 * là sai; còn giờ ngồi xây chính cái web này thì không cột nào ghi lại, tức
 * là cảm biến hoàn toàn mù trước đúng thứ nó sinh ra để bắt.
 *
 * Giờ nó so `webMin` với `jpMin`. Ngưỡng 120 phút/tuần để một buổi sửa vặt
 * không bật cảnh báo — thứ cần bắt là cái tuần trôi mất, không phải một tối.
 */
export function buildingTooMuch(w: WeekStats): boolean {
  return w.webMin > w.jpMin && w.webMin >= 120;
}
