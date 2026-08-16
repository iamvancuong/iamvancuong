"use client";

import Link from "next/link";
import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";
import { site } from "@/lib/site";
import { PhotoGrid } from "@/components/PhotoGrid";
import type { LightboxPhoto } from "@/components/Lightbox";
import { PageHeader } from "@/components/layout/PageHeader";

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
export function PublicJourneyView({ years }: { years: JourneyYearGroup[] }) {
  const { lang } = useLang();
  const jl = lang === "ja" ? "ja" : undefined;
  const empty = years.length === 0;

  return (
    <>
      <PageHeader index={3} label="Hành trình" en="Journey" lang={jl} title={t.journey.title[lang]}>
        {t.journey.subtitle[lang].replace("{hometown}", site.hometown)}
      </PageHeader>

      {empty ? (
        <p className="mt-10 text-[15px] text-ink-2">
          <span lang={jl}>{t.journey.emptyLead[lang]}</span>{" "}
          <Link href="/blog" lang={jl} className="text-accent underline underline-offset-2">
            {t.journey.readPosts[lang]}
          </Link>{" "}
          <span lang={jl}>{t.journey.emptyTail[lang]}</span>
        </p>
      ) : (
        <div className="mt-12 space-y-14">
          {years.map(({ year, memories }) => (
            <section key={year}>
              <h2 className="mb-6 text-[20px] font-semibold tabular-nums tracking-[-0.01em]">
                {year}
              </h2>

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
