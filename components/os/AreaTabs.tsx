import Link from "next/link";
import { Plus } from "lucide-react";

/**
 * Thanh tab của một lĩnh vực.
 *
 * **Chỉ hiện tab đang có nội dung.** OS-DESIGN §3 chốt "bốn loại là chỗ vừa",
 * mà giờ đã có năm — bày đủ năm ở cả bảy lĩnh vực là ba mươi lăm ô, phần lớn
 * rỗng. Đúng cái bẫy §10 nói tới: nhìn nhiều ô trống thì sinh phản xạ đi điền
 * cho đầy, trong khi *"sáu tháng nữa mà Tình yêu vẫn trống thì hoàn toàn ổn"*.
 *
 * Loại chưa dùng nằm sau nút `+`, kèm một dòng nói nó dùng để làm gì — nên nút
 * đó vừa là chỗ thêm, vừa là chỗ giải thích.
 */

const TABS = [
  {
    key: "goals",
    label: "Mục tiêu",
    hint: "Điều muốn đạt — cam kết theo tuần/tháng, hoặc mốc dài hạn theo tuổi.",
  },
  {
    key: "principles",
    label: "Nguyên tắc",
    hint: "Cách mình muốn sống ở đây. Không phải to-do — thứ để đọc lại lúc phân vân.",
  },
  {
    key: "items",
    label: "Đang dùng",
    hint: "Thứ đang dùng / muốn thử / đã bỏ, kèm kết luận để khỏi mua lại thứ vô dụng.",
  },
  {
    key: "metrics",
    label: "Số đo",
    hint: "Con số theo dõi theo thời gian — điểm mock test, cân nặng, chi tiêu tháng.",
  },
  {
    key: "memories",
    label: "Ký ức",
    hint: "Chuyện đã xảy ra, có ảnh. Ngày tự do nên lùi được về tận tuổi thơ.",
  },
  {
    key: "photos",
    label: "Tiến trình",
    hint: "Ảnh chụp lại theo chu kỳ — da, tóc, cơ thể. Thứ đổi quá chậm để nhớ, nhưng nhìn hai tấm cách nhau nửa năm là thấy ngay.",
  },
] as const;

export type AreaTab = (typeof TABS)[number]["key"];

/**
 * Tab mặc định — mở `/os/a/<slug>` không kèm `?tab=` là vào đây.
 *
 * Vì nó là cửa vào của lĩnh vực nên nó KHÔNG bao giờ được nằm trong nhóm ẩn.
 * Ở Tình yêu (lĩnh vực duy nhất chưa có mục tiêu nào) thì vừa bấm sang tab khác
 * là «Mục tiêu» biến mất khỏi thanh tab và chui vào nút `+` — thanh tab nhảy
 * chỗ, và đường về chỉ còn nằm trong cái menu vốn để *thêm loại nội dung mới*.
 */
export const DEFAULT_AREA_TAB: AreaTab = "goals";

/**
 * Đọc `?tab=` từ URL. Giá trị lạ (gõ tay, link cũ) rơi về tab mặc định thay vì
 * render ra một trang chỉ có thanh tab và không có nội dung nào bên dưới.
 */
export function toAreaTab(raw: string | string[] | undefined): AreaTab {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return TABS.some((t) => t.key === v) ? (v as AreaTab) : DEFAULT_AREA_TAB;
}

export function AreaTabs({
  slug,
  current,
  counts,
}: {
  slug: string;
  current: AreaTab;
  counts: Record<AreaTab, number>;
}) {
  const href = (k: AreaTab) =>
    k === DEFAULT_AREA_TAB ? `/os/a/${slug}` : `/os/a/${slug}?tab=${k}`;

  // Tab đang mở luôn hiện, kể cả khi rỗng — nếu không thì vừa bấm vào đã biến mất.
  // Tab mặc định cũng vậy, vì lý do ngược lại: bấm sang chỗ khác là mất đường về.
  const visible = (t: (typeof TABS)[number]) =>
    counts[t.key] > 0 || t.key === current || t.key === DEFAULT_AREA_TAB;

  const shown = TABS.filter(visible);
  const hidden = TABS.filter((t) => !visible(t));

  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-line">
      {shown.map((t) => {
        const on = t.key === current;
        return (
          <Link
            key={t.key}
            href={href(t.key)}
            scroll={false}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 text-[14px] transition-colors ${
              on
                ? "border-ink font-medium text-ink"
                : "border-transparent text-ink-2 hover:text-ink"
            }`}
          >
            {t.label}
            {counts[t.key] > 0 && (
              <span className="ml-1.5 text-[12px] tabular-nums text-ink-3">
                {counts[t.key]}
              </span>
            )}
          </Link>
        );
      })}

      {hidden.length > 0 && (
        <details className="relative -mb-px shrink-0">
          <summary
            aria-label="Thêm loại nội dung"
            title="Thêm loại nội dung"
            className="flex cursor-pointer list-none items-center border-b-2 border-transparent px-3 py-2.5 text-ink-3 transition-colors hover:text-ink [&::-webkit-details-marker]:hidden"
          >
            <Plus size={15} strokeWidth={2} />
          </summary>

          {/* Đổ xuống dưới thanh tab. Có shadow vì đây là phần tử nổi —
              PLAN §4.5 cho phép shadow đúng ở những chỗ như thế này. */}
          <div className="absolute left-0 top-full z-10 mt-1 w-[min(20rem,78vw)] rounded-[var(--radius-lg)] border border-line bg-bg p-1 shadow-lg">
            {hidden.map((t) => (
              <Link
                key={t.key}
                href={href(t.key)}
                scroll={false}
                className="block rounded-[var(--radius-md)] px-3 py-2 transition-colors hover:bg-surface-2"
              >
                <span className="block text-[14px] font-medium">{t.label}</span>
                <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-3">
                  {t.hint}
                </span>
              </Link>
            ))}
          </div>
        </details>
      )}
    </nav>
  );
}
