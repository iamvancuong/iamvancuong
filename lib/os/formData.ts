/**
 * Đọc dữ liệu từ FormData — dùng chung cho cả ba file server action.
 *
 * Trước đây mỗi file tự viết lại `str` / `num` / `bool`, và không hàm nào
 * kiểm gì cả: `jpMin = 999999` hay `horizonAge = -5` đều lưu được, rồi vài
 * tuần sau thống kê ra số vô nghĩa mà không biết hỏng từ đâu.
 *
 * Nguyên tắc ở đây: **kẹp về khoảng hợp lệ, không ném lỗi.** Đây là công cụ
 * cá nhân dùng lúc 11 giờ đêm — gõ nhầm một số thì nó nên tự chỉnh lại, chứ
 * không nên bắt gõ lại từ đầu. Chỉ những thứ thật sự không hiểu được (ngày
 * sai định dạng, enum lạ) mới bị bỏ qua.
 */

/** Chuỗi đã trim; rỗng → null. `max` cắt bớt thay vì từ chối. */
export function str(fd: FormData, k: string, max = 2000): string | null {
  const v = fd.get(k);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t.slice(0, max);
}

/** Chuỗi dài (nội dung bài, kể chuyện). Giữ nguyên xuống dòng, không trim giữa. */
export function text(fd: FormData, k: string, max = 200_000): string | null {
  const v = fd.get(k);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t.slice(0, max);
}

/**
 * Số nguyên đã kẹp vào [min, max]. Không phải số → null.
 * Số thập phân bị làm tròn: mọi cột số trong Life OS đều là Int.
 */
export function num(
  fd: FormData,
  k: string,
  { min = 0, max = Number.MAX_SAFE_INTEGER }: { min?: number; max?: number } = {},
): number | null {
  const v = fd.get(k);
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** Checkbox: không tick thì không có trong FormData. */
export function bool(fd: FormData, k: string): boolean {
  return fd.get(k) != null;
}

/**
 * Liệt kê giá trị hợp lệ của một enum — **không đụng vào object enum của
 * Prisma lúc chạy**.
 *
 * Vì sao không dùng thẳng `Object.values(GoalOutcome)`: Turbopack không theo
 * dõi `node_modules`, nên khi schema có thêm enum mới và `prisma generate`
 * chạy trong lúc dev server đang bật, server vẫn giữ bản `@prisma/client` cũ.
 * `Object.values(<undefined>)` ném lỗi ngay lúc nạp module, giết cả file
 * action, và thông báo lỗi (`Cannot convert undefined or null to object`)
 * không hề gợi ý rằng thủ phạm là cache. Đã mất một lúc mới tìm ra.
 *
 * Cách này chỉ dùng **kiểu**, không dùng giá trị — nên không có gì để mà cũ.
 * Truyền vào `Record<T, null>` nên TypeScript bắt buộc liệt kê **đủ** mọi
 * nhánh: thêm một giá trị vào schema mà quên khai ở đây là lỗi biên dịch,
 * chứ không phải lỗi âm thầm lúc chạy.
 *
 *     const OUTCOMES = valuesOf<GoalOutcome>({
 *       SUCCESS: null, PARTIAL: null, FAILED: null,
 *     });
 */
export function valuesOf<T extends string>(all: Record<T, null>): readonly T[] {
  return Object.keys(all) as T[];
}

/**
 * Giá trị enum. Không nằm trong danh sách cho phép → dùng `fallback`.
 *
 * Cần thiết vì `<select>` gửi lên chuỗi tự do — gọi thẳng action từ ngoài với
 * `status=DELETED` sẽ làm Prisma ném lỗi ở tầng driver, tức là báo lỗi ở sai
 * chỗ và khó đọc.
 */
export function enumOf<T extends string>(
  fd: FormData,
  k: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const v = fd.get(k);
  return typeof v === "string" && (allowed as readonly string[]).includes(v)
    ? (v as T)
    : fallback;
}

/**
 * Ngày "YYYY-MM-DD" → Date ở nửa đêm UTC, hoặc null nếu không hợp lệ.
 *
 * Chặn hai đầu: không nhận ngày trước 1900 (gõ nhầm năm) và không nhận ngày
 * quá một năm trong tương lai. Ký ức thì lùi được về tuổi thơ, nhưng "0202"
 * thì chắc chắn là gõ nhầm.
 */
export function dateISO(fd: FormData, k: string): Date | null {
  const raw = str(fd, k);
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;

  const d = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;

  // Dựng lại chuỗi để bắt ngày không tồn tại (31/02 bị JS đẩy sang 03/03)
  if (d.toISOString().slice(0, 10) !== raw) return null;

  const year = d.getUTCFullYear();
  const maxYear = new Date().getUTCFullYear() + 1;
  if (year < 1900 || year > maxYear) return null;

  return d;
}

/** Phút học trong một ngày. Trần 1440 = 24 giờ; hơn thế là gõ nhầm. */
export const MINUTES_IN_DAY = 1440;

/** Mốc tuổi cho mục tiêu. */
export const AGE_MIN = 1;
export const AGE_MAX = 120;
