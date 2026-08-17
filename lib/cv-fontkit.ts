import { EventEmitter } from "node:events";
import * as fontkit2 from "fontkit";

/**
 * Lớp đệm để pdf-lib dùng **fontkit v2** thay cho `@pdf-lib/fontkit` v1.
 *
 * ## Vì sao phải có file này
 *
 * `@pdf-lib/fontkit` là bản rẽ nhánh của fontkit v1.1.1 (2019). Bộ cắt font
 * của nó **làm hỏng glyph ghép** — chữ có dấu (ế, ộ, ữ) và một phần chữ Latin
 * trong Noto Sans JP đều là glyph ghép: một glyph "cơ sở" cộng một glyph "dấu",
 * ghép lại bằng cách tham chiếu tới ID của glyph khác. Cắt font mà không kéo
 * theo các glyph thành phần thì tham chiếu trỏ ra ngoài, và **glyph đó không
 * vẽ ra gì cả**.
 *
 * Đo được bằng số, trên đúng file CV đã sinh ra:
 *
 *     @pdf-lib/fontkit v1   138 glyph →  61 có nét ·  9 rỗng · 68 LỖI
 *     fontkit v2             72 glyph →  72 có nét ·  0 rỗng ·  0 lỗi
 *
 * Và không có lỗi nào được ném ra ở giữa. File PDF vẫn mở được, vẫn đúng số
 * trang, vẫn đúng bề rộng từng dòng — chỉ là **hơn nửa số chữ biến mất**.
 * `assertGlyphs()` trong `cv-pdf.ts` không bắt được vì nó kiểm font GỐC, mà
 * font gốc thì đủ glyph; chỗ hỏng nằm ở bước cắt phía sau.
 *
 * Cách chắc chắn duy nhất để biết là **đọc ngược font đã nhúng trong file PDF
 * ra và đếm glyph có nét** — đó chính là việc `npm run check:cv` làm.
 *
 * ## Vì sao là một lớp đệm chứ không phải đổi thẳng thư viện
 *
 * pdf-lib gọi đúng bốn thứ trên đối tượng fontkit:
 *
 *     fontkit.create(bytes)      ✓ v2 có
 *     font.createSubset()        ✓ v2 có
 *     subset.includeGlyph(g)     ✓ v2 có, cùng ngữ nghĩa (trả về ID mới)
 *     subset.encodeStream()      ✗ v2 đổi thành encode() trả về Uint8Array
 *
 * Nên chỉ thiếu đúng một hàm. Bọc lại một hàm rẻ hơn nhiều so với việc tự cắt
 * font ra file rồi commit — cách đó cần thêm một bước dựng, thêm hai file nhị
 * phân trong repo, và thêm một cơ hội để font commit sẵn lệch khỏi nội dung
 * trong `lib/cv.ts`.
 *
 * ⚠️ Lớp đệm này bám vào chi tiết BÊN TRONG của pdf-lib 1.17.1
 * (`CustomFontSubsetEmbedder.serializeFont`). pdf-lib gần như không còn ra bản
 * mới, nhưng nếu nâng cấp nó thì `npm run check:cv` là chỗ phát hiện ra ngay.
 */

/** `Subset` của fontkit v2, cộng thêm hàm mà pdf-lib đòi. */
type StreamingSubset = fontkit2.Subset & { encodeStream?: () => EventEmitter };

/**
 * pdf-lib đọc kết quả cắt font qua một luồng dữ liệu kiểu Node
 * (`.on('data')` / `.on('end')`), còn fontkit v2 trả về thẳng một mảng byte.
 * Dựng một `EventEmitter` phát đúng một lần rồi kết thúc.
 *
 * `queueMicrotask`: phải phát SAU khi phía gọi kịp đăng ký `.on(...)`. Phát
 * đồng bộ ngay trong `encodeStream()` thì không ai nghe, và `serializeFont()`
 * treo mãi mãi — một lời hứa không bao giờ được giải quyết, không lỗi, không
 * timeout. Trang tải PDF sẽ chỉ đơn giản là quay mãi.
 */
function withEncodeStream(subset: StreamingSubset): StreamingSubset {
  subset.encodeStream = () => {
    const out = new EventEmitter();
    queueMicrotask(() => {
      try {
        out.emit("data", subset.encode());
        out.emit("end");
      } catch (err) {
        out.emit("error", err);
      }
    });
    return out;
  };
  return subset;
}

export const cvFontkit = {
  create(bytes: Buffer | Uint8Array) {
    const font = fontkit2.create(bytes);

    const original = font.createSubset.bind(font);
    font.createSubset = () => withEncodeStream(original());

    return font;
  },
};
