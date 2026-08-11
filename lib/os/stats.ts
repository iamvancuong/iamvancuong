import type { DailyLog } from "@prisma/client";
import { addDaysISO, isoUTC, todayISO } from "./day";

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

export function weekStats(logs: DailyLog[], offset = 0): WeekStats {
  const map = indexByDay(logs);
  const week = weekDates(offset)
    .map((d) => map.get(d))
    .filter((l): l is DailyLog => l != null);

  return {
    jpMin: week.reduce((s, l) => s + l.jpMin, 0),
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
