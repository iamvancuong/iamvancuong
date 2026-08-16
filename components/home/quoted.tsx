import { Fragment } from "react";

/**
 * Tô màu nhấn cho cụm nằm trong NGOẶC KÉP của một câu.
 *
 * Khẩu hiệu là `Trưa lên lớp, chiều baito, tối "thỉnh thoảng" code.` — cụm
 * trong ngoặc kép chính là chỗ tự trào, là câu đùa của cả câu. Tô nó lên thì
 * người đọc bắt được giọng ngay ở dòng đầu; để đen trơn thì nó chìm nghỉm
 * giữa một câu dài.
 *
 * ## Vì sao viết bằng mã Unicode
 *
 * Bắt cả ngoặc thẳng (U+0022) lẫn ngoặc cong (U+201C / U+201D): bản tiếng Việt
 * gõ tay dùng loại nào cũng có, và bản tiếng Nhật dùng 「」. Nếu chỉ bắt một
 * loại thì câu kia mất điểm nhấn mà KHÔNG có lỗi nào báo.
 *
 * Dán ký tự cong thẳng vào biểu thức thì rất dễ bị một công cụ nào đó trên
 * đường đi nắn về ngoặc thẳng — lúc đó biểu thức vẫn chạy nhưng thôi khớp, và
 * hỏng kiểu đó không có cách nào phát hiện ngoài việc nhìn bằng mắt.
 *
 * Không có ngoặc kép thì trả nguyên câu: mọi bản dịch tương lai vẫn hiện đúng,
 * chỉ là không có chữ nào được tô.
 */
// " thẳng · “ ” cong · 「 」 kiểu Nhật 「」
const OPEN = '"“「';
const CLOSE = '"”」';

const RE = new RegExp(`([${OPEN}][^${OPEN}${CLOSE}]*[${CLOSE}])`);

export function quoted(text: string) {
  return text.split(RE).map((part, i) =>
    new RegExp(`^[${OPEN}]`).test(part) ? (
      <span key={i} className="text-accent">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
