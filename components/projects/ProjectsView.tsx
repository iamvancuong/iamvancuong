"use client";

import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/lib/projects";
import { PageHeader } from "@/components/layout/PageHeader";

/**
 * Trang Dự án — song ngữ. Nội dung project (tên/mô tả/vấn đề/đã làm) lấy bản
 * theo ngôn ngữ; stack là tên công nghệ nên giữ nguyên; nhãn giao diện qua `t`.
 */
export function ProjectsView({ projects }: { projects: Project[] }) {
  const { lang } = useLang();
  const jl = lang === "ja" ? "ja" : undefined;

  return (
    <>
      <PageHeader index={4} label="Dự án" en="Projects" lang={jl} title={t.projects.title[lang]}>
        {t.projects.subtitle[lang]}
      </PageHeader>

      {/*
        MỖI DỰ ÁN LÀ MỘT THẺ TRẮNG, chia hai cột từ md trở lên.

        Bản cũ là các khối cách nhau bằng đường kẻ mảnh, tất cả trên cùng một
        nền. Với nội dung dài (tóm tắt + vấn đề + danh sách đã làm + stack) thì
        đường kẻ không đủ sức tách: đọc tới giữa dự án thứ hai là không còn
        chắc mình đang ở dự án nào nữa.

        Cột trái giữ phần NHẬN DIỆN (tên, trạng thái, tóm tắt, stack) — thứ
        cần khi lướt; cột phải giữ phần CHI TIẾT (vấn đề, đã làm) — thứ chỉ
        đọc khi đã quan tâm. Chia theo mức độ quan tâm, không chia theo độ dài.
      */}
      <div className="mt-12 space-y-5">
        {projects.map((p) => {
          const name = lang === "ja" ? p.nameJa ?? p.name : p.name;
          const summary = lang === "ja" ? p.summaryJa : p.summary;
          const problem = lang === "ja" ? p.problemJa : p.problem;
          const built = lang === "ja" ? p.builtJa : p.built;
          const status = t.projects.status[p.status]?.[lang] ?? p.status;

          return (
            <article
              key={p.slug}
              className="grid gap-8 rounded-[var(--radius-xl)] border border-line bg-surface p-6 md:grid-cols-[1fr_1.15fr] md:p-8"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 lang={jl} className="text-[24px] font-semibold tracking-[-0.02em]">
                    {name}
                  </h2>
                  <Badge>
                    <span lang={jl}>{status}</span>
                  </Badge>
                  <span className="tag">{p.year}</span>
                </div>

                <p lang={jl} className="mt-3 text-[16px] leading-relaxed text-ink-2">
                  {summary}
                </p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-5 text-[15px] leading-relaxed md:border-l md:border-line-soft md:pl-8">
                <div>
                  <div lang={jl} className="tag">
                    {t.projects.problem[lang]}
                  </div>
                  <p lang={jl} className="mt-1.5 text-ink-2">
                    {problem}
                  </p>
                </div>

                <div>
                  <div lang={jl} className="tag">
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

                {(p.repo || p.demo) && (
                  <div className="flex gap-4 pt-1 text-[14px]">
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
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
