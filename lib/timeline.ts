/**
 * KHUNG NĂM của «Chặng đường» — dựng sẵn, ký ức tự bind vào.
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
  /**
   * Tháng mà câu chuyện của năm đó bắt đầu. Mặc định 1.
   *
   * Trước đây trường này có nghĩa hẹp hơn: "tháng đầu có mặt ở Nhật". Khung
   * hồi đó chỉ kể từ lúc sang Nhật nên hai nghĩa trùng nhau — giờ khung kể cả
   * những năm còn ở Việt Nam, nên nó mang nghĩa chung.
   *
   * Chỉ đặt khi nửa đầu năm thật sự không thuộc về câu chuyện. Đặt bừa là tự
   * giấu mất mấy ô tháng mà lẽ ra người xem được nhìn thấy chỗ trống để viết.
   */
  from?: number;
};

/**
 * ⚠️ Đây là DÒNG ĐỜI THẬT, không phải chữ mẫu. Sửa thì phải đúng.
 *
 * Bản trước ghi 2023 là "đặt chân đến Nhật" với `from: 8` — sai. Năm 2023 chỉ
 * là một chuyến đi chơi; việc sang Nhật để ở là năm 2026. Sai một mốc như vậy
 * thì mọi thứ dựng trên nó cũng sai theo, mà nó lại là loại sai không ai kiểm
 * hộ được: chỉ chủ nhân biết.
 *
 * Mốc năm ở đây khớp với `lib/cv.ts` và `lib/projects.ts` — cùng một cuộc đời
 * thì hai chỗ không được kể hai kiểu:
 *   2021  vào Mỏ – Địa chất (10/2021)
 *   2022  thực tập BA ở JVB (06/2022)
 *   2023  vào Heligate (10/2023)
 *   2025  sang Adamo (05/2025)
 *   2026  hết đại học (01/2026) · rời Adamo (02/2026)
 */
export const TIMELINE: TimelineYear[] = [
  {
    year: 2021,
    title: "Hết cấp ba",
    note: "Khép lại mười hai năm ở Quảng Trị. Đỗ Mỏ – Địa chất, và biết mình sắp phải đi xa.",
    // Câu chuyện của năm này bắt đầu ở kỳ thi cuối cấp, không phải tháng Giêng.
    from: 6,
  },
  {
    year: 2022,
    title: "Lên Hà Nội",
    note: "Năm nhất. Giữa năm xin được chỗ thực tập đầu tiên — phân tích nghiệp vụ, chưa phải code.",
  },
  {
    year: 2023,
    title: "Lần đầu thấy Nhật",
    note: "Một chuyến đi chơi, chưa nghĩ có ngày quay lại để ở. Cuối năm nhận việc fullstack đầu tiên.",
  },
  {
    year: 2024,
    title: "Vừa học vừa làm",
    note: "Sáng giảng đường, tối Laravel và Angular. Năm đầu tiên viết code cho hệ thống có người dùng thật.",
  },
  {
    year: 2025,
    title: "Quen nhịp hai đầu",
    note: "Sang Adamo làm dev chính hệ thống HRM cho hơn 150 người, trong lúc vẫn còn là sinh viên.",
  },
  {
    year: 2026,
    title: "Nghỉ việc, sang Nhật",
    note: "Đóng lại ba năm đi làm ở Việt Nam để bắt đầu lại từ đầu — bằng tiếng Nhật.",
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
       * Khung khai 2021 bắt đầu từ tháng 6 (kỳ thi cuối cấp). Nhưng một ký ức
       * đề ngày 2021-02 vẫn là ký ức thật — nó chỉ xảy ra trước cái mốc mình
       * tự chọn. Lấy cứng `from` của khung thì tháng đó không có ô để rơi
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
