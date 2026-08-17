import fs from "node:fs/promises";
import path from "node:path";
import * as fontkit from "fontkit";
import { cvFontkit } from "./cv-fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { cv, experiences } from "./cv";
import { t, type Lang } from "./i18n";
import { site } from "./site";

/**
 * Sinh file PDF của CV — bản tiếng Việt và bản tiếng Nhật.
 *
 * ## Vì sao KHÔNG dùng `window.print()` như trước
 *
 * Nút cũ mở hộp thoại in của trình duyệt rồi trông chờ người xem tự chọn "Save
 * as PDF". Ba vấn đề, và cái thứ ba mới là cái nặng:
 *   1. trên điện thoại thì hộp thoại đó gần như không dùng được,
 *   2. lề, đầu trang, số trang do TRÌNH DUYỆT quyết — mỗi máy ra một kiểu,
 *   3. người tuyển dụng bấm "tải CV" là mong nhận được MỘT FILE. Bắt họ đi qua
 *      một hộp thoại in là chỗ rơi rụng, và rơi đúng lúc họ đang quan tâm nhất.
 *
 * ## Vì sao dựng bằng `pdf-lib` chứ không render HTML rồi chụp
 *
 * Chụp HTML thành PDF cần một trình duyệt headless (Puppeteer ~300MB) chạy kèm
 * server. Với một trang cá nhân chạy trên một máy nhỏ thì đó là cái giá quá đắt
 * cho một file hai trang. `pdf-lib` chỉ là thư viện dựng PDF thuần, không tiến
 * trình phụ, không nhị phân ngoài.
 *
 * Đổi lại: KHÔNG có công cụ dàn trang. Mọi thứ trong file này là tọa độ tính
 * tay — xuống dòng, ngắt trang, căn phải đều phải tự viết. Đó là lý do file dài
 * hơn vẻ ngoài của nó.
 *
 * ## MỘT bộ font cho cả hai bản — và vì sao đó không phải là lười
 *
 * `assets/fonts/` chỉ giữ **Noto Sans JP** (Regular + Bold), dùng cho cả bản
 * Việt lẫn bản Nhật.
 *
 * Bản đầu tiên dùng hai bộ: Noto Sans (nhẹ hơn 10 lần, phần Latin đẹp hơn) cho
 * bản Việt, Noto Sans JP cho bản Nhật. Nghe hợp lý cho tới khi `assertGlyphs()`
 * bên dưới chạy lần đầu và bắt được:
 *
 *     "Tối ưu UX/UI từ Figma → Angular"   ← Noto Sans KHÔNG có glyph cho `→`
 *
 * pdf-lib không ném lỗi trong trường hợp này — nó vẽ ra một ô trống. Nghĩa là
 * CV tiếng Việt đã có thể ra lò với một mũi tên biến mất giữa câu, và người
 * phát hiện ra sẽ là nhà tuyển dụng chứ không phải chủ nhân.
 *
 * Noto Sans JP phủ đủ CẢ BA thứ cần: Latin, dấu tiếng Việt (ệ, ữ, ộ), và
 * kana/kanji. Một bộ font thì không còn cái vách nào để rơi qua. Cái giá là
 * bản Việt phải phân tích một file 5.3MB lúc dựng lần đầu (~300ms, sau đó nằm
 * trong bộ đệm) — rẻ hơn nhiều so với một chữ mất tích trong hồ sơ xin việc.
 *
 * `subset: true` cắt font nhúng còn đúng glyph dùng tới, nên file PDF ra vẫn
 * chỉ vài chục KB chứ không phải 5MB.
 */

/* ── Khổ giấy & lề (đơn vị point, A4) ───────────────────────── */
const A4 = { w: 595.28, h: 841.89 };
const M = 46; // lề bốn phía
const CONTENT_W = A4.w - M * 2;
/** Ranh giới dưới: dưới mức này là chừa chỗ cho chân trang. */
const FLOOR = M + 24;

/* ── Màu: lấy đúng token của site, viết lại ở dạng rgb() ──────
   Không đọc được biến CSS từ đây, nhưng đây là các màu ĐANG dùng trên web
   (`--color-ink`, `--color-ink-2`, `--color-accent`) — CV in ra và CV trên
   web phải trông như cùng một thứ. */
