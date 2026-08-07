"use client";

import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/lib/projects";

/**
 * Trang Dự án — song ngữ. Nội dung project (tên/mô tả/vấn đề/đã làm) lấy bản
 * theo ngôn ngữ; stack là tên công nghệ nên giữ nguyên; nhãn giao diện qua `t`.
 */
export function ProjectsView({ projects }: { projects: Project[] }) {
  const { lang } = useLang();
  const jl = lang === "ja" ? "ja" : undefined;

  return (
    <>
      <header className="border-b border-line pb-8">
        <h1 lang={jl} className="text-[32px] font-semibold tracking-[-0.02em]">
          {t.projects.title[lang]}
        </h1>
        <p lang={jl} className="mt-2 text-[16px] text-ink-2">
          {t.projects.subtitle[lang]}
        </p>
      </header>

      <div className="mt-10 space-y-12">
        {projects.map((p) => {
          const name = lang === "ja" ? p.nameJa ?? p.name : p.name;
          const summary = lang === "ja" ? p.summaryJa : p.summary;
          const problem = lang === "ja" ? p.problemJa : p.problem;
          const built = lang === "ja" ? p.builtJa : p.built;
          const status = t.projects.status[p.status]?.[lang] ?? p.status;

          return (
            <article key={p.slug} className="border-b border-line-soft pb-12 last:border-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 lang={jl} className="text-[20px] font-semibold tracking-[-0.01em]">
                  {name}
                </h2>
                <Badge>
                  <span lang={jl}>{status}</span>
                </Badge>
                <span className="text-[13px] text-ink-3">{p.year}</span>
              </div>

              <p lang={jl} className="mt-3 text-[16px] leading-relaxed text-ink-2">
                {summary}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.stack.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>

              <div className="mt-6 space-y-4 text-[15px] leading-relaxed">
                <div>
                  <div lang={jl} className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
                    {t.projects.problem[lang]}
                  </div>
                  <p lang={jl} className="mt-1.5 text-ink-2">
                    {problem}
                  </p>
                </div>

                <div>
                  <div lang={jl} className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
                    {t.projects.built[lang]}
                  </div>
                  <ul className="mt-1.5 list-disc space-y-1.5 pl-5 text-ink-2 marker:text-ink-3">
                    {built.map((b, i) => (
                      <li key={i} lang={jl}>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {(p.repo || p.demo) && (
                <div className="mt-6 flex gap-4 text-[14px]">
                  {p.repo && (
                    <a
                      href={p.repo}
                      target="_blank"
                      rel="noreferrer"
                      lang={jl}
                      className="text-accent underline decoration-accent/35 underline-offset-[3px] hover:decoration-accent"
                    >
                      {t.projects.source[lang]}
                    </a>
                  )}
                  {p.demo && (
                    <a
                      href={p.demo}
                      target="_blank"
                      rel="noreferrer"
                      lang={jl}
                      className="text-accent underline decoration-accent/35 underline-offset-[3px] hover:decoration-accent"
                    >
                      {t.projects.demo[lang]}
                    </a>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
