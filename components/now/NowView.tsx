"use client";

import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";
import type { Focus } from "@/lib/now";

export type NowData = { updated: string; focus: Focus[]; bodyHtml: string };

/**
 * Trang "Dạo này" — song ngữ. Nội dung (3 việc + phần chữ) là bản tự viết,
 * đọc từ now.md / now.ja.md; nhãn giao diện đổi theo ngôn ngữ.
 */
export function NowView({ vi, ja }: { vi: NowData; ja: NowData }) {
  const { lang } = useLang();
  const jl = lang === "ja" ? "ja" : undefined;
  const d = lang === "ja" ? ja : vi;

  return (
    <>
      <header className="border-b border-line pb-8">
        <h1 lang={jl} className="text-[32px] font-semibold tracking-[-0.02em]">
          {t.now.title[lang]}
        </h1>
        <p className="mt-2 text-[14px] text-ink-3">
          <span lang={jl}>{t.now.updated[lang]}</span>: {d.updated}
        </p>
      </header>

      <ol className="mt-10 space-y-8">
        {d.focus.map((f, i) => (
          <li key={i} className="flex gap-5">
            <span className="pt-0.5 text-[13px] font-medium tabular-nums text-ink-3">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <div lang={jl} className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
                {f.area}
              </div>
              <h2 lang={jl} className="mt-1 text-[20px] font-semibold leading-snug">
                {f.title}
              </h2>
              {f.detail && (
                <p lang={jl} className="mt-2 text-[16px] leading-relaxed text-ink-2">
                  {f.detail}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div
        lang={jl}
        className="prose mt-14 border-t border-line pt-10"
        dangerouslySetInnerHTML={{ __html: d.bodyHtml }}
      />
    </>
  );
}