const INK = rgb(0.078, 0.071, 0.055); // #14120e
const INK_2 = rgb(0.42, 0.4, 0.36); // #6b665c
const INK_3 = rgb(0.63, 0.6, 0.55); // #a09a8d
const LINE = rgb(0.878, 0.855, 0.804); // #e0dacd
const ACCENT = rgb(0.145, 0.388, 0.922); // #2563eb

/* ── Thang chữ ──────────────────────────────────────────────── */
const S = {
  name: 21,
  role: 11,
  section: 8.5,
  h3: 11,
  body: 9.3,
  small: 8.2,
};

/** Giãn dòng. 1.45 cho cả hai ngôn ngữ — chữ Nhật cao hơn nhưng dày hơn, thử
    nới lên 1.6 thì bản Nhật loãng ra chứ không dễ đọc hơn. */
const LH = 1.45;

type Fonts = { regular: PDFFont; bold: PDFFont };
type Cursor = { doc: PDFDocument; page: PDFPage; y: number; fonts: Fonts; lang: Lang };

type TextOpts = {
  size?: number;
  bold?: boolean;
  color?: ReturnType<typeof rgb>;
  x?: number;
  maxW?: number;
  /** Ngôn ngữ của CHÍNH chuỗi này — tên công ty, stack luôn là Latin. */
  lang?: Lang;
};

/* ── Đọc font từ đĩa, nhớ lại sau lần đầu ─────────────────────
   Hai file gộp lại 10.6MB. Đọc lại mỗi lượt tải là 10.6MB I/O cho một file
   20KB, nên giữ luôn trong bộ nhớ tiến trình — CV không đổi giữa hai lần
   khởi động server. */
const fontCache = new Map<string, Buffer>();

async function fontBytes(file: string): Promise<Buffer> {
  const hit = fontCache.get(file);
  if (hit) return hit;
  const buf = await fs.readFile(path.join(process.cwd(), "assets", "fonts", file));
  fontCache.set(file, buf);
  return buf;
}

/* ══ NGẮT DÒNG ═══════════════════════════════════════════════

   Hai luật, vì hai ngôn ngữ ngắt dòng khác nhau về bản chất:

   Latin  — chỉ ngắt ở khoảng trắng. Ngắt giữa từ là sai chính tả.
   Nhật   — ngắt được ở gần như mọi ký tự, vì tiếng Nhật không có khoảng
            trắng giữa từ. Áp luật Latin cho tiếng Nhật thì cả đoạn thành một
            "từ" dài vô tận và tràn thẳng ra khỏi mép giấy.

   NHƯNG câu tiếng Nhật ở đây có lẫn tên công nghệ Latin, và luật "ngắt được ở
   mọi ký tự" cắt chúng làm đôi — bản nháp đầu tiên đã cho ra đúng như vậy:

       ...クリーンな設計（Service-Repository、Qu
       eue/Event）、性能最適化...

   Nên bước tách token phải giữ NGUYÊN mỗi cụm Latin: `tokenize()` gom
   `[chữ số Latin + - _ / . + & ']` thành một khối, mọi ký tự khác đứng riêng
   một mình. Sau đó luật ngắt áp lên token chứ không lên ký tự. */

/** Chữ cái/chữ số Latin, kể cả chữ có dấu tiếng Việt. */
const LATIN = /[0-9A-Za-zÀ-ɏḀ-ỿ]/;
/** Dấu nối chỉ dính vào token khi nằm GIỮA hai ký tự Latin: `CI/CD`, `S3+Cloud`. */
const GLUE = /[-_/.+&'’]/;

/** Không được đứng đầu dòng (禁則処理 — bản rút gọn, chỉ phần dấu câu). */
const NO_LINE_START = "、。」）』】〉》・ー？！,.:;)]}";

function tokenize(s: string): string[] {
  const out: string[] = [];
  let buf = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const glued = GLUE.test(ch) && buf !== "" && LATIN.test(s[i + 1] ?? "");
    if (LATIN.test(ch) || glued) {
      buf += ch;
      continue;
    }
    if (buf) {
      out.push(buf);
      buf = "";
    }
    out.push(ch);
  }
  if (buf) out.push(buf);
  return out;
}

