/**
 * Khai báo kiểu cho `fontkit` v2 — gói này không kèm file `.d.ts`, và không có
 * `@types/fontkit` nào khớp với bản 2.x.
 *
 * Chỉ khai đúng phần dự án dùng tới, không khai cả thư viện: một khai báo rộng
 * kiểu `declare module "fontkit"` (ngầm thành `any`) thì TypeScript im lặng
 * với MỌI cách gọi sai, kể cả những cách sẽ hỏng lúc chạy. Khai hẹp thì phần
 * chưa khai sẽ báo lỗi ngay khi có người bắt đầu dùng tới nó — đó là lúc đáng
 * để dừng lại và đọc tài liệu.
 *
 * ⚠️ TypeScript giải ra `dist/browser-module.mjs` (do `moduleResolution:
 * "bundler"` ưu tiên điều kiện `browser`), còn Node lúc chạy lấy bản `node`.
 * Hai bản có cùng API cho những gì dùng ở đây, nhưng đó là lý do phải kiểm
 * bằng `npm run check:cv` chứ không tin vào việc `tsc` sạch.
 */
declare module "fontkit" {
  /** Đường nét của một glyph. Rỗng = ký tự không vẽ ra gì (ví dụ dấu cách). */
  export interface Path {
    commands: unknown[];
  }

  export interface Glyph {
    id: number;
    path: Path;
  }

  /** Font đã cắt gọn, chỉ giữ những glyph được thêm vào. */
  export interface Subset {
    /** Trả về ID MỚI của glyph trong bản đã cắt (khác ID trong font gốc). */
    includeGlyph(glyph: Glyph | number): number;
    encode(): Uint8Array;
  }

  export interface Font {
    numGlyphs: number;
    hasGlyphForCodePoint(codePoint: number): boolean;
    glyphForCodePoint(codePoint: number): Glyph;
    getGlyph(id: number): Glyph;
    createSubset(): Subset;
  }

  export function create(buffer: Buffer | Uint8Array): Font;
}
