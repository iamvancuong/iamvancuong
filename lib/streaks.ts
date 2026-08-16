import { db } from "@/lib/db";
import { jpTotal } from "@/lib/os/japanese";
import {
  dayLevel,
  daysWith,
  longestStreakOf,
  streakOf,
} from "@/lib/os/stats";
import { isoUTC, todayISO } from "@/lib/os/day";

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
  /**
   * Mức 0–3 việc nền tảng của MỌI ngày có nhật ký — không cắt theo cửa sổ.
   *
   * Trước đây chỉ trả 119 ngày gần nhất vì lưới chỉ hiện được một dải. Giờ
   * lịch nhiệt xem theo TỪNG NĂM và có nút chọn năm, nên cắt sẵn ở đây là cắt
   * mất những năm mà người xem có quyền bấm sang.
   */
  heatmap: HeatCell[];
  /**
   * Năm hiện tại, tính ở SERVER theo JST.
   *
   * Bắt buộc phải truyền xuống chứ không để giao diện gọi `new Date()`: nút
   * chọn năm phải có mặt ngay từ 01/01 dù chưa ghi ngày nào của năm mới, mà
   * suy năm ở client thì server và trình duyệt ra hai kết quả khác nhau vào
   * đúng đêm giao thừa — React báo lệch hydration, và chỉ đêm đó.
   */
  currentYear: number;
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
  /**
   * KHÔNG cắt `take: 420` nữa.
   *
   * Hai thứ hỏng vì cái trần đó, và cả hai đều hỏng IM LẶNG:
   *
   * 1. Lịch hoạt động chỉ giữ được ~14 tháng, nên sau chừng ấy thời gian nút
   *    năm cũ **tự biến mất** — bấm xem lại năm ngoái thì không còn nút để bấm.
   * 2. "Lập trình" đếm CỘNG DỒN, mà cộng dồn trên một cửa sổ 420 ngày thì con
   *    số ngừng lớn và bắt đầu tụt — trong khi nó phải chỉ có tăng.
   *
   * Đây là nhật ký một người: mỗi năm nhiều nhất 366 dòng, mười năm là 3.660
   * dòng. Đọc hết rẻ hơn nhiều so với một con số sai mà không ai nhận ra.
   */
  const logs = await db.dailyLog.findMany({ orderBy: { date: "desc" } });

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
    // Mọi ngày có bản ghi, xếp cũ → mới. Giao diện tự dựng lưới cho năm nó
    // đang xem; ngày không có bản ghi thì đơn giản là không có mặt ở đây.
    heatmap: logs
      .map((l) => ({
        iso: isoUTC(l.date),
        level: dayLevel(l),
        isToday: isoUTC(l.date) === todayISO(),
      }))
      .sort((a, b) => a.iso.localeCompare(b.iso)),
    currentYear: Number(todayISO().slice(0, 4)),
  };
}