function wrap(text: string, font: PDFFont, size: number, maxW: number, lang: Lang): string[] {
  if (!text) return [];
  const width = (s: string) => font.widthOfTextAtSize(s, size);
  const lines: string[] = [];

  /** Cắt cứng một token dài hơn cả dòng (URL, chuỗi kanji liền không dấu). */
  const hardSplit = (tk: string): string[] => {
    const parts: string[] = [];
    let rest = tk;
    while (width(rest) > maxW && rest.length > 1) {
      let cut = rest.length;
      while (cut > 1 && width(rest.slice(0, cut)) > maxW) cut--;
      parts.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }
    parts.push(rest);
    return parts;
  };

  const tokens =
    lang === "ja"
      ? tokenize(text)
      : // Latin: token = một từ, và khoảng trắng tự tái tạo lúc ghép.
        text.split(/\s+/).flatMap((w, i) => (i === 0 ? [w] : [" ", w]));

  let line = "";
  for (const raw of tokens) {
    for (const tk of width(raw) > maxW ? hardSplit(raw) : [raw]) {
      if (!line) {
        // Khoảng trắng / dấu câu rơi vào đầu dòng thì bỏ, không thụt lề vô cớ.
        line = tk === " " ? "" : tk;
        continue;
      }
      if (width(line + tk) <= maxW) {
        line += tk;
        continue;
      }
      // Dấu câu không được mở dòng mới → giữ nó lại ở dòng trên, chấp nhận
      // dòng đó thò ra vài point. Đây là đánh đổi CHUẨN của 禁則処理.
      if (NO_LINE_START.includes(tk)) {
        lines.push(line + tk);
        line = "";
        continue;
      }
      lines.push(line.trimEnd());
      line = tk === " " ? "" : tk;
    }
  }
  if (line.trim()) lines.push(line.trimEnd());
  return lines;
}

/* ══ NGUYÊN THỦY VẼ ══════════════════════════════════════════ */

function newPage(c: Cursor) {
  c.page = c.doc.addPage([A4.w, A4.h]);
  c.y = A4.h - M;
}

/**
 * Chừa chỗ cho `h` point tiếp theo; hết chỗ thì sang trang mới.
 *
 * Gọi TRƯỚC khi vẽ, không phải sau — kiểm tra sau là đã vẽ mất rồi, và dòng
 * cuối trang sẽ đè lên lề dưới. Lỗi đó chỉ lộ ra khi nội dung dài đúng một
 * ngưỡng nhất định, nên rất dễ tưởng là đã ổn.
 */
function need(c: Cursor, h: number) {
  if (c.y - h < FLOOR) newPage(c);
}

/** Đo trước một đoạn chiếm bao nhiêu chiều cao — để `need()` cả khối một lần. */
function heightOf(c: Cursor, s: string, o: TextOpts = {}): number {
  const size = o.size ?? S.body;
  const font = o.bold ? c.fonts.bold : c.fonts.regular;
  const x = o.x ?? M;
  const maxW = o.maxW ?? A4.w - M - x;
  return wrap(s, font, size, maxW, o.lang ?? c.lang).length * size * LH;
}

function text(c: Cursor, s: string, o: TextOpts = {}) {
  const size = o.size ?? S.body;
  const font = o.bold ? c.fonts.bold : c.fonts.regular;
  const x = o.x ?? M;
  const maxW = o.maxW ?? A4.w - M - x;

  for (const line of wrap(s, font, size, maxW, o.lang ?? c.lang)) {
    need(c, size * LH);
    c.page.drawText(line, { x, y: c.y - size, size, font, color: o.color ?? INK });
    c.y -= size * LH;
  }
}

/** Một dòng đơn căn PHẢI (kỳ hạn công việc, năm học). Không tự xuống dòng. */
function textRight(c: Cursor, s: string, y: number, size = S.small, color = INK_3) {
  const font = c.fonts.regular;
  c.page.drawText(s, {
    x: A4.w - M - font.widthOfTextAtSize(s, size),
    y,
    size,
    font,
    color,
  });
}

function rule(c: Cursor, gapAbove = 6, gapBelow = 9) {
  c.y -= gapAbove;
  c.page.drawLine({
    start: { x: M, y: c.y },
    end: { x: A4.w - M, y: c.y },
    thickness: 0.6,
    color: LINE,
  });
  c.y -= gapBelow;
}

