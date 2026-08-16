"use client";

import Link from "next/link";
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
export type JourneyYearGroup = { year: number; memories: JourneyMemory[] };

/**
 * Bản công khai của /os/journey — chrome song ngữ; nội dung ký ức GIỮ NGUYÊN
 * ngôn ngữ chủ nhân đã viết (không dịch dữ liệu cá nhân), nên không gắn lang.
 */
export function PublicJourneyView({
  years,
  rows,
}: {
  years: JourneyYearGroup[];
  rows: TimelineRow[];
}) {
  const { lang } = useLang();
  const jl = lang === "ja" ? "ja" : undefined;
  const empty = years.length === 0;

  return (
    <>
      <PageHeader index={3} label="Hành trình" en="Journey" lang={jl} title={t.journey.title[lang]}>
        {t.journey.subtitle[lang].replace("{hometown}", site.hometown)}
      </PageHeader>

      {/*
        KHUNG NĂM — luôn hiện, kể cả khi chưa viết ký ức nào.

        Trước đây trang này sinh ra hoàn toàn từ dữ liệu: không có ký ức công
        khai thì trang trống trơn. Nghĩa là **trang chỉ bắt đầu tồn tại sau khi
        đã viết** — mà viết ký ức là việc tốn công nhất trong cả hệ thống, nên
        trên thực tế nó trống suốt.

        Mỗi ô tháng trống là một chỗ trống NHÌN THẤY ĐƯỢC — thứ mời viết, khác
        hẳn một trang trắng không gợi gì. Ô có ký ức thì đậm lên và hiện số.
        Xem lib/timeline.ts để biết ký ức bind vào bằng cách nào.
      */}
      <div className="mt-12 space-y-4">
        {rows.map((r) => (
          <section
            key={r.year}
            className="rounded-[var(--radius-xl)] border border-line bg-surface p-6 md:p-8"
          >
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
              <h2 className="text-[48px] font-semibold leading-none tabular-nums tracking-[-0.04em] text-ink-3/45 md:text-[56px]">
                {r.year}
              </h2>
              <div className="min-w-0 flex-1">
                <div className="tag">
                  {r.memoryCount > 0
                    ? `${r.memoryCount} ký ức`
                    : "chưa viết"}
                </div>
                {r.title && (
                  <div className="mt-1 text-[17px] font-semibold tracking-[-0.01em]">
                    {r.title}
                  </div>
                )}
              </div>
              {r.note && (
                <p className="max-w-[38ch] text-[14px] leading-relaxed text-ink-3">
                  {r.note}
                </p>
              )}
            </div>

            <ul className="mt-6 flex flex-wrap gap-2">
              {r.months.map((m) => (
                <li
                  key={m.month}
                  title={
                    m.count > 0
                      ? `Tháng ${m.month} · ${m.count} ký ức`
                      : `Tháng ${m.month} · chưa viết`
                  }
                  className={`flex h-14 w-[68px] flex-col items-center justify-center rounded-[var(--radius-lg)] border text-center ${
                    m.count > 0
                      ? "border-line bg-surface-2 text-ink"
                      : "border-line-soft text-ink-3/60"
                  }`}
                >
                  <span className="tag">
                    {String(m.month).padStart(2, "0")}
                  </span>
                  {m.count > 0 && (
                    <span className="mt-0.5 text-[12px] font-medium tabular-nums">
                      {m.count}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {empty ? (
        <p className="mt-10 text-[15px] text-ink-2">
          <span lang={jl}>{t.journey.emptyLead[lang]}</span>{" "}
          <Link href="/blog" lang={jl} className="text-accent underline underline-offset-2">
            {t.journey.readPosts[lang]}
          </Link>{" "}
          <span lang={jl}>{t.journey.emptyTail[lang]}</span>
        </p>
      ) : (
        <div className="mt-12 space-y-5">
          {years.map(({ year, memories }) => (
            /*
              Phần CHI TIẾT của từng năm.

              Số năm ở đây cố ý NHỎ (24px) chứ không lớn như trong khung năm
              phía trên: hai chỗ cùng in số năm cỡ 56px thì mắt đọc ra là trang
              bị lặp, và mốc lớn mất hết tác dụng vì nó không còn là mốc duy
              nhất. Khung trên là bản đồ, phần này là nội dung.
            */
            <section
              key={year}
              className="rounded-[var(--radius-xl)] border border-line bg-surface p-6 md:p-8"
            >
              <div className="mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-line-soft pb-5">
                <h2 className="text-[24px] font-semibold tabular-nums tracking-[-0.02em]">
                  {year}
                </h2>
                <span className="tag">
                  {memories.length} {t.journey.title[lang].toLowerCase()}
                </span>
              </div>

              <ul className="space-y-10 border-l border-line pl-6">
                {memories.map((m) => (
                  <li key={m.id} className="relative">
                    <span className="absolute -left-[27px] top-2 size-1.5 rounded-full bg-ink-3" aria-hidden />
                    <div className="flex items-baseline gap-3">
                      <time dateTime={m.dateISO} className="shrink-0 text-[13px] tabular-nums text-ink-3">
                        {m.dateLabel}
                      </time>
                      <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.01em]">
                        {m.title}
                      </h3>
                    </div>

                    {(m.place || m.area) && (
                      <div className="mt-1 text-[12px] text-ink-3">
                        {[m.place, m.area].filter(Boolean).join(" · ")}
                      </div>
                    )}

                    {m.body && (
                      <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink-2">
                        {m.body}
                      </p>
                    )}

                    {m.learned && (
                      <p className="mt-3 border-l-2 border-line pl-3 text-[14px] leading-relaxed text-ink-2">
                        {m.learned}
                      </p>
                    )}

                    <div className="mt-3">
                      <PhotoGrid photos={m.photos} alt={m.title} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
