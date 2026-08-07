import { db } from "@/lib/db";
import { streakOf, recentLevels } from "@/lib/os/stats";

export type HeatCell = { iso: string; level: 0 | 1 | 2 | 3; isToday: boolean };

export type PublicStreaks = {
  journal: number;
  japanese: number;
  it: number;
  /** Ô nhiệt như /os: 0–3 việc nền tảng mỗi ngày, ~17 tuần gần nhất. */
  heatmap: HeatCell[];
};

/**
 * Dữ liệu chuỗi để hiện CÔNG KHAI ở trang chủ — chỉ CON SỐ + mức 0–3 mỗi ngày,
 * không lộ nội dung nhật ký riêng tư. Ba chuỗi: nhật ký · tiếng Nhật · lập trình.
 */
export async function getPublicStreaks(): Promise<PublicStreaks> {
  const logs = await db.dailyLog.findMany({
    orderBy: { date: "desc" },
    take: 420,
  });

  return {
    journal: streakOf(
      logs,
      (l) =>
        !!(
          l.journalWhat?.trim() ||
          l.journalLearn?.trim() ||
          l.journalChange?.trim()
        ),
    ),
    japanese: streakOf(logs, (l) => l.jpMin > 0),
    it: streakOf(logs, (l) => l.itMin > 0),
    heatmap: recentLevels(logs, 119),
  };
}
