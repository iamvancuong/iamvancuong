"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MapPin } from "lucide-react";
import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";
import { site } from "@/lib/site";
import { PhotoGrid } from "@/components/PhotoGrid";
import type { LightboxPhoto } from "@/components/Lightbox";
import { PageHeader } from "@/components/layout/PageHeader";
import type { TimelineRow } from "@/lib/timeline";

export type JourneyMemory = {
  id: string;
  dateISO: string;
  dateLabel: string;
  title: string;
  body: string | null;
  learned: string | null;
  place: string | null;
  area: string | null;
  photos: LightboxPhoto[];
};

/** Ký ức gom theo `"<năm>-<tháng>"` — đúng khóa mà ô tháng tra bằng. */
export type MemoriesByMonth = Record<string, JourneyMemory[]>;

/**
 * Trang Hành trình — MỘT chuỗi dài, mở ra được hai tầng: NĂM → THÁNG → ký ức.
 *
 * ## Vì sao gộp thành một chuỗi
 *
 * Bản trước có HAI khối xếp chồng: một khung năm (ô tháng, để nhìn tổng thể) và
 * bên dưới là danh sách chi tiết từng năm. Nghĩa là mỗi năm xuất hiện **hai
 * lần**, ở hai hình dạng khác nhau — người xem đọc "2024" ở khối trên rồi lại
 * gặp "2024" ở khối dưới và phải tự nối hai thứ đó lại với nhau.
 *
 * Gộp lại thì ô tháng không còn là hình trang trí nữa: nó là **nút bấm** dẫn
 * thẳng tới ký ức của chính tháng đó. Bản đồ và nội dung trở thành một vật.
 *
 * ## Ba tầng, ba câu hỏi
 *
 *     đóng hết      — "hành trình này dài bao nhiêu, chia làm mấy giai đoạn"
 *     mở một năm    — "năm đó có những tháng nào, tháng nào có chuyện"
 *     mở một tháng  — "chuyện đó là chuyện gì"
 *
 * Mỗi tầng trả lời xong mới mời xuống tầng sau. Bày cả ba cùng lúc thì câu hỏi
 * thứ nhất không bao giờ được trả lời, vì nội dung của một năm đã dài hơn cả
 * màn hình.
 *
 * ## Tháng KHÔNG có ký ức thì không bấm được
 *
 * Và đó là chủ ý, không phải thiếu sót. Một ô bấm được nhưng mở ra chẳng có gì
 * là một lời hứa hụt; còn ô mờ, không bấm được thì đọc ra ngay là "tháng này
 * chưa viết" — vẫn nhìn thấy chỗ trống (thứ mời viết) mà không mời bấm nhầm.
 */
