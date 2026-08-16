import { Inter, JetBrains_Mono, Noto_Sans_JP } from "next/font/google";

/**
 * Latin + Việt.  `latin-ext` và `vietnamese` là bắt buộc — thiếu sẽ vỡ dấu
 * chồng dấu (ề, ữ, ộ).
 */
export const inter = Inter({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Tiếng Nhật.  Chỉ khai báo subset "latin" — glyph kanji/kana được nạp qua
 * unicode-range nên trình duyệt chỉ tải khi trang thực sự có chữ Nhật.
 * Trang tiếng Việt không phải trả phí băng thông cho font Nhật.
 */
export const notoJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jp",
  display: "swap",
});

/**
 * Monospace — CHỈ cho nhãn nhỏ chữ hoa (`01 / VỀ TÔI`, `// TECH_STACK`,
 * `SYSTEM STATUS`), không dùng cho nội dung đọc.
 *
 * Đây là thứ tạo ra cả cái chất "bảng điều khiển" của giao diện mới: chữ hoa
 * giãn rộng bằng font đều nét đọc ra là NHÃN KỸ THUẬT, còn cùng dòng đó bằng
 * Inter thì chỉ là chữ nhỏ màu nhạt. Khác biệt nằm ở font, không ở màu.
 *
 * Chỉ hai độ đậm (400/500) và chỉ subset latin: nhãn không bao giờ có tiếng
 * Nhật, và tải cả họ font cho vài chục chữ là phí băng thông thật.
 */
export const mono = JetBrains_Mono({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});
