/**
 * Nhãn đánh số của một mục: `01 ——— VỀ TÔI / ABOUT`.
 *
 * Ba phần, mỗi phần làm một việc:
 *   số     — cho biết đang ở mục thứ mấy, và còn mấy mục nữa
 *   gạch   — tách số khỏi chữ, và neo nhãn vào mép trái của cột nội dung
 *   nhãn   — tên mục bằng tiếng Việt, kèm bản tiếng Anh sau dấu `/`
 *
 * Cặp Việt/Anh KHÔNG phải là song ngữ theo nghĩa của `LangProvider` — nút đổi
 * ngôn ngữ vẫn đổi toàn bộ nội dung thật. Ở đây bản tiếng Anh chỉ là một phần
 * của hình ảnh, giống nhãn dán trên thiết bị: nó khiến dòng nhãn đọc ra là mã
 * hiệu chứ không phải một câu.
 *
 * Dùng `.tag` (mono + hoa + giãn chữ) — xem globals.css để biết vì sao ba
 * thuộc tính đó phải đi cùng nhau.
 */
export function SectionLabel({
  index,
  children,
  en,
}: {
  /** Số thứ tự, tự đệm 0: 1 → `01`. */
  index: number;
  children: string;
  /** Bản tiếng Anh, hiện sau dấu `/`. Bỏ trống thì chỉ hiện phần tiếng Việt. */
  en?: string;
}) {
  return (
    <div className="tag flex items-center gap-3">
      <span className="text-accent">{String(index).padStart(2, "0")}</span>
      {/* Gạch ngang cố định 40px, không co giãn: nó là dấu phân cách, mà dấu
          phân cách dài ngắn khác nhau ở mỗi mục thì mắt đọc ra là lỗi. */}
      <span className="h-px w-10 bg-line" aria-hidden />
      <span>
        {children}
        {en && <span className="text-ink-3/70"> / {en}</span>}
      </span>
    </div>
  );
}