export function PublicJourneyView({
  rows,
  memoriesByMonth,
}: {
  rows: TimelineRow[];
  memoriesByMonth: MemoriesByMonth;
}) {
  const { lang } = useLang();
  const jl = lang === "ja" ? "ja" : undefined;

  const total = rows.reduce((n, r) => n + r.memoryCount, 0);

  /**
   * NĂM MỚI NHẤT LÊN ĐẦU — 2026 trên cùng, 2023 dưới cùng.
   *
   * `mergeTimeline()` trả về theo thứ tự thời gian THUẬN và cố ý giữ nguyên
   * như vậy: dải ngang «Chặng đường ở Nhật» ở trang chủ cuộn từ trái sang phải,
   * ở đó cũ-trước-mới-sau mới là chiều đọc đúng. Đảo ở đây, trong tầng hiển
   * thị, chứ không đảo trong hàm thuần — nó có phép kiểm bám vào thứ tự đó.
   *
   * ⚠️ Chỉ đảo ở cấp NĂM. Hai cấp dưới vẫn thuận, và không phải do quên:
   *   · dải tháng 01→12 là một CÂY THƯỚC, đảo nó thì không đọc được nữa;
   *   · ký ức trong một tháng kể theo ngày tăng dần, vì trong phạm vi vài
   *     tuần thì đó là một câu chuyện, không phải một bảng tin.
   * Cấp năm là thứ duy nhất người ta LƯỚT để tìm, nên nó là thứ duy nhất đáng
   * xếp kiểu bảng tin.
   */
  const ordered = [...rows].reverse();

  /**
   * Năm mở: MỘT tại một thời điểm.
   *
   * Mở nhiều năm cùng lúc thì chuỗi dài ra tới mức mất luôn tác dụng của việc
   * thu gọn — mà thu gọn chính là lý do có chuỗi này. Mặc định mở năm **gần
   * đây nhất CÓ ký ức**: mở năm mới nhất mà năm đó còn trống thì thứ đầu tiên
   * người xem thấy là một dãy ô rỗng.
   */
  const [openYear, setOpenYear] = useState<number | null>(() => {
    const withData = rows.filter((r) => r.memoryCount > 0);
    return (withData.at(-1) ?? rows.at(-1))?.year ?? null;
  });

  /** Tháng mở: nhiều tùy ý, vì so hai tháng cạnh nhau là việc có thật. */
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set());

  const toggleMonth = (key: string) =>
    setOpenMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <>
      <PageHeader index={3} label="Hành trình" en="Journey" lang={jl} title={t.journey.title[lang]}>
        {t.journey.subtitle[lang].replace("{hometown}", site.hometown)}
      </PageHeader>

      {/* `space-y-0` + đường nối: các thẻ phải đọc ra là MỘT chuỗi liên tục,
          không phải mấy thẻ rời nhau cùng nằm trên một trang. Đường nối là thứ
          rẻ nhất làm được điều đó — rẻ hơn cả việc bỏ khoảng cách giữa thẻ. */}
      <div className="mt-12">
        {ordered.map((row, i) => (
          <YearBlock
            key={row.year}
            row={row}
            index={i}
            last={i === ordered.length - 1}
            open={openYear === row.year}
            onToggle={() => setOpenYear(openYear === row.year ? null : row.year)}
            openMonths={openMonths}
            onToggleMonth={toggleMonth}
            memoriesByMonth={memoriesByMonth}
            lang={jl}
          />
        ))}
      </div>

      {total === 0 && (
        <p className="mt-10 text-[15px] text-ink-2">
          <span lang={jl}>{t.journey.emptyLead[lang]}</span>{" "}
          <Link href="/blog" lang={jl} className="text-accent underline underline-offset-2">
            {t.journey.readPosts[lang]}
          </Link>{" "}
          <span lang={jl}>{t.journey.emptyTail[lang]}</span>
        </p>
      )}
    </>
  );
}

/* ══ MỘT NĂM ═════════════════════════════════════════════════ */

