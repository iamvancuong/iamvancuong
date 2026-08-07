"use client";

import { useState } from "react";
import { ChevronDown, Images, MapPin } from "lucide-react";
import { home, type Lang } from "@/lib/home";
import type { JourneyYear } from "@/lib/journey";
import { PhotoGrid } from "@/components/PhotoGrid";
import { Reveal } from "@/components/Reveal";

/**
 * "Chặng đường ở Nhật" — dòng thời gian kiểu editorial, hai tầng MỞ RA ĐƯỢC:
 *   NĂM → THÁNG → ký ức + ảnh.
 * Dữ liệu đọc THẬT từ Life OS (`lib/journey.ts`), không fix cứng: ký ức tick
 * "công khai" trong /os tự gom theo năm → tháng và hiện ở đây.
 *
 * Trang trí: số năm CỠ LỚN mờ làm nền, node tròn đánh dấu mốc, phần tháng có
 * trục dọc + node, và hai mốc năm nối nhau bằng đường DẤU ĐỨT NGANG rồi CONG XUỐNG.
 */
export function Journey({ years, lang }: { years: JourneyYear[]; lang: Lang }) {
  const jl = lang === "ja" ? "ja" : undefined;

  // Năm: mở một mốc tại một thời điểm (mốc đầu mở sẵn). Tháng: mở nhiều tùy ý.
  const [openYear, setOpenYear] = useState<number | null>(years[0]?.year ?? null);
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set());

  const toggleMonth = (key: string) =>
    setOpenMonths((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  if (years.length === 0) {
    return (
      <p lang={jl} className="mx-auto max-w-[420px] text-center text-[15px] leading-relaxed text-ink-2">
        {home.journey.empty[lang]}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-[480px] px-4">
      {years.map((y, i) => {
        const yearOpen = openYear === y.year;
        const teaser = y.months[0]?.memories[0]?.title ?? "";
        // Lệch nhẹ trái/phải để đường cong len giữa các mốc → nhịp "lượn".
        const shift = i % 2 === 0 ? "sm:-translate-x-3" : "sm:translate-x-3";

        return (
          <div key={y.year}>
            <Reveal>
              <article
                className={`mx-auto w-full max-w-[400px] overflow-hidden rounded-[28px] border border-line bg-bg text-left transition-transform ${shift}`}
              >
                {/* ── Đầu NĂM ── */}
                <button
                  type="button"
                  onClick={() => setOpenYear(yearOpen ? null : y.year)}
                  aria-expanded={yearOpen}
                  className="relative w-full overflow-hidden px-6 py-9 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {/* Số năm cỡ lớn mờ — chi tiết editorial */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-3 -top-4 select-none text-[92px] font-black leading-none tracking-tighter tabular-nums text-ink/[0.045]"
                  >
                    {y.year}
                  </span>

                  <div className="relative flex items-center gap-4">
                    {/* Node tròn trên trục: đầy khi mở, viền khi đóng */}
                    <span
                      className={`grid size-14 shrink-0 place-items-center rounded-full text-[12px] font-bold tabular-nums ring-1 transition-colors ${
                        yearOpen
                          ? "bg-ink text-bg ring-ink"
                          : "bg-bg text-ink ring-line"
                      }`}
                    >
                      {y.year}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div lang={jl} className="truncate text-[16px] font-semibold leading-snug text-ink">
                        {teaser}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[12px] text-ink-3">
                        <span>{y.memoryCount} kỷ niệm</span>
                        {y.photoCount > 0 && (
                          <>
                            <span className="text-ink/20">·</span>
                            <span className="flex items-center gap-1">
                              <Images size={12} strokeWidth={1.75} />
                              {y.photoCount}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <ChevronDown
                      size={20}
                      strokeWidth={1.75}
                      className={`shrink-0 text-ink-3 transition-transform duration-300 ${yearOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {/* ── Thân NĂM: danh sách THÁNG trên một trục dọc ── */}
                <div
                  className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                    yearOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="relative space-y-3 px-6 pb-7 pl-9">
                      {/* Trục dọc chạy suốt các tháng */}
                      <span
                        aria-hidden
                        className="absolute left-[26px] top-2 bottom-6 w-px bg-line"
                      />

                      {y.months.map((mo) => {
                        const key = `${y.year}-${mo.month}`;
                        const monthOpen = openMonths.has(key);
                        const monthTeaser = mo.memories[0]?.title ?? "";

                        return (
                          <div key={key} className="relative">
                            {/* Node nhỏ trên trục */}
                            <span
                              aria-hidden
                              className={`absolute -left-[19px] top-[15px] size-2.5 rounded-full ring-4 ring-bg transition-colors ${
                                monthOpen ? "bg-ink" : "bg-ink-3"
                              }`}
                            />

                            <div className="overflow-hidden rounded-2xl border border-line">
                              {/* Đầu THÁNG */}
                              <button
                                type="button"
                                onClick={() => toggleMonth(key)}
                                aria-expanded={monthOpen}
                                className="flex w-full items-center gap-2.5 bg-surface px-3.5 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                              >
                                <span className="shrink-0 rounded-md bg-bg px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-2">
                                  {monthLabel(mo.month, lang)}
                                </span>
                                <span
                                  lang={jl}
                                  className="min-w-0 flex-1 truncate text-left text-[13.5px] font-medium text-ink"
                                >
                                  {monthTeaser}
                                </span>
                                {mo.photos.length > 0 && (
                                  <span className="flex shrink-0 items-center gap-1 text-[11px] text-ink-3">
                                    <Images size={13} strokeWidth={1.75} />
                                    {mo.photos.length}
                                  </span>
                                )}
                                <ChevronDown
                                  size={17}
                                  strokeWidth={1.75}
                                  className={`shrink-0 text-ink-3 transition-transform duration-300 ${monthOpen ? "rotate-180" : ""}`}
                                />
                              </button>

                              {/* Thân THÁNG: từng ký ức */}
                              <div
                                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                                  monthOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                }`}
                              >
                                <div className="overflow-hidden">
                                  <div className="space-y-5 px-4 py-4">
                                    {mo.memories.map((mem) => (
                                      <div key={mem.id} className="relative border-l border-line pl-4">
                                        <span className="absolute -left-[4.5px] top-1.5 size-2 rounded-full bg-ink-3" />
                                        <div className="flex items-baseline gap-2">
                                          <time
                                            dateTime={mem.date}
                                            className="shrink-0 text-[12px] tabular-nums text-ink-3"
                                          >
                                            {String(mem.day).padStart(2, "0")}/
                                            {String(mo.month).padStart(2, "0")}
                                          </time>
                                          <p lang={jl} className="text-[14px] font-semibold leading-snug text-ink">
                                            {mem.title}
                                          </p>
                                        </div>

                                        {(mem.place || mem.area) && (
                                          <p className="mt-1 flex items-center gap-1 text-[12px] text-ink-3">
                                            <MapPin size={12} strokeWidth={1.75} />
                                            {[mem.place, mem.area].filter(Boolean).join(" · ")}
                                          </p>
                                        )}

                                        {mem.body && (
                                          <p lang={jl} className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-ink-2">
                                            {mem.body}
                                          </p>
                                        )}

                                        {mem.photos.length > 0 && (
                                          <div className="mt-3">
                                            <PhotoGrid photos={mem.photos} variant="grid" alt={mem.title} />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>

            {/* Nối NGANG rồi CONG XUỐNG — bỏ ở mốc cuối, so le hướng theo i.
                Bọc trong Reveal để mờ vào ĐỒNG BỘ với các thẻ (không hiện sẵn). */}
            {i < years.length - 1 && (
              <Reveal delayMs={140} className="w-full">
                <Connector flip={i % 2 === 1} idx={i} />
              </Reveal>
            )}
          </div>
        );
      })}
    </div>
  );
}

const monthLabel = (m: number, lang: Lang) => (lang === "ja" ? `${m}月` : `Tháng ${m}`);

/**
 * Đường nối dấu-đứt: một chấm ở đầu, chạy NGANG rồi bo CONG XUỐNG, mũi tên trỏ xuống.
 * `flip` đảo hướng ngang (phải→trái) cho mốc kế tiếp để nhịp lượn không đơn điệu.
 */
function Connector({ flip, idx }: { flip: boolean; idx: number }) {
  return (
    <svg
      viewBox="0 0 220 130"
      className="mx-auto my-3 h-[120px] w-full max-w-[330px] text-ink-3"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <marker
          id={`arw-${idx}`}
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6.5"
          markerHeight="6.5"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
        </marker>
      </defs>
      {/* chấm khởi đầu */}
      <circle cx={flip ? 204 : 16} cy="14" r="2.6" fill="currentColor" />
      <path
        d={flip ? "M204,14 H80 Q26,14 26,116" : "M16,14 H140 Q194,14 194,116"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray="2 6"
        strokeLinecap="round"
        markerEnd={`url(#arw-${idx})`}
      />
    </svg>
  );
}
