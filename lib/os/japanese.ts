import type { DailyLog, StudyGoal, StudySkill } from "@prisma/client";
import { addDaysISO, daysBetweenISO, isoUTC, todayISO } from "./day";
import { POMO_MIN } from "./constants";

/**
 * Giờ học tiếng Nhật — gom mọi phép tính về một chỗ.
 *
 * Hàm thuần, không chạm database, nhận thẳng bản ghi `DailyLog`. Cùng lý do
 * với `stats.ts` và `money.ts`: đây là chỗ sai **âm thầm** nhất của cả hệ
 * thống — cộng nhầm một ngày thì không có lỗi nào hiện ra, chỉ có một con số
 * trông hợp lý mà sai, và ba tháng sau mới biết thì đã không lần ngược được.
 * Vì vậy mọi hàm ở đây nhận `today` vào làm tham số để còn kiểm được.
 */

/** Chỉ những trường cần cho phép tính — nhận cả bản ghi rút gọn. */
type JpLog = Pick<DailyLog, "date" | "jpPomo" | "jpMin">;

/**
 * ⚠️ TỔNG phút tiếng Nhật của một ngày. KHÔNG chỗ nào được đọc thẳng `jpMin`:
 * đó chỉ là phần phút lẻ ngoài pomodoro (xem chú thích trong schema).
 */
export function jpTotal(log: JpLog | undefined | null): number {
  if (!log) return 0;
  return log.jpPomo * POMO_MIN + log.jpMin;
}

/** Tổng phút trong khoảng [from, to], hai đầu đều tính. */
export function jpSum(logs: JpLog[], fromISO: string, toISO: string): number {
  return logs.reduce((sum, l) => {
    const d = isoUTC(l.date);
    return d >= fromISO && d <= toISO ? sum + jpTotal(l) : sum;
  }, 0);
}

/** Tổng phút của tháng / năm chứa `today`. */
export function jpPeriodTotal(
  logs: JpLog[],
  scope: "month" | "year",
  today = todayISO(),
): number {
  const prefix = scope === "month" ? today.slice(0, 7) : today.slice(0, 4);
  return logs.reduce(
    (sum, l) => (isoUTC(l.date).startsWith(prefix) ? sum + jpTotal(l) : sum),
    0,
  );
}

/** Chuỗi ngày liên tiếp CÓ HỌC (≥1 phút). Hôm nay chưa học thì tính từ hôm qua. */
export function jpStreak(logs: JpLog[], today = todayISO()): number {
  const map = new Map(logs.map((l) => [isoUTC(l.date), l]));
  const on = (d: string) => jpTotal(map.get(d)) > 0;

  let cursor = today;
  if (!on(cursor)) cursor = addDaysISO(cursor, -1);

  let n = 0;
  while (on(cursor)) {
    n++;
    cursor = addDaysISO(cursor, -1);
  }
  return n;
}

export type Pace = {
  /** Số ngày của cả đợt, tính cả ngày đầu và ngày đích. */
  daysTotal: number;
  /** Số ngày ĐÃ ĐÓNG SỔ — không tính hôm nay (hôm nay còn đang diễn ra). */
  daysClosed: number;
  /** Số ngày còn lại, TÍNH CẢ hôm nay. 0 nghĩa là đợt đã hết. */
  daysLeft: number;
  /** Phút đã học được tính tới hết hôm nay. */
  doneMin: number;
  /** Phút đáng lẽ phải có tính tới hết HÔM QUA — mốc để nói nhanh hay chậm. */
  dueMin: number;
  /** Phút của cả đợt. Từ `targetHours` nếu có, không thì suy từ nhịp. */
  totalMin: number;
  /** Còn bao nhiêu phút nữa mới đủ tổng. Đây là con số người ta muốn thấy. */
  remainMin: number;
  /** Tổng là số NHẬP TAY hay số suy ra từ nhịp — giao diện nói rõ, khỏi đoán. */
  totalIsExplicit: boolean;
  /** doneMin − dueMin. Dương là đang vượt, âm là đang nợ. */
  aheadMin: number;
  /** Phần trăm của cả đợt, kẹp 0–100. */
  percent: number;
  /** Nhịp cần cho những ngày CÒN LẠI để vẫn kịp. null = đợt đã hết. */
  pomoPerDayLeft: number | null;
  state: "future" | "running" | "ended";
};

/**
 * Nhanh hay chậm so với nhịp đã cam kết.
 *
 * Điểm quan trọng: `dueMin` chỉ tính tới **hết hôm qua**. Nếu tính cả hôm nay
 * thì 8 giờ sáng hệ thống đã báo "đang nợ 7 hiệp" trong khi ngày còn chưa bắt
 * đầu — sai về mặt sự thật và làm người ta bỏ nhìn cái thanh tiến độ.
 */
