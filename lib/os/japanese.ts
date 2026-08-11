import type { DailyLog, Goal } from "@prisma/client";
import { addDaysISO, daysBetweenISO, isoUTC, todayISO } from "./day";
import { POMO_MIN } from "./constants";

/**
 * Giờ học có bấm giờ — gom mọi phép tính về một chỗ.
 *
 * Hàm thuần, không chạm database. Cùng lý do với `stats.ts` và `money.ts`:
 * đây là chỗ sai **âm thầm** nhất — cộng nhầm một ngày thì không có lỗi nào
 * hiện ra, chỉ có một con số trông hợp lý mà sai, và ba tháng sau mới biết thì
 * đã không lần ngược được. Vì vậy mọi hàm ở đây nhận `today` vào để kiểm được.
 */

/** Chỉ những trường cần cho phép tính — nhận cả bản ghi rút gọn. */
export type JpLog = Pick<DailyLog, "date" | "jpPomo" | "jpMin">;

/**
 * Một mục tiêu có bấm giờ. Nhận ra bằng `targetHours != null` — đó là dấu
 * hiệu duy nhất; mọi mục tiêu khác để trống cả cụm này.
 */
export type StudyGoal = Pick<
  Goal,
  "studyStart" | "studyEnd" | "targetHours" | "priorHours" | "dailyPomo"
>;

/** `Goal` có phải mục tiêu bấm giờ không. */
export function isStudyGoal<T extends { targetHours: number | null }>(
  g: T,
): boolean {
  return g.targetHours != null && g.targetHours > 0;
}

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
  /** Phút đã có: giờ học TRƯỚC ĐÂY cộng phút bấm được trong đợt. */
  doneMin: number;
  /** Riêng phần giờ đã học trước khi có hệ thống — vẽ khác màu trên thanh. */
  priorMin: number;
  /** Phút đáng lẽ phải có tính tới hết HÔM QUA — mốc để nói nhanh hay chậm. */
  dueMin: number;
  /** TỔNG của cả hành trình, tính từ số 0. */
  totalMin: number;
  /** Còn bao nhiêu phút nữa mới đủ tổng. Đây là con số người ta muốn thấy. */
  remainMin: number;
  /** doneMin − dueMin. Dương là đang vượt, âm là đang nợ. */
  aheadMin: number;
  /** Phần trăm của cả hành trình, kẹp 0–100. */
  percent: number;
  /** Nhịp cần cho những ngày CÒN LẠI để vẫn kịp. null = đợt đã hết. */
  pomoPerDayLeft: number | null;
  state: "future" | "running" | "ended";
};

/**
 * Nhanh hay chậm so với nhịp cần thiết.
 *
 * Hai điểm dễ làm sai:
 *
 * 1. `targetHours` là TỔNG TỪ SỐ 0, không phải "thêm bao nhiêu nữa". "N3 cần
 *    800 giờ" nghĩa là N5+N4+N3 cộng lại 800. Phần còn phải học là
 *    `800 − priorHours`, và nhịp cần được rút ra từ ĐÓ.
 *
 * 2. `dueMin` chỉ tính tới **hết hôm qua**. Nếu tính cả hôm nay thì 8 giờ sáng
 *    hệ thống đã báo "đang nợ 7 hiệp" trong khi ngày còn chưa bắt đầu — sai về
 *    sự thật, và làm người ta bỏ nhìn cái thanh tiến độ.
 */
