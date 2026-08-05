import { Inter, Noto_Sans_JP } from "next/font/google";

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
