"use client";

import { Download } from "lucide-react";
import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";
import { cv, experiences } from "@/lib/cv";
import { Badge } from "@/components/ui/Badge";

/**
 * Trang CV kiểu Nhật (履歴書/職務経歴書 gọn). Song ngữ; nút "Tải PDF" gọi in
 * trình duyệt (Save as PDF) — CSS @media print ẩn header/footer/nút (globals.css).
 */
export function CvView() {
  const { lang } = useLang();
  const jl = lang === "ja" ? "ja" : undefined;

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <section className="mt-8">
      <h2
        lang={jl}
        className="mb-4 border-b border-line pb-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-3"
      >
        {title}
      </h2>
      {children}
    </section>
  );

  const info: { label: string; value: string; lang?: "ja" }[] = [
    { label: t.cv.birth[lang], value: cv.birthDate },
    { label: t.cv.nationality[lang], value: cv.nationality[lang], lang: jl },
    { label: t.cv.email[lang], value: cv.email },
    { label: t.cv.phone[lang], value: cv.phone },
    { label: t.cv.address[lang], value: cv.address, lang: "ja" },
  ];

  return (
    <div className="cv-doc mx-auto max-w-[820px]">
      {/* Thanh trên — ẩn khi in */}
      <div className="no-print mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 lang={jl} className="text-[28px] font-semibold tracking-[-0.02em]">
            {t.cv.title[lang]}
          </h1>
          <p lang={jl} className="mt-1 text-[14px] text-ink-3">
            {t.cv.subtitle[lang]}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          lang={jl}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-bg transition-opacity hover:opacity-90"
        >
          <Download size={15} strokeWidth={2} />
          {t.cv.download[lang]}
        </button>
      </div>

      {/* ── Đầu CV: tên + thông tin cá nhân ── */}
      <header className="rounded-2xl border border-line p-6">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span lang={jl} className="text-[26px] font-semibold tracking-[-0.01em] text-ink">
            {cv.name[lang]}
          </span>
          {lang !== "ja" && (
            <span lang="ja" className="text-[15px] text-ink-3">
              {cv.kana}
            </span>
          )}
          <span lang={jl} className="text-[15px] text-ink-2">
            {cv.title[lang]}
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {info.map((r) => (
            <div key={r.label} className="flex gap-3 text-[14px]">
              <dt lang={jl} className="w-24 shrink-0 text-ink-3">
                {r.label}
              </dt>
              <dd lang={r.lang} className="min-w-0 text-ink">
                {r.value}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      {/* ── Tóm tắt ── */}
      <Section title={t.cv.summary[lang]}>
        <p lang={jl} className="text-[15px] leading-relaxed text-ink-2">
          {cv.summary[lang]}
        </p>
      </Section>

      {/* ── Kinh nghiệm ── */}
      <Section title={t.cv.experience[lang]}>
        <div className="space-y-7">
          {experiences.map((e, i) => (
            <article key={i} className="break-inside-avoid">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-[17px] font-semibold tracking-[-0.01em]">
                  {e.url ? (
                    <a href={e.url} target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">
                      {e.company}
                    </a>
                  ) : (
                    e.company
                  )}
                </h3>
                <span lang={jl} className="text-[14px] text-ink-2">
                  {lang === "ja" ? e.roleJa : e.role}
                </span>
                {e.period && (
                  <span className="ml-auto text-[13px] tabular-nums text-ink-3">{e.period}</span>
                )}
              </div>
              <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-[14.5px] leading-relaxed text-ink-2 marker:text-ink-3">
                {(lang === "ja" ? e.bulletsJa : e.bullets).map((b, j) => (
                  <li key={j} lang={jl}>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {e.stack.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* ── Kỹ năng ── */}
      <Section title={t.cv.skills[lang]}>
        <dl className="space-y-3">
          {cv.skills.map((g) => (
            <div key={g.label.vi} className="flex flex-col gap-1.5 sm:flex-row sm:gap-4">
              <dt lang={jl} className="w-40 shrink-0 text-[14px] font-medium text-ink">
                {g.label[lang]}
              </dt>
              <dd className="flex min-w-0 flex-wrap gap-1.5">
                {g.items.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* ── Học vấn ── */}
      <Section title={t.cv.education[lang]}>
        {cv.education.map((ed, i) => (
          <div key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span lang={jl} className="text-[15px] font-medium text-ink">
              {ed.school[lang]}
            </span>
            <span lang={jl} className="text-[14px] text-ink-2">
              {ed.major[lang]}
            </span>
            <span className="text-[13px] text-ink-3">· {ed.note}</span>
            <span className="ml-auto text-[13px] tabular-nums text-ink-3">{ed.period}</span>
          </div>
        ))}
      </Section>

      {/* ── Ngôn ngữ ── */}
      <Section title={t.cv.languages[lang]}>
        <ul className="space-y-1.5">
          {cv.languages.map((l) => (
            <li key={l.label.vi} className="flex gap-3 text-[14px]">
              <span lang={jl} className="w-28 shrink-0 text-ink">
                {l.label[lang]}
              </span>
              <span lang={jl} className="text-ink-2">
                {l.level[lang]}
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
