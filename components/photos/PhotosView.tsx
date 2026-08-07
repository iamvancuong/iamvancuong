"use client";

import Link from "next/link";
import { useLang } from "@/components/i18n/LangProvider";
import { t, monthLabel } from "@/lib/i18n";
import { PhotoGallery } from "@/components/PhotoGallery";
import type { LightboxPhoto } from "@/components/Lightbox";

export type PhotoMonth = {
  key: string;
  year: number | null;
  month: number | null;
  photos: LightboxPhoto[];
};

/**
 * Trang Ảnh — chrome + nhãn tháng theo ngôn ngữ; caption ảnh giữ nguyên (dữ liệu).
 */
export function PhotosView({ months }: { months: PhotoMonth[] }) {
  const { lang } = useLang();
  const jl = lang === "ja" ? "ja" : undefined;

  const sections = months.map((m) => ({
    key: m.key,
    label:
      m.year && m.month
        ? monthLabel(m.year, m.month, lang)
        : t.photos.unknownTime[lang],
    photos: m.photos,
  }));

  return (
    <>
      <header className="border-b border-line pb-8">
        <h1 lang={jl} className="text-[32px] font-semibold tracking-[-0.02em]">
          {t.photos.title[lang]}
        </h1>
        <p lang={jl} className="mt-2 text-[16px] text-ink-2">
          {t.photos.subtitle[lang]}
        </p>
      </header>

      {months.length === 0 ? (
        <p className="mt-10 text-[15px] text-ink-2">
          <span lang={jl}>{t.photos.empty[lang]}</span>{" "}
          <Link href="/journey" lang={jl} className="text-accent underline underline-offset-2">
            {t.photos.seeJourney[lang]}
          </Link>
        </p>
      ) : (
        <PhotoGallery sections={sections} />
      )}
    </>
  );
}