function YearBlock({
  row,
  index,
  last,
  open,
  onToggle,
  openMonths,
  onToggleMonth,
  memoriesByMonth,
  lang,
}: {
  row: TimelineRow;
  index: number;
  last: boolean;
  open: boolean;
  onToggle: () => void;
  openMonths: Set<string>;
  onToggleMonth: (key: string) => void;
  memoriesByMonth: MemoriesByMonth;
  lang?: "ja";
}) {
  const has = row.memoryCount > 0;

  return (
    <div className="relative">
      {/* Mắt xích nối xuống năm sau. Bỏ ở mắt cuối — một sợi dây thõng xuống
          từ đốt cuối cùng đọc ra là "còn nữa", mà không còn gì nữa thật. */}
      {!last && (
        <span
          aria-hidden
          className="absolute left-1/2 top-full h-5 w-px -translate-x-1/2 bg-line"
        />
      )}

      <section
        className={`mb-5 overflow-hidden rounded-[var(--radius-xl)] border transition-colors ${
          open ? "border-accent/45 bg-surface" : "border-line bg-surface"
        }`}
      >
        {/* ── Đầu năm: cả hàng là một nút ── */}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full items-center gap-5 px-5 py-6 text-left transition-colors hover:bg-surface-2/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent md:gap-8 md:px-8"
        >
          {/* Số năm — CHỈ đổi màu, không đổi cỡ, giữa mở và đóng. Đổi cỡ thì
              cả hàng nhảy chỗ mỗi lần bấm, và chuỗi mất trục thẳng. */}
          <span
            className={`shrink-0 text-[40px] font-semibold leading-none tabular-nums tracking-[-0.04em] transition-colors md:text-[56px] ${
              open ? "text-accent" : "text-ink-3/35"
            }`}
          >
            {row.year}
          </span>

          <span className="min-w-0 flex-1">
            <span className="tag block">
              {String(index).padStart(2, "0")}
              {" · "}
              {open ? "đang mở" : has ? `${row.memoryCount} ký ức` : "chưa viết"}
            </span>

            {row.title && (
              <span
                lang={lang}
                className="mt-1.5 block text-[17px] font-semibold leading-snug tracking-[-0.01em] text-ink md:text-[19px]"
              >
                {row.title}
              </span>
            )}

            {row.note && (
              // `line-clamp-1` khi đóng: mỗi mắt xích chiếm đúng một chiều cao
              // thì cả chuỗi có nhịp đều, và mắt lướt được từ đầu tới cuối.
              <span
                className={`mt-1 block text-[14px] leading-relaxed text-ink-3 ${
                  open ? "" : "line-clamp-1"
                }`}
              >
                {row.note}
              </span>
            )}
          </span>

          {/* Nút tròn: đặc khi mở, viền khi đóng. Nó KHÔNG phải nút riêng —
              cả hàng đã bấm được — nên để `aria-hidden`, tránh trình đọc màn
              hình đọc ra hai chỗ bấm cho cùng một hành động. */}
          <span
            aria-hidden
            className={`grid size-10 shrink-0 place-items-center rounded-full border transition-colors ${
              open
                ? "border-accent bg-accent text-white"
                : "border-line text-ink-3"
            }`}
          >
            <ChevronDown
              size={18}
              strokeWidth={2}
              className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            />
          </span>
        </button>

        {/* ── Thân năm ──
            `grid-rows-[0fr→1fr]`: cách duy nhất làm mượt được chiều cao KHÔNG
            biết trước bằng CSS thuần. `max-height` cần một con số đoán sẵn, mà
            đoán thiếu thì nội dung bị cắt, đoán thừa thì lúc đóng nó đứng im
            một lúc rồi mới nhúc nhích. */}
        <div
          className={`grid transition-[grid-template-rows] duration-400 ease-out ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          {/**
           * `inert` khi đóng — KHÔNG phải chi tiết làm cho đẹp.
           *
           * `grid-rows-[0fr]` + `overflow-hidden` chỉ giấu nội dung khỏi MẮT.
           * Mọi ô tháng bên trong vẫn nằm trong thứ tự Tab và vẫn bấm được:
           * người dùng bàn phím sẽ tab vào một cái nút họ không nhìn thấy, ở
           * một năm họ chưa mở, và trình đọc màn hình vẫn đọc hết chúng ra.
           *
           * Phát hiện ra khi thử bấm bằng script: một cú bấm vào ô tháng của
           * năm đang ĐÓNG vẫn đổi được trạng thái. Nếu nó xảy ra được bằng
           * script thì nó xảy ra được bằng phím Tab.
           */
          }
          <div className="overflow-hidden" inert={!open}>
            <div className="border-t border-line-soft px-5 py-6 md:px-8">
              <div className="tag">
                {"// giai đoạn · "}
                {row.months.length} tháng
              </div>

              {/* ── Dải tháng ──
                  Cuộn ngang trên màn hẹp thay vì xuống dòng: mười hai ô rơi
                  thành ba hàng thì nó không còn là một đoạn thời gian nữa.

                  ⚠️ `pt-2` KHÔNG phải để cho thoáng — nó chừa chỗ cho huy hiệu
                  số ký ức, cái nằm ở `-top-1` tức thò lên 4px khỏi ô tháng.
                  `overflow-x-auto` chỉ khai một trục, nhưng CSS quy định trục
                  còn lại tự thành `auto` theo — nên khung này CẮT cả chiều dọc,
                  và huy hiệu bị xén mất đỉnh. Triệu chứng nhìn ra là "cái chấm
                  tròn sao lại vuông ở trên". `mt-2` bù lại cho khoảng cách
                  tổng giữ nguyên như cũ. */}
              <div className="-mx-5 mt-2 overflow-x-auto px-5 pb-1 pt-2 md:-mx-8 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <ul className="flex w-max items-center">
                  {row.months.map((m, mi) => {
                    const key = `${row.year}-${m.month}`;
                    const monthOpen = openMonths.has(key);
                    const clickable = m.count > 0;

                    return (
                      <li key={m.month} className="flex items-center">
                        {mi > 0 && (
                          <span aria-hidden className="h-px w-4 shrink-0 bg-line md:w-5" />
                        )}

                        <MonthChip
                          month={m.month}
                          count={m.count}
                          open={monthOpen}
                          clickable={clickable}
                          onClick={() => onToggleMonth(key)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* ── Ký ức của những tháng đang mở ──
                  Nằm DƯỚI cả dải, không nhét vào giữa dải. Chèn nội dung vào
                  giữa một hàng ngang thì hàng đó vỡ làm đôi và đoạn thời gian
                  đứt quãng — mà tính liên tục chính là thứ dải này nói. */}
              {row.months
                .filter((m) => m.count > 0 && openMonths.has(`${row.year}-${m.month}`))
                .map((m) => (
                  <MonthPanel
                    key={m.month}
                    year={row.year}
                    month={m.month}
                    memories={memoriesByMonth[`${row.year}-${m.month}`] ?? []}
                    lang={lang}
                  />
                ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══ Ô THÁNG ═════════════════════════════════════════════════ */

function MonthChip({
  month,
  count,
  open,
  clickable,
  onClick,
}: {
  month: number;
  count: number;
  open: boolean;
  clickable: boolean;
  onClick: () => void;
}) {
  const label = String(month).padStart(2, "0");

  const box =
    "relative grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[var(--radius-lg)] border transition-colors";

  if (!clickable) {
    return (
      <span
        title={`Tháng ${month} · chưa viết`}
        className={`${box} border-line-soft text-ink-3/45`}
      >
        <span className="tag">{label}</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      title={`Tháng ${month} · ${count} ký ức`}
      className={`${box} focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        open
          ? "border-accent bg-accent text-white"
          : "border-line bg-surface-2 text-ink hover:border-ink-3"
      }`}
    >
      <span className={`tag ${open ? "text-white" : "text-ink"}`}>{label}</span>

      {/* Số ký ức nằm ở góc, không nằm dưới số tháng: xếp dọc thì ô phải cao
          lên, và ô có dữ liệu sẽ cao hơn ô trống — dải tháng hết thẳng hàng. */}
      <span
        className={`absolute -right-1 -top-1 grid size-[18px] place-items-center rounded-full text-[10px] font-semibold tabular-nums ${
          open ? "bg-ink text-bg" : "bg-accent text-white"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

/* ══ NỘI DUNG MỘT THÁNG ══════════════════════════════════════ */

function MonthPanel({
  year,
  month,
  memories,
  lang,
}: {
  year: number;
  month: number;
  memories: JourneyMemory[];
  lang?: "ja";
}) {
  return (
    <div className="mt-6 rounded-[var(--radius-lg)] border border-line-soft bg-surface-2/35 p-5 md:p-6">
      <div className="tag mb-5">
        {String(month).padStart(2, "0")}/{year}
        {" · "}
        {memories.length} ký ức
      </div>

      <ul className="space-y-8 border-l border-line pl-6">
        {memories.map((m) => (
          <li key={m.id} className="relative">
            <span
              aria-hidden
              className="absolute -left-[27px] top-2 size-1.5 rounded-full bg-accent"
            />

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <time dateTime={m.dateISO} className="tag shrink-0 tabular-nums">
                {m.dateLabel}
              </time>
              <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.01em]">
                {m.title}
              </h3>
            </div>

            {(m.place || m.area) && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-ink-3">
                <MapPin size={12} strokeWidth={1.75} />
                {[m.place, m.area].filter(Boolean).join(" · ")}
              </div>
            )}

            {m.body && (
              <p
                lang={lang}
                className="mt-2.5 whitespace-pre-line text-[15px] leading-relaxed text-ink-2"
              >
                {m.body}
              </p>
            )}

            {m.learned && (
              <p className="mt-3 border-l-2 border-accent/30 pl-3 text-[14px] leading-relaxed text-ink-2">
                {m.learned}
              </p>
            )}

            {m.photos.length > 0 && (
              <div className="mt-4">
                {/* `variant="square"`, KHÔNG phải mặc định `row`.
                    `row` là ô vuông 56px — biến thể dành cho hàng ảnh xem
                    trước nhét trong một thẻ chật, nơi ảnh chỉ nói "ký ức này
                    có ảnh". Ở đây tháng đã mở ra rồi, ảnh CHÍNH LÀ nội dung,
                    mà 56px thì không nhìn được gì trong khung rộng 1060px.

                    Cũng không dùng `grid`: nó cố định cao 128px, nên ở khung
                    này ra khung dẹt 2.6:1 và cắt cụt mọi tấm ảnh dọc. Ô vuông
                    vẫn cắt, nhưng cắt cân — và đó là kiểu cắt người xem quen
                    thuộc ở một lưới ảnh. */}
                <PhotoGrid photos={m.photos} variant="square" alt={m.title} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
