"use client";

import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";

/**
 * Trang Giới thiệu — nội dung song ngữ (HTML dựng sẵn cho cả hai bản), chọn
 * theo ngôn ngữ đang bật. Bản JA là AI nháp (content/about.ja.md).
 */
export function AboutView({ vi, ja }: { vi: string; ja: string }) {
  const { lang } = useLang();
  const jl = lang === "ja" ? "ja" : undefined;
  const html = lang === "ja" ? ja : vi;

  return (
    <>
      <header className="border-b border-line pb-8">
        <h1 lang={jl} className="text-[32px] font-semibold tracking-[-0.02em]">
          {t.about.title[lang]}
        </h1>
      </header>
      <div
        lang={jl}
        className="prose mt-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