/** Tiêu đề mục: chữ hoa nhỏ + gạch ngang hết bề ngang. */
function section(c: Cursor, title: string) {
  // 52pt: đủ cho nhãn + gạch + một dòng nội dung. Ngắt trang ngay dưới một
  // tiêu đề mục là lỗi dàn trang kinh điển — tiêu đề mồ côi ở đáy trang.
  need(c, 52);
  c.y -= 12;
  // `toUpperCase()` chỉ đổi chữ Latin; tiếng Nhật không có chữ hoa nên bản JA
  // đi qua đây không suy suyển gì — không cần rẽ nhánh.
  text(c, title.toUpperCase(), { size: S.section, bold: true, color: INK_3 });
  rule(c, 2, 10);
}

/**
 * Gạch đầu dòng.
 *
 * ⚠️ Mỗi gạch phải nằm TRỌN trong một trang: đo trước bằng `heightOf` rồi mới
 * `need`. Bản nháp đầu tiên vẽ chấm tròn xong mới để `text()` tự ngắt trang,
 * nên chấm ở lại trang trước còn chữ sang trang sau — và tệ hơn, nó có một
 * nhánh `break` khi phát hiện đã sang trang, tức là **những gạch còn lại biến
 * mất khỏi CV mà không báo gì**.
 */
function bullets(c: Cursor, items: readonly string[]) {
  for (const b of items) {
    const h = heightOf(c, b, { x: M + 11, color: INK_2 });
    need(c, h);
    c.page.drawCircle({ x: M + 3.2, y: c.y - S.body * 0.62, size: 1.3, color: INK_3 });
    text(c, b, { x: M + 11, color: INK_2 });
    c.y -= 2;
  }
}

/** Hàng "nhãn ─ giá trị" của phần Kỹ năng / Ngôn ngữ. */
function labelValue(c: Cursor, label: string, value: string, labelW = 104) {
  const h = Math.max(heightOf(c, value, { x: M + labelW }), S.body * LH);
  need(c, h);

  c.page.drawText(label, {
    x: M,
    y: c.y - S.body,
    size: S.body,
    font: c.fonts.bold,
    color: INK,
  });

  const y0 = c.y;
  text(c, value, { x: M + labelW, color: INK_2 });
  // Giá trị rỗng thì `text()` không vẽ gì và con trỏ đứng yên — tự nhích để
  // nhãn tiếp theo không đè lên nhãn này.
  if (c.y === y0) c.y -= S.body * LH;
  c.y -= 3;
}

/* ══ KIỂM GLYPH ══════════════════════════════════════════════
   Ký tự thiếu glyph không ném lỗi — pdf-lib vẽ ra ô trống. Trên một CV thì đó
   là kiểu hỏng đắt nhất: file trông vẫn "được", chỉ có một hai chữ biến mất,
   và người phát hiện ra là nhà tuyển dụng chứ không phải chủ nhân.

   Chỉ chạy ngoài production: nó phân tích lại font 5MB, mà nội dung CV chỉ đổi
   khi có người sửa `lib/cv.ts` — tức là lúc đang dev. */
function assertGlyphs(bytes: Buffer, strings: string[], fontName: string) {
  if (process.env.NODE_ENV === "production") return;
  const font = fontkit.create(bytes);
  const missing = new Set<string>();
  for (const s of strings) {
    for (const ch of s) {
      if (ch === "\n" || ch === " ") continue;
      if (!font.hasGlyphForCodePoint(ch.codePointAt(0)!)) missing.add(ch);
    }
  }
  if (missing.size > 0) {
    throw new Error(
      `CV PDF: font ${fontName} không có glyph cho ${[...missing].join(" ")} — ` +
        `chữ đó sẽ thành ô trống trong file tải về. Sửa nội dung hoặc đổi font.`,
    );
  }
}

/* ══ DỰNG CẢ FILE ════════════════════════════════════════════ */

/** Mọi chuỗi sẽ được vẽ — dùng cho `assertGlyphs`. */
function allStrings(lang: Lang): string[] {
  const ja = lang === "ja";
  return [
    cv.name[lang],
    ja ? cv.name.vi : cv.kana,
    cv.title[lang],
    cv.birthDate,
    cv.nationality[lang],
    cv.email,
    cv.address[lang],
    cv.summary[lang],
    site.domain,
    ...Object.values(t.cv).map((v) => v[lang]),
    ...experiences.flatMap((e) => [
      e.company,
      ja ? e.roleJa : e.role,
      e.period,
      ...(ja ? e.bulletsJa : e.bullets),
      ...e.stack,
    ]),
    ...cv.skills.flatMap((g) => [g.label[lang], ...g.items]),
    ...cv.education.flatMap((ed) => [ed.school[lang], ed.major[lang], ed.note, ed.period]),
    ...cv.languages.flatMap((l) => [l.label[lang], l.level[lang]]),
  ];
}

