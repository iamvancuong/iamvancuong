"use client";

import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/PageHeader";

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
      <PageHeader index={5} label="Giới thiệu" en="About" lang={jl} title={t.about.title[lang]} />
      <div
        lang={jl}
        className="prose mt-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
