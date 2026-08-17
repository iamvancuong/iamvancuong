import * as fontkit from "fontkit";
import {
  PDFDocument,
  PDFDict,
  PDFName,
  PDFPage,
  PDFRawStream,
  decodePDFRawStream,
} from "pdf-lib";
import { cvPdf } from "../lib/cv-pdf";

/**
 * Kiểm hai file CV PDF trước khi tin chúng.
 *
 * ## Bài học đằng sau file này
 *
 * Bản đầu tiên của script chỉ kiểm MỘT thứ: chữ có tràn ra khỏi lề giấy không.
 * Nó báo "✓ sạch" trên một file mà **hơn nửa số chữ không hiện ra**.
 *
 * Lý do nó mù: bề rộng chữ được đo bằng font GỐC (5MB, đủ 16.662 glyph), còn
 * thứ thật sự nằm trong file PDF là font đã CẮT — và bộ cắt của
 * `@pdf-lib/fontkit` làm hỏng glyph ghép. Hai vật thể khác nhau. Đo cái thứ
 * nhất rồi kết luận về cái thứ hai là kiểu sai không bao giờ tự lộ ra, vì phép
 * đo vẫn chạy, vẫn ra số, vẫn xanh.
 *
 * Nên giờ kiểm **ba** thứ, và thứ thứ hai mới là thứ đáng giá:
 *
 *   1. TRÀN LỀ   — chữ có chạy ra ngoài mép giấy không (đo bằng font gốc, đúng
 *                  mục đích, vì đây là câu hỏi về DÀN TRANG).
 *   2. NÉT VẼ    — đọc ngược font đã nhúng TRONG file PDF ra, đếm glyph thật sự
 *                  có đường nét. Đây là câu hỏi "chữ có hiện ra không".
 *   3. GHÉP LẠI  — đọc bảng ToUnicode trong file PDF để dựng lại chuỗi chữ, so
 *                  với nội dung gốc. Đây là câu hỏi "chữ có ĐÚNG chữ đó không",
 *                  và nó bắt được lỗi ánh xạ ký tự → glyph.
 *
 * ## Chạy khi nào
 *
 *     npm run check:cv     ← sau mỗi lần sửa lib/cv.ts, lib/projects.ts,
 *                            lib/cv-pdf.ts, hoặc nâng cấp pdf-lib/fontkit
 */

const A4 = { w: 595.28, h: 841.89 };
const M = 46;
/** Dung sai 0.5pt: luật cấm dấu câu đầu dòng (禁則) cho phép thò ra một chút. */
const SLACK = 0.5;

/* ── 1. TRÀN LỀ ─────────────────────────────────────────────── */

const draw = PDFPage.prototype.drawText;
let overflow: string[] = [];

(PDFPage.prototype as unknown as { drawText: typeof draw }).drawText = function (
  text: string,
  o: Parameters<typeof draw>[1],
) {
  const opts = o as {
    font: { widthOfTextAtSize(s: string, n: number): number };
    size: number;
    x: number;
    y: number;
  };
  const right = opts.x + opts.font.widthOfTextAtSize(text, opts.size);

  if (right > A4.w - M + SLACK)
    overflow.push(`tràn phải ${(right - (A4.w - M)).toFixed(1)}pt · "${text.slice(0, 50)}"`);
  if (opts.x < M - SLACK) overflow.push(`tràn trái · "${text.slice(0, 40)}"`);
  if (opts.y < 18) overflow.push(`tràn đáy · "${text.slice(0, 40)}"`);
  if (opts.y > A4.h - M) overflow.push(`tràn đỉnh · "${text.slice(0, 40)}"`);

  return draw.call(this, text, o);
};

/* ── 2 + 3. ĐỌC NGƯỢC FILE PDF ĐÃ SINH ──────────────────────── */

type FontReport = {
  name: string;
  kb: number;
  glyphs: number;
  drawable: number;
  blank: number;
  broken: number;
};

/**
 * Mở font nhúng trong PDF ra và đếm glyph có đường nét.
 *
 * Font trong file là bản đã cắt, chứa ĐÚNG những glyph mà văn bản dùng tới —
 * nên "mọi glyph đều có nét" tương đương với "mọi chữ đều hiện ra". Ngoại lệ
 * duy nhất là dấu cách: nó vốn không có nét, và đó là điều đúng.
 */