async function build(lang: Lang): Promise<Uint8Array> {
  const ja = lang === "ja";
  const doc = await PDFDocument.create();
  // fontkit v2 qua lớp đệm, KHÔNG phải `@pdf-lib/fontkit` — bộ cắt font của
  // bản v1 làm hỏng glyph ghép và xóa mất hơn nửa số chữ mà không báo lỗi.
  // Lý do đầy đủ + số đo ở `lib/cv-fontkit.ts`.
  // `as never`: pdf-lib khai kiểu `Fontkit` theo đúng hình dạng của
  // `@pdf-lib/fontkit` v1. fontkit v2 có đủ mọi thứ pdf-lib GỌI tới, chỉ khác
  // ở những thuộc tính pdf-lib không bao giờ đụng đến. Ép kiểu ở đúng một dòng
  // này, và `npm run check:cv` là thứ kiểm chứng rằng phép ép đó đúng.
  doc.registerFontkit(cvFontkit as never);

  const [regBytes, boldBytes] = await Promise.all([
    fontBytes("NotoSansJP-Regular.ttf"),
    fontBytes("NotoSansJP-Bold.ttf"),
  ]);

  assertGlyphs(regBytes, allStrings(lang), "NotoSansJP");

  const fonts: Fonts = {
    // `subset: true` — chỉ nhúng glyph thật sự dùng. Thiếu nó thì bản tiếng
    // Nhật ra file 5MB cho hai trang giấy.
    regular: await doc.embedFont(regBytes, { subset: true }),
    bold: await doc.embedFont(boldBytes, { subset: true }),
  };

  const c: Cursor = { doc, page: doc.addPage([A4.w, A4.h]), y: A4.h - M, fonts, lang };

  doc.setTitle(`${cv.name[lang]} — ${cv.title[lang]}`);
  doc.setAuthor(cv.name[lang]);
  doc.setSubject(t.cv.title[lang]);
  doc.setCreator(site.url);

  /* ── Đầu CV ── */
  /**
   * Tên ở HAI dạng chữ, dạng nào lớn tùy bản.
   *
   * Bản nháp đầu in `cv.name[lang]` rồi in thêm `cv.kana` — mà ở bản tiếng
   * Nhật `cv.name.ja` CHÍNH LÀ chuỗi kana đó, nên nó ra hai dòng giống hệt
   * nhau nằm chồng lên nhau.
   *
   * Dạng còn lại mới là thứ đáng in: người Nhật đọc CV cần biết tên trên hộ
   * chiếu viết ra sao (để soạn hợp đồng), còn bản tiếng Việt lọt vào tay một
   * nhà tuyển dụng Nhật thì dòng kana cho họ biết phải ĐỌC tên này thế nào.
   * Cùng một chỗ, hai lý do khác nhau, đều thật.
   */
  text(c, cv.name[lang], { size: S.name, bold: true });
  text(c, ja ? cv.name.vi : cv.kana, { size: S.small, color: INK_3 });
  c.y -= 2;
  text(c, cv.title[lang], { size: S.role, color: INK_2 });

  c.y -= 4;
  rule(c, 6, 10);

  /* Bốn dữ kiện cá nhân, HAI CỘT — bốn dòng cho bốn chuỗi ngắn là phí nửa
     trang giấy đầu tiên, mà nửa trang đầu là chỗ đắt nhất của một CV. */
  const facts: [string, string][] = [
    [t.cv.birth[lang], cv.birthDate],
    [t.cv.nationality[lang], cv.nationality[lang]],
    [t.cv.email[lang], cv.email],
    [t.cv.address[lang], cv.address[lang]],
  ];
  const colW = CONTENT_W / 2;
  for (let i = 0; i < facts.length; i += 2) {
    need(c, S.body * 1.5);
    const yLine = c.y - S.body;
    for (const [j, pair] of [facts[i], facts[i + 1]].entries()) {
      if (!pair) continue;
      const x = M + j * colW;
      c.page.drawText(pair[0], {
        x,
        y: yLine,
        size: S.small,
        font: c.fonts.regular,
        color: INK_3,
      });
      c.page.drawText(pair[1], {
        x: x + 62,
        y: yLine,
        size: S.body,
        font: c.fonts.regular,
        color: INK,
      });
    }
    c.y -= S.body * 1.5;
  }

  /* ── Tóm tắt ── */
  section(c, t.cv.summary[lang]);
  text(c, cv.summary[lang], { color: INK_2 });

  /* ── Kinh nghiệm ── */
  section(c, t.cv.experience[lang]);
  for (const [i, e] of experiences.entries()) {
    if (i > 0) c.y -= 8;
    // Một mục cần ít nhất tên + vai trò + một gạch đầu dòng mới đọc ra là một
    // mục. Ít hơn thế ở đáy trang thì đẩy cả mục sang trang sau.
    need(c, 58);

    const yTitle = c.y - S.h3;
    // Tên công ty là danh từ riêng Latin ở CẢ hai bản.
    c.page.drawText(e.company, {
      x: M,
      y: yTitle,
      size: S.h3,
      font: c.fonts.bold,
      color: INK,
    });
    if (e.period) textRight(c, e.period, yTitle);
    c.y -= S.h3 * 1.4;

    text(c, ja ? e.roleJa : e.role, { size: S.body, color: ACCENT });
    c.y -= 3;
    bullets(c, ja ? e.bulletsJa : e.bullets);

    c.y -= 2;
    // `lang: "vi"` — tên công nghệ là Latin ở cả hai bản, không được để luật
    // ngắt-mọi-ký-tự của tiếng Nhật cắt `CloudFront` làm đôi.
    text(c, e.stack.join("  ·  "), { size: S.small, color: INK_3, lang: "vi" });
  }

  /* ── Kỹ năng ── */
  section(c, t.cv.skills[lang]);
  for (const g of cv.skills) {
    labelValue(c, g.label[lang], g.items.join("  ·  "));
  }

  /* ── Học vấn ── */
  section(c, t.cv.education[lang]);
  for (const ed of cv.education) {
    need(c, 30);
    const yTitle = c.y - S.body;
    c.page.drawText(ed.school[lang], {
      x: M,
      y: yTitle,
      size: S.body,
      font: c.fonts.bold,
      color: INK,
    });
    textRight(c, ed.period, yTitle);
    c.y -= S.body * LH;
    text(c, `${ed.major[lang]} · ${ed.note}`, { size: S.small, color: INK_2 });
  }

  /* ── Ngôn ngữ ── */
  section(c, t.cv.languages[lang]);
  for (const l of cv.languages) {
    labelValue(c, l.label[lang], l.level[lang]);
  }

  /* ── Chân trang: nguồn + số trang ──
     Chạy SAU cùng vì tổng số trang chỉ biết được khi đã vẽ xong tất cả. */
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    const foot = `${site.domain}   ·   ${i + 1}/${pages.length}`;
    p.drawText(foot, {
      x: A4.w - M - fonts.regular.widthOfTextAtSize(foot, 7.5),
      y: M - 16,
      size: 7.5,
      font: fonts.regular,
      color: INK_3,
    });
  });

  return doc.save();
}

/* ══ BỘ NHỚ ĐỆM ══════════════════════════════════════════════
   CV chỉ đổi khi có người sửa `lib/cv.ts` rồi khởi động lại server, nên dựng
   lại mỗi lượt tải là dựng lại đúng byte y hệt. Lần đầu ~300ms (đọc + phân
   tích font 5MB), các lần sau ~0ms.

   ⚠️ Sửa `lib/cv.ts` lúc dev thì Turbopack nạp lại module này và bộ đệm mất
   theo — đúng như mong muốn. Ở production thì phải khởi động lại server. */
const pdfCache = new Map<Lang, Uint8Array>();

export async function cvPdf(lang: Lang): Promise<Uint8Array> {
  const hit = pdfCache.get(lang);
  if (hit) return hit;
  const bytes = await build(lang);
  pdfCache.set(lang, bytes);
  return bytes;
}

/** Tên file người tải nhận được. Không dấu, có ngôn ngữ — để hai bản không đè nhau. */
export function cvFileName(lang: Lang): string {
  return `CV_TruongVanCuong_${lang.toUpperCase()}.pdf`;
}
