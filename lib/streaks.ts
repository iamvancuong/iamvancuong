import { db } from "@/lib/db";
import { jpTotal } from "@/lib/os/japanese";
import {
  daysWith,
  longestStreakOf,
  recentLevels,
  streakOf,
} from "@/lib/os/stats";

export type HeatCell = { iso: string; level: 0 | 1 | 2 | 3; isToday: boolean };

/**
 * Một ô số ở trang chủ.
 *
 * `now` là con số LỚN, `best` là dòng nhỏ bên dưới. Ý nghĩa của `now` đổi theo
 * `mode` — xem chú thích của `PublicStreaks`.
 */
export type Stat = {
  now: number;
  /** Chuỗi dài nhất từng đạt, cùng tiêu chí với `now`. */
  best: number;
  mode: "streak" | "total";
};

export type PublicStreaks = {
  journal: Stat;
  japanese: Stat;
  it: Stat;
  /** Ô nhiệt như /os: 0–3 việc nền tảng mỗi ngày, ~17 tuần gần nhất. */
  heatmap: HeatCell[];
};

/**
 * Dữ liệu để hiện CÔNG KHAI ở trang chủ — chỉ CON SỐ + mức 0–3 mỗi ngày,
 * không lộ nội dung nhật ký riêng tư.
 *
 * **Lập trình đếm CỘNG DỒN, hai cái kia đếm CHUỖI.** Cố ý khác nhau, vì bản
 * chất ba việc này khác nhau: nhật ký và tiếng Nhật là việc phải làm *mỗi
 * ngày* — đứt một hôm là mất nhịp, nên chuỗi mới là thước đúng. Lập trình thì
 * học theo đợt, có tuần cày ba buổi dài rồi nghỉ vài hôm; đo bằng chuỗi thì
 * một con số 0 nằm chình ình trên trang chủ trong khi thực tế vẫn đang tiến —
 * thước sai làm người ta bỏ cuộc chứ không làm người ta chăm hơn.
 *
 * Cả ba vẫn hiện thêm CHUỖI DÀI NHẤT ở dòng nhỏ: nó là kỷ lục, không tụt về 0
 * khi lỡ một hôm, nên nó nói được điều mà con số hiện tại không nói.
 */
export async function getPublicStreaks(): Promise<PublicStreaks> {
  const logs = await db.dailyLog.findMany({
    orderBy: { date: "desc" },
    take: 420,
  });

  const journaled = (l: (typeof logs)[number]) =>
    !!(
      l.journalWhat?.trim() ||
      l.journalLearn?.trim() ||
      l.journalChange?.trim()
    );

  // ⚠️ jpTotal, KHÔNG phải l.jpMin — `jpMin` từ khi có pomodoro chỉ còn là
  // phút LẺ. Đọc thẳng nó làm chuỗi tiếng Nhật đứt ngay ngày đầu tiên học
  // bằng pomodoro (7 hiệp, 0 phút lẻ → jpMin = 0), mà đây là con số hiện
  // trên TRANG CHỦ CÔNG KHAI.
  const studied = (l: (typeof logs)[number]) => jpTotal(l) > 0;
  const coded = (l: (typeof logs)[number]) => l.itMin > 0;

  return {
    journal: {
      now: streakOf(logs, journaled),
      best: longestStreakOf(logs, journaled),
      mode: "streak",
    },
    japanese: {
      now: streakOf(logs, studied),
      best: longestStreakOf(logs, studied),
      mode: "streak",
    },
    it: {
      now: daysWith(logs, coded),
      best: longestStreakOf(logs, coded),
      mode: "total",
    },
    heatmap: recentLevels(logs, 119),
  };
}