export function goalPace(
  goal: Pick<StudyGoal, "startDate" | "targetDate" | "dailyPomo"> & {
    targetHours?: number | null;
  },
  logs: JpLog[],
  today = todayISO(),
): Pace {
  const start = isoUTC(goal.startDate);
  const end = isoUTC(goal.targetDate);

  const daysTotal = Math.max(1, daysBetweenISO(start, end) + 1);

  /**
   * Tổng giờ nhập tay THẮNG nhịp.
   *
   * Đặt 800h thì 800h là sự thật, còn nhịp bao nhiêu là hệ quả — hệ thống tự
   * chia ra. Ngược lại (suy tổng từ nhịp) thì đổi nhịp một cái là "tổng giờ
   * cần cho N3" cũng đổi theo, mà con số đó đâu có phụ thuộc vào việc mình
   * chăm hay lười.
   */
  const totalIsExplicit = !!goal.targetHours && goal.targetHours > 0;
  const totalMin = totalIsExplicit
    ? goal.targetHours! * 60
    : daysTotal * goal.dailyPomo * POMO_MIN;

  // Nhịp dùng để chấm nhanh/chậm phải rút ra TỪ TỔNG, không phải từ `dailyPomo` —
  // nếu không thì đặt 800h mà nhịp khai 7 hiệp sẽ báo "đang đúng nhịp" trong
  // khi thực tế còn thiếu cả trăm giờ.
  const perDay = totalMin / daysTotal;

  const state = today < start ? "future" : today > end ? "ended" : "running";

  // Kẹp hai đầu: chưa tới ngày bắt đầu thì chưa nợ gì, quá ngày đích thì
  // không cộng thêm nợ của những ngày ngoài đợt.
  const cursor = today < start ? start : today > end ? addDaysISO(end, 1) : today;
  const daysClosed = Math.max(0, Math.min(daysTotal, daysBetweenISO(start, cursor)));
  const daysLeft = Math.max(0, daysTotal - daysClosed);

  const doneMin = jpSum(logs, start, today < end ? today : end);
  // Làm tròn: `perDay` giờ có thể lẻ (800h / 123 ngày), mà "nợ 3499.7 phút"
  // thì không phải là một câu nói được.
  const dueMin = Math.round(daysClosed * perDay);
  const remainMin = Math.max(0, totalMin - doneMin);

  return {
    daysTotal,
    daysClosed,
    daysLeft,
    doneMin,
    dueMin,
    totalMin,
    remainMin,
    totalIsExplicit,
    aheadMin: doneMin - dueMin,
    percent: Math.min(100, Math.round((doneMin / totalMin) * 100)),
    pomoPerDayLeft:
      daysLeft > 0
        ? Math.ceil((remainMin / daysLeft / POMO_MIN) * 10) / 10
        : null,
    state,
  };
}

/* ------------------------------------------------------------- mảng kỹ năng */

export type SkillProgress = {
  id: string;
  name: string;
  icon: string | null;
  /** Phút đã học của mảng này. */
  doneMin: number;
  /** Ngân sách, quy từ `targetHours` sang phút. 0 = chưa đặt ngân sách. */
  targetMin: number;
  percent: number;
  /** Số hiệp còn thiếu để lấp đầy ngân sách. 0 khi đã đủ hoặc chưa đặt đích. */
  pomoLeft: number;
};

/**
 * Tiến độ từng mảng: 「từ vựng 62h / 250h」.
 *
 * Đếm bằng SỐ HIỆP của mảng đó rồi mới nhân `POMO_MIN` — phút lẻ (`jpMin`)
 * cố ý KHÔNG chia vào mảng nào: nó là phần nghe podcast trên tàu, không gắn
 * với ngân sách nào cả. Vì vậy tổng các mảng luôn ≤ tổng giờ học, và chênh
 * lệch đó có nghĩa chứ không phải lỗi làm tròn.
 */
export function skillProgress(
  skills: Pick<StudySkill, "id" | "name" | "icon" | "targetHours">[],
  sessions: { skillId: string | null }[],
): SkillProgress[] {
  const count = new Map<string, number>();
  for (const s of sessions) {
    if (!s.skillId) continue;
    count.set(s.skillId, (count.get(s.skillId) ?? 0) + 1);
  }

  return skills.map((s) => {
    const doneMin = (count.get(s.id) ?? 0) * POMO_MIN;
    const targetMin = s.targetHours * 60;

    return {
      id: s.id,
      name: s.name,
      icon: s.icon,
      doneMin,
      targetMin,
      percent: targetMin > 0 ? Math.min(100, Math.round((doneMin / targetMin) * 100)) : 0,
      pomoLeft:
        targetMin > doneMin ? Math.ceil((targetMin - doneMin) / POMO_MIN) : 0,
    };
  });
}

/** Số hiệp chưa gắn mảng nào — giao diện nói thẳng thay vì im lặng nuốt mất. */
export function unassignedPomo(sessions: { skillId: string | null }[]): number {
  return sessions.filter((s) => !s.skillId).length;
}

/** Một cột của biểu đồ. */
export type Bucket = { key: string; label: string; min: number; target: number };

/** N ngày gần nhất, cũ → mới. `target` là đích ngày đó (0 nếu ngoài đợt). */
export function dailyBuckets(
  logs: JpLog[],
  days: number,
  dailyTargetMin: (iso: string) => number,
  today = todayISO(),
): Bucket[] {
  const map = new Map(logs.map((l) => [isoUTC(l.date), l]));

  return Array.from({ length: days }, (_, i) => {
    const iso = addDaysISO(today, -(days - 1 - i));
    return {
      key: iso,
      label: iso.slice(8),
      min: jpTotal(map.get(iso)),
      target: dailyTargetMin(iso),
    };
  });
}

const MONTHS_VN = [
  "Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
  "Th7", "Th8", "Th9", "Th10", "Th11", "Th12",
];

/** N tháng gần nhất, cũ → mới. `target` bỏ trống (đích theo tháng ít nghĩa). */
export function monthlyBuckets(
  logs: JpLog[],
  months: number,
  today = todayISO(),
): Bucket[] {
  const [y, m] = today.split("-").map(Number);

  return Array.from({ length: months }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - (months - 1 - i), 1));
    const key = isoUTC(d).slice(0, 7);
    return {
      key,
      label: MONTHS_VN[d.getUTCMonth()],
      min: logs.reduce(
        (s, l) => (isoUTC(l.date).startsWith(key) ? s + jpTotal(l) : s),
        0,
      ),
      target: 0,
    };
  });
}