export function goalPace(
  goal: StudyGoal,
  logs: JpLog[],
  today = todayISO(),
): Pace | null {
  // Thiếu ngày hoặc thiếu tổng thì không có nhịp nào để nói. Trả null thay vì
  // một Pace toàn số 0 — số 0 trông như dữ liệu thật.
  if (!goal.studyStart || !goal.studyEnd || !goal.targetHours) return null;

  const start = isoUTC(goal.studyStart);
  const end = isoUTC(goal.studyEnd);

  const daysTotal = Math.max(1, daysBetweenISO(start, end) + 1);
  const totalMin = goal.targetHours * 60;
  const priorMin = Math.min(totalMin, (goal.priorHours ?? 0) * 60);

  const state = today < start ? "future" : today > end ? "ended" : "running";

  // Kẹp hai đầu: chưa tới ngày bắt đầu thì chưa nợ gì, quá ngày đích thì không
  // cộng thêm nợ của những ngày ngoài đợt.
  const cursor = today < start ? start : today > end ? addDaysISO(end, 1) : today;
  const daysClosed = Math.max(0, Math.min(daysTotal, daysBetweenISO(start, cursor)));
  const daysLeft = Math.max(0, daysTotal - daysClosed);

  // Chỉ phần CÒN PHẢI HỌC mới trải ra theo ngày — giờ đã học trước đây không
  // thuộc về đợt này, nó là điểm xuất phát.
  const perDay = (totalMin - priorMin) / daysTotal;

  const doneMin = priorMin + jpSum(logs, start, today < end ? today : end);
  const remainMin = Math.max(0, totalMin - doneMin);
  // Làm tròn: perDay lẻ (300h / 123 ngày), mà "nợ 3499.7 phút" không nói được.
  const dueMin = Math.round(priorMin + daysClosed * perDay);

  return {
    daysTotal,
    daysClosed,
    daysLeft,
    doneMin,
    priorMin,
    dueMin,
    totalMin,
    remainMin,
    aheadMin: doneMin - dueMin,
    percent: Math.min(100, Math.round((doneMin / totalMin) * 100)),
    pomoPerDayLeft:
      daysLeft > 0
        ? Math.ceil((remainMin / daysLeft / POMO_MIN) * 10) / 10
        : null,
    state,
  };
}

/* ------------------------------------------------------------ mục tiêu con */

export type ChildProgress = {
  id: string;
  title: string;
  icon: string | null;
  /** Phút đã học của mục tiêu con này (hiệp đã gắn + giờ khai trước đây). */
  doneMin: number;
  /** Ngân sách, quy từ `targetHours` sang phút. 0 = chưa đặt ngân sách. */
  targetMin: number;
  percent: number;
  /** Số hiệp còn thiếu để lấp đầy ngân sách. 0 khi đã đủ hoặc chưa đặt đích. */
  pomoLeft: number;
};

type ChildLike = Pick<Goal, "id" | "title" | "icon" | "targetHours" | "priorHours">;

/**
 * Tiến độ từng mục tiêu con: 「Từ vựng 62h / 250h」·「N5–N4 500h / 500h」.
 *
 * Đếm bằng SỐ HIỆP đã gắn rồi mới nhân `POMO_MIN`, cộng thêm `priorHours` của
 * chính mục tiêu con đó — nhờ vậy một chặng đã đi qua (N5–N4) hiện đầy mà
 * không cần bịa ra hàng trăm hiệp trong quá khứ.
 *
 * Phút lẻ (`jpMin`) cố ý KHÔNG chia vào con nào: nó là phần nghe podcast trên
 * tàu, không gắn với ngân sách nào. Vì vậy tổng các con luôn ≤ tổng giờ, và
 * chênh lệch đó có nghĩa chứ không phải lỗi làm tròn.
 */
export function childProgress(
  children: ChildLike[],
  sessions: { goalId: string | null }[],
): ChildProgress[] {
  const count = new Map<string, number>();
  for (const s of sessions) {
    if (!s.goalId) continue;
    count.set(s.goalId, (count.get(s.goalId) ?? 0) + 1);
  }

  return children.map((c) => {
    const doneMin =
      (count.get(c.id) ?? 0) * POMO_MIN + (c.priorHours ?? 0) * 60;
    const targetMin = (c.targetHours ?? 0) * 60;

    return {
      id: c.id,
      title: c.title,
      icon: c.icon,
      doneMin,
      targetMin,
      percent:
        targetMin > 0 ? Math.min(100, Math.round((doneMin / targetMin) * 100)) : 0,
      pomoLeft:
        targetMin > doneMin ? Math.ceil((targetMin - doneMin) / POMO_MIN) : 0,
    };
  });
}

/** Số hiệp chưa gắn mục tiêu con nào — nói thẳng thay vì im lặng nuốt mất. */
export function unassignedPomo(sessions: { goalId: string | null }[]): number {
  return sessions.filter((s) => !s.goalId).length;
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
