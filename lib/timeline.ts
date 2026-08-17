/**
 * KHUNG NĂM của "Chặng đường ở Nhật" — dựng sẵn, ký ức tự bind vào.
 *
 * ## Vì sao cần khung dựng sẵn
 *
 * Trang Hành trình trước đây sinh ra hoàn toàn từ dữ liệu: có ký ức công khai
 * nào thì hiện năm đó, không có thì trang trống trơn. Hệ quả là **trang chỉ
 * bắt đầu tồn tại sau khi đã viết** — mà viết ký ức là việc tốn công nhất
 * trong cả hệ thống, nên trên thực tế nó trống suốt.
 *
 * Khung dựng sẵn lật ngược thứ tự đó: các năm có mặt từ đầu, kèm một dòng nói
 * năm đó là giai đoạn gì. Trang có hình hài ngay cả khi chưa có ký ức nào, và
 * mỗi ô tháng trống là một chỗ trống nhìn thấy được — thứ mời viết, khác hẳn
 * một trang trắng không gợi gì.
 *
 * ## Ký ức bind vào bằng cách nào
 *
 * Không có khóa ngoại, không có bảng nào phải khai. `getPublicJourney()` gom
 * ký ức theo `date.getUTCFullYear()`; `mergeTimeline()` ghép theo đúng con số
 * năm đó. Viết một ký ức ngày 2026-03-15 là nó tự rơi vào ô tháng 03 của năm
 * 2026 — không phải sửa file này.
 *
 * Năm có ký ức mà KHÔNG có trong khung (ví dụ ký ức tuổi thơ ở Việt Nam) vẫn
 * hiện, xếp đúng thứ tự thời gian. Khung là mức sàn, không phải bộ lọc.
 */

export type TimelineYear = {
  year: number;
  /** Giai đoạn đó là gì — một cụm ngắn, không phải một câu. */
  title: string;
  /** Một dòng kể thêm. */
  note: string;
  /** Tháng đầu có mặt ở Nhật trong năm đó. Mặc định 1. */
  from?: number;
};

export const TIMELINE: TimelineYear[] = [
  {
    year: 2023,
    title: "Bắt đầu — đặt chân đến Nhật",
    note: "Những tháng đầu: trường tiếng, phòng trọ, lần đầu baito.",
    from: 8,
  },
  {
    year: 2024,
    title: "Quen nhịp — học & làm",
    note: "Cân bằng hơn giữa lớp và ca làm. Bắt đầu code nghiêm túc lại.",
  },
  {
    year: 2025,
    title: "Khá lên một chút",
    note: "Tiếng Nhật lên, project cá nhân nhiều hơn, bắt đầu viết nhật ký.",
  },
  {
    year: 2026,
    title: "Hiện tại",
    note: "Chiến dịch 120 ngày N5→N3. Đang duy trì Life OS mỗi ngày.",
  },
];

export type TimelineMonth = {
  month: number;
  /** Số ký ức công khai trong tháng. 0 = ô trống, chưa viết gì. */
  count: number;
};

export type TimelineRow = {
  year: number;
  title: string | null;
  note: string | null;
  months: TimelineMonth[];
  memoryCount: number;
};

/**
 * Ghép khung năm với ký ức thật.
 *
 * `todayYear`/`todayMonth` truyền vào chứ không gọi `new Date()` bên trong:
 * hàm thuần thì test được, và quan trọng hơn — server với trình duyệt phải ra
 * cùng một kết quả, nếu không React báo lệch hydration vào đúng đêm giao thừa.
 */
export function mergeTimeline(
  /** Mỗi ký ức công khai, rút gọn còn đúng năm và tháng của nó. */
  entries: { year: number; month: number }[],
  todayYear: number,
  todayMonth: number,
): TimelineRow[] {
  // (năm, tháng) → số ký ức
  const counts = new Map<string, number>();
  const seenYears = new Set<number>();
  for (const e of entries) {
    seenYears.add(e.year);
    const k = `${e.year}-${e.month}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  const framed = new Set(TIMELINE.map((t) => t.year));
  // Năm có ký ức nhưng không nằm trong khung vẫn được hiện — khung là mức sàn.
  const extra = [...seenYears].filter((y) => !framed.has(y));

  const rows: TimelineRow[] = [
    ...TIMELINE.map((t) => ({ t, year: t.year })),
    ...extra.map((y) => ({ t: null as TimelineYear | null, year: y })),
  ]
    .sort((a, b) => a.year - b.year)
    .map(({ t, year }) => {

      /**
       * Tháng bắt đầu = SỚM HƠN giữa mốc khai trong khung và tháng có ký ức
       * sớm nhất của năm đó.
       *
       * Khung khai 2023 bắt đầu từ tháng 8 (tháng đặt chân đến Nhật). Nhưng
       * một ký ức đề ngày 2023-03 vẫn là ký ức thật — nó chỉ xảy ra trước khi
       * sang Nhật. Lấy cứng `from` của khung thì tháng đó không có ô để rơi
       * vào, nên ký ức **biến mất khỏi trang mà không báo gì**, và
       * `memoryCount` cũng đếm thiếu vì nó cộng từ chính mảng tháng này.
       *
       * Khung là mức sàn, không phải bộ lọc — cùng một luật đã áp cho những
       * NĂM ngoài khung, giờ áp nốt cho THÁNG.
       */
      const earliest = Math.min(
        ...entries.filter((e) => e.year === year).map((e) => e.month),
        t?.from ?? 1,
      );
      const from = Number.isFinite(earliest) ? earliest : (t?.from ?? 1);

      // Năm hiện tại chỉ hiện tới tháng NÀY — bày sẵn cả 12 ô là bày ra bốn
      // tháng chưa xảy ra, và chúng trông giống hệt tháng đã qua mà chưa viết.
      const to = year === todayYear ? todayMonth : 12;

      const months: TimelineMonth[] = [];
      for (let m = from; m <= to; m++) {
        months.push({ month: m, count: counts.get(`${year}-${m}`) ?? 0 });
      }

      return {
        year,
        title: t?.title ?? null,
        note: t?.note ?? null,
        months,
        memoryCount: months.reduce((n, m) => n + m.count, 0),
      };
    });

  return rows;
}