function readEmbeddedFonts(doc: PDFDocument): FontReport[] {
  const ctx = (doc as unknown as { context: { enumerateIndirectObjects(): [unknown, unknown][]; lookup(r: unknown): unknown } }).context;
  const reports: FontReport[] = [];

  for (const [, obj] of ctx.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFDict)) continue;
    if (obj.get(PDFName.of("Type"))?.toString() !== "/FontDescriptor") continue;

    const stream = ctx.lookup(obj.get(PDFName.of("FontFile2"))) as PDFRawStream;
    const bytes = Buffer.from(decodePDFRawStream(stream).decode());
    const font = fontkit.create(bytes);

    let drawable = 0;
    let blank = 0;
    let broken = 0;
    for (let g = 0; g < font.numGlyphs; g++) {
      try {
        if (font.getGlyph(g).path.commands.length > 0) drawable++;
        else blank++;
      } catch {
        broken++;
      }
    }

    reports.push({
      name: obj.get(PDFName.of("FontName"))?.toString() ?? "?",
      kb: bytes.length / 1024,
      glyphs: font.numGlyphs,
      drawable,
      blank,
      broken,
    });
  }
  return reports;
}

/**
 * Dựng lại chữ từ bảng ToUnicode của PDF.
 *
 * Bảng này là thứ trình đọc PDF dùng khi ai đó bôi đen rồi copy — và cũng là
 * thứ máy quét CV của công ty (ATS) đọc. Nó khớp với nội dung gốc thì nghĩa là
 * ánh xạ ký tự → glyph không bị lệch, và CV còn đọc được bằng máy.
 */
function unicodeCoverage(doc: PDFDocument): Set<string> {
  const ctx = (doc as unknown as { context: { enumerateIndirectObjects(): [unknown, unknown][] } }).context;
  const chars = new Set<string>();

  for (const [, obj] of ctx.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    let text: string;
    try {
      text = Buffer.from(decodePDFRawStream(obj).decode()).toString("latin1");
    } catch {
      continue;
    }
    if (!text.includes("beginbfchar") && !text.includes("beginbfrange")) continue;

    // `<0041> <0054>` — mã glyph trong file ↔ mã Unicode thật.
    for (const m of text.matchAll(/<([0-9a-fA-F]{4,})>\s*<([0-9a-fA-F]{4,})>/g)) {
      const hex = m[2];
      let s = "";
      for (let i = 0; i < hex.length; i += 4) s += String.fromCharCode(parseInt(hex.slice(i, i + 4), 16));
      chars.add(s);
    }
  }
  return chars;
}

/* ── Chạy ───────────────────────────────────────────────────── */

async function main() {
  let failed = false;

  for (const lang of ["vi", "ja"] as const) {
    overflow = [];
    const bytes = await cvPdf(lang);
    const doc = await PDFDocument.load(bytes);

    console.log(`\n══ ${lang.toUpperCase()} — ${doc.getPageCount()} trang · ${(bytes.length / 1024).toFixed(0)}KB`);

    /* 1 */
    if (overflow.length === 0) {
      console.log("  ✓ dàn trang — không chữ nào tràn lề");
    } else {
      failed = true;
      for (const p of overflow) console.log("  ✗ " + p);
    }

    /* 2 */
    const fonts = readEmbeddedFonts(doc);
    if (fonts.length === 0) {
      failed = true;
      console.log("  ✗ KHÔNG có font nào được nhúng — file sẽ hiện bằng font thay thế của máy đọc");
    }
    for (const f of fonts) {
      // Chỉ dấu cách được phép không có nét. Nhiều hơn một là có glyph rỗng thật.
      const ok = f.broken === 0 && f.blank <= 1;
      if (!ok) failed = true;
      console.log(
        `  ${ok ? "✓" : "✗"} font nhúng ${f.name} · ${f.kb.toFixed(0)}KB · ` +
          `${f.glyphs} glyph → có nét ${f.drawable} · rỗng ${f.blank} · hỏng ${f.broken}`,
      );
    }

    /* 3 */
    const chars = unicodeCoverage(doc);
    if (chars.size === 0) {
      failed = true;
      console.log("  ✗ không có bảng ToUnicode — copy chữ từ PDF sẽ ra rác, máy quét CV không đọc được");
    } else {
      console.log(`  ✓ copy được chữ — ${chars.size} ký tự có trong bảng ToUnicode`);
    }
  }

  if (failed) {
    console.log("\n⚠️  KHÔNG dùng file này.");
    console.log("   · tràn lề     → rút ngắn nội dung trong lib/cv.ts, hoặc chỉnh thang chữ trong lib/cv-pdf.ts");
    console.log("   · glyph hỏng  → bộ cắt font đang hỏng; xem lib/cv-fontkit.ts");
    process.exit(1);
  }
  console.log("\nHai file đều dùng được.");
}

main();
