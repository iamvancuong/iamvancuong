import Link from "next/link";

/**
 * Thanh tab của trang «Hôm nay».
 *
 * Trước đây cả sáu mục nằm chồng nhau trên một trang dài: nguyên tắc · việc
 * hôm nay · tiếng Nhật · đang tập trung · cam kết kỳ · chuỗi ngày · mục tiêu.
 * Muốn xem hiệp pomodoro thì phải lướt qua ba mục không liên quan — mà đây là
 * màn hình mở nhiều lần nhất trong ngày, nên mỗi lần lướt đều bị trả lại.
 *
 * Chia làm bốn, mỗi tab trả lời đúng một câu hỏi:
 *   Nên nhớ    — vì sao mình làm những việc này?
 *   Việc       — hôm nay phải làm gì?
 *   Tiếng Nhật — đang nhanh hay chậm so với đợt?
 *   Nhìn lại   — kỳ này cam kết gì, chuỗi còn không, mục tiêu tới đâu?
 *
 * Tab mặc định là «Nên nhớ» (yêu cầu của chủ nhân): thứ dễ bỏ qua nhất phải là
 * thứ đập vào mắt trước, vì nó không có deadline nào nhắc.
 *
 * Trạng thái nằm ở `?tab=` chứ không phải useState — mỗi tab là một địa chỉ
 * riêng, lưu được, và mọi mục bên trong vẫn là server component.
 */

const TABS = [
  { key: "nho", label: "Nên nhớ" },
  // Nhãn cố ý ngắn: bốn tab phải vừa một dòng trên iPhone SE (375px), nếu
  // không thì tab cuối bị cắt và không ai biết là có thể vuốt ngang.
  { key: "viec", label: "Việc" },
  { key: "tieng-nhat", label: "Tiếng Nhật" },
  { key: "nhin-lai", label: "Nhìn lại" },
] as const;

export type DashTab = (typeof TABS)[number]["key"];

export const DEFAULT_DASH_TAB: DashTab = "nho";

/** Giá trị lạ (gõ tay, link cũ) rơi về tab mặc định thay vì render trang trống. */
export function toDashTab(raw: string | string[] | undefined): DashTab {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return TABS.some((t) => t.key === v) ? (v as DashTab) : DEFAULT_DASH_TAB;
}

/**
 * Chỉ hai loại badge, và cả hai đều là **việc có hạn**: việc hôm nay chưa xong,
 * và kỳ đã hết mà chưa chấm. Ẩn một thứ có hạn sau tab là cách chắc chắn nhất
 * để quên nó, nên con số phải nhìn thấy từ ngoài.
 */
export function DashTabs({
  current,
  badges,
}: {
  current: DashTab;
  badges: Partial<Record<DashTab, number>>;
}) {
  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-line">
      {TABS.map((t) => {
        const on = t.key === current;
        const n = badges[t.key] ?? 0;
        return (
          <Link
            key={t.key}
            href={t.key === DEFAULT_DASH_TAB ? "/os" : `/os?tab=${t.key}`}
            scroll={false}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 text-[14px] transition-colors ${
              on
                ? "border-ink font-medium text-ink"
                : "border-transparent text-ink-2 hover:text-ink"
            }`}
          >
            {t.label}
            {n > 0 && (
              <span className="ml-1.5 rounded-full bg-accent px-1.5 text-[11px] font-medium tabular-nums text-bg">
                {n}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
