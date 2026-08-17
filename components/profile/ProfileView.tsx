"use client";

import { Download, Mail, ExternalLink } from "lucide-react";
// lucide bản này đã bỏ icon thương hiệu — dùng bộ tự vẽ dùng chung với footer.
import { BrandIcon } from "@/components/ui/BrandIcon";
import { useLang } from "@/components/i18n/LangProvider";
import { t, type Lang } from "@/lib/i18n";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { cv, experiences } from "@/lib/cv";
import { site } from "@/lib/site";
import type { Project } from "@/lib/projects";

/**
 * Trang «Hồ sơ» — GỘP ba trang cũ: /projects · /cv · /about.
 *
 * ## Vì sao gộp
 *
 * Ba trang đó trả lời ba câu hỏi mà không ai hỏi rời nhau bao giờ:
 *
 *     /cv        — người này làm được gì, ở đâu, bao lâu
 *     /projects  — cho xem một thứ họ đã làm
 *     /about     — và họ là người thế nào
 *
 * Người tuyển dụng hỏi cả ba trong một lần ngồi xuống. Ba trang riêng bắt họ
 * quay lại thanh nav hai lần giữa chừng, và mỗi lần quay lại là một lần có thể
 * không quay lại nữa. Tệ hơn: dữ liệu ba trang vốn CHUNG một nguồn
 * (`lib/cv.ts` + `lib/projects.ts`), nên `/cv` và `/projects` đã in cùng một
 * dòng thời gian nghề nghiệp ở hai kiểu khác nhau — cùng một sự thật, hai chỗ
 * phải sửa.
 *
 * ## Bố cục: mỗi mục là một loại nội dung, mỗi loại một hình dạng
 *
 *     Danh thiếp   một thẻ hai cột   — ai, và tải CV ở đâu
 *     Kinh nghiệm  thẻ mỗi việc      — nơi làm + việc đã làm
 *     Dự án        thẻ mỗi dự án     — vấn đề + đã dựng gì
 *     Học vấn      một thẻ mỏng
 *     Giới thiệu   chữ, không thẻ    — phần duy nhất để ĐỌC, không phải để tra
 *
 * Thẻ trắng trên nền kem là ngôn ngữ đã có sẵn của trang Dự án cũ; ở đây nó
 * được dùng cho cả năm mục nên cả trang đọc ra là MỘT trang, không phải ba
 * trang dán lại.
 *
 * ⚠️ Dòng thời gian nghề nghiệp giờ chỉ còn ĐÚNG MỘT chỗ (mục Kinh nghiệm).
 * Thẻ danh thiếp cố ý KHÔNG lặp lại nó — thẻ tóm tắt nằm cách bản đầy đủ đúng
 * một cú cuộn thì nó không tóm tắt gì cả, chỉ nói trước cùng một điều.
 */

/** Nhãn chỉ trang này dùng — để cạnh chỗ dùng, không nhét vào `lib/i18n.ts`. */
const tx = {
  title: { vi: "Hồ sơ", ja: "プロフィール" },
  subtitle: {
    vi: "Tôi làm được gì, đã làm ở đâu, và đang dựng những gì. Bản PDF tải được ở ngay dưới.",
    ja: "できること、これまでの職歴、そしていま作っているもの。PDF版はすぐ下からダウンロードできます。",
  },
  available: { vi: "sẵn sàng làm việc", ja: "就業可能" },
  downloadVi: { vi: "Tải CV · Tiếng Việt", ja: "履歴書（ベトナム語版）" },
  downloadJa: { vi: "Tải CV · 日本語", ja: "履歴書（日本語版）" },
  contact: { vi: "Liên hệ", ja: "連絡する" },
  projects: { vi: "Dự án cá nhân", ja: "個人プロジェクト" },
  about: { vi: "Ngoài CV", ja: "履歴書の外の話" },
} as const;

/* ══ Mảnh dùng lại ═══════════════════════════════════════════
   Khai ở CẤP MODULE, không lồng trong thân `ProfileView`.
   Component định nghĩa trong lúc render là một component MỚI mỗi lần render —
   React tháo cả cây con và dựng lại, trạng thái mất sạch. Ở đây chưa có
   trạng thái nào để mất, nhưng chỗ này rồi sẽ có, và lúc đó lỗi sẽ trông như
   "ô nhập tự xóa chữ" chứ không trông như một lỗi cấu trúc. */

/** Nhãn mục: `// kinh_nghiệm` + tiêu đề lớn. */
function SectionHead({
  slug,
  title,
  lang,
}: {
  slug: string;
  title: string;
  lang?: "ja";
}) {
  return (
    <div className="mb-5 mt-16 first:mt-0">
      <div className="tag">{"// "}{slug}</div>
      <h2
        lang={lang}
        className="mt-3 text-[26px] font-semibold tracking-[-0.025em] md:text-[30px]"
      >
        {title}
        <span className="text-accent">.</span>
      </h2>
    </div>
  );
}

/** Thẻ trắng — hình dạng dùng chung của mọi mục trên trang. */
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[var(--radius-xl)] border border-line bg-surface p-6 md:p-8 ${className}`}
    >
      {children}
    </section>
  );
}

/* ══ 1. DANH THIẾP ═══════════════════════════════════════════ */

function IdentityCard({ lang }: { lang: Lang }) {
  const jl = lang === "ja" ? "ja" : undefined;

  const facts: [string, string][] = [
    [t.cv.address[lang], cv.address[lang]],
    [t.cv.email[lang], cv.email],
    ["status", tx.available[lang]],
  ];

  return (
    <Card className="grid gap-8 md:grid-cols-[1fr_1fr]">
      {/* ── Trái: ai ── */}
      <div>
        <div className="tag">{"// curriculum_vitae"}</div>

        <h2 lang={jl} className="mt-4 text-[28px] font-semibold tracking-[-0.025em]">
          {cv.name[lang]}
          <span className="text-accent">.</span>
        </h2>
        <div lang={jl} className="tag mt-1.5">
          {cv.title[lang]}
        </div>

        <p lang={jl} className="mt-4 text-[15px] leading-relaxed text-ink-2">
          {cv.summary[lang]}
        </p>

        {/* Bảng nhãn/giá trị, cùng kiểu với thẻ thông số ở trang chủ: hai đầu
            một dòng thì mắt biết ngay bên nào là tên, bên nào là giá trị. */}
        <dl className="mt-6 divide-y divide-line-soft border-y border-line-soft">
          {facts.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt lang={jl} className="tag shrink-0">
                {k}
              </dt>
              <dd lang={jl} className="tag text-right text-ink">
                {v}
              </dd>
            </div>
          ))}
        </dl>

        {/*
          HAI nút tải, không phải một nút "tải CV".

          Một nút thì phải đoán hộ người bấm là họ muốn bản nào — mà đây đúng
          là chỗ không được đoán: nhà tuyển dụng Nhật cần bản 日本語, còn công
          ty Việt hoặc bạn bè cần bản tiếng Việt. Hai nút thì câu hỏi đó biến
          mất, và mỗi nút nói rõ mình là bản nào bằng CHÍNH thứ tiếng đó.

          `download` + `Content-Disposition: attachment` ở route: bấm là file
          rơi vào thư mục Tải về, không mở tab xem trước, không hộp thoại in.
        */}
        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href="/api/cv/vi"
            download
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[14px] font-medium text-bg transition-opacity hover:opacity-90"
          >
            <Download size={14} strokeWidth={2} />
            {tx.downloadVi[lang]}
          </a>
          <a
            href="/api/cv/ja"
            download
            lang="ja"
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-[14px] transition-colors hover:border-ink-3"
          >
            <Download size={14} strokeWidth={1.75} />
            {tx.downloadJa[lang]}
          </a>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`mailto:${cv.email}`}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-[14px] transition-colors hover:border-ink-3"
          >
            <Mail size={14} strokeWidth={1.75} />
            {tx.contact[lang]}
          </a>
          {site.social.github && (
            <a
              href={site.social.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-[14px] transition-colors hover:border-ink-3"
            >
              <BrandIcon name="github" size={14} />
              GitHub
            </a>
          )}
        </div>
      </div>

      {/* ── Phải: làm được gì ──
          Kỹ năng và ngôn ngữ ở đây chứ không thành mục riêng: chúng là thứ để
          LIẾC, và cái liếc đó phải xảy ra cùng lúc với việc đọc tên. Tách ra
          thành mục riêng ở cuối trang là đẩy nó tới chỗ không ai xuống tới. */}
      <div className="md:border-l md:border-line-soft md:pl-8">
        <div className="tag">{"// tech_stack"}</div>
        <dl className="mt-4 space-y-4">
          {cv.skills.map((g) => (
            <div key={g.label.vi}>
              <dt lang={jl} className="text-[13px] font-medium text-ink">
                {g.label[lang]}
              </dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                {g.items.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </dd>
            </div>
          ))}
        </dl>

        <div className="tag mt-7">{"// ngôn_ngữ"}</div>
        <dl className="mt-4 divide-y divide-line-soft border-y border-line-soft">
          {cv.languages.map((l) => (
            <div
              key={l.label.vi}
              className="flex items-baseline justify-between gap-4 py-2.5"
            >
              <dt lang={jl} className="text-[13px] text-ink">
                {l.label[lang]}
              </dt>
              <dd lang={jl} className="text-right text-[13px] text-ink-2">
                {l.level[lang]}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}

/* ══ 2. KINH NGHIỆM ══════════════════════════════════════════ */

function ExperienceCard({ lang }: { lang: Lang }) {
  const jl = lang === "ja" ? "ja" : undefined;

  return (
    <div className="space-y-5">
      {experiences.map((e) => (
        <Card
          key={e.company + e.period}
          className="grid gap-8 md:grid-cols-[1fr_1.15fr]"
        >
          {/* Cột NHẬN DIỆN — thứ cần khi lướt. Cùng cách chia với thẻ dự án
              bên dưới: hai loại nội dung khác nhau nhưng cùng một câu hỏi
              ("cái này là gì / và cụ thể là gì"), nên cùng một hình dạng. */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-[22px] font-semibold tracking-[-0.02em]">
                {e.url ? (
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-accent"
                  >
                    {e.company}
                    <ExternalLink size={14} strokeWidth={1.75} className="text-ink-3" />
                  </a>
                ) : (
                  e.company
                )}
              </h3>
              <span className="tag">{e.period}</span>
            </div>

            <div lang={jl} className="mt-2 text-[15px] text-accent">
              {lang === "ja" ? e.roleJa : e.role}
            </div>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {e.stack.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          </div>

          {/* Cột CHI TIẾT — chỉ đọc khi đã quan tâm. */}
          <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink-2 marker:text-ink-3 md:border-l md:border-line-soft md:pl-12">
            {(lang === "ja" ? e.bulletsJa : e.bullets).map((b, i) => (
              <li key={i} lang={jl}>
                {b}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}

/* ══ 3. DỰ ÁN ════════════════════════════════════════════════ */

function ProjectCards({ projects, lang }: { projects: Project[]; lang: Lang }) {
  const jl = lang === "ja" ? "ja" : undefined;

  return (
    <div className="space-y-5">
      {projects.map((p) => {
        const name = lang === "ja" ? (p.nameJa ?? p.name) : p.name;
        const summary = lang === "ja" ? p.summaryJa : p.summary;
        const problem = lang === "ja" ? p.problemJa : p.problem;
        const built = lang === "ja" ? p.builtJa : p.built;
        const status = t.projects.status[p.status]?.[lang] ?? p.status;

        return (
          <Card key={p.slug} className="grid gap-8 md:grid-cols-[1fr_1.15fr]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 lang={jl} className="text-[22px] font-semibold tracking-[-0.02em]">
                  {name}
                </h3>
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

              {(p.repo || p.demo) && (
                <div className="mt-5 flex flex-wrap gap-4 text-[14px]">
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
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ══ Trang ═══════════════════════════════════════════════════ */

export function ProfileView({
  projects,
  aboutVi,
  aboutJa,
}: {
  projects: Project[];
  /** HTML đã dựng sẵn từ `content/about.md` — bản JA là AI nháp. */
  aboutVi: string;
  aboutJa: string;
}) {
  const { lang } = useLang();
  const jl = lang === "ja" ? "ja" : undefined;

  return (
    <>
      <PageHeader index={4} label="Hồ sơ" en="Profile" lang={jl} title={tx.title[lang]}>
        {tx.subtitle[lang]}
      </PageHeader>

      <div className="mt-12">
        <IdentityCard lang={lang} />
      </div>

      <SectionHead slug="kinh_nghiệm" title={t.cv.experience[lang]} lang={jl} />
      <ExperienceCard lang={lang} />

      <SectionHead slug="dự_án" title={tx.projects[lang]} lang={jl} />
      <ProjectCards projects={projects} lang={lang} />

      <SectionHead slug="học_vấn" title={t.cv.education[lang]} lang={jl} />
      <Card className="space-y-3">
        {cv.education.map((ed) => (
          <div
            key={ed.period}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
          >
            <span lang={jl} className="text-[17px] font-semibold tracking-[-0.01em]">
              {ed.school[lang]}
            </span>
            <span lang={jl} className="text-[15px] text-ink-2">
              {ed.major[lang]}
            </span>
            <span className="tag">{ed.note}</span>
            <span className="tag ml-auto">{ed.period}</span>
          </div>
        ))}
      </Card>

      {/* ── Giới thiệu ──
          Mục DUY NHẤT không nằm trong thẻ, và đó là chủ ý: bốn mục trên là thứ
          để TRA — liếc, so, bấm. Mục này là thứ để ĐỌC. Đặt một đoạn văn vào
          cùng cái hộp với bảng kỹ năng là bảo người đọc rằng hai thứ đó dùng
          giống nhau, mà không phải.

          Bề rộng kẹp ở 720px vì lý do đã ghi ở `--container-prose`: nới ra
          1240px thì mỗi dòng mắt phải quét ngang xa hơn, đọc mệt chứ không đẹp. */}
      <SectionHead slug="giới_thiệu" title={tx.about[lang]} lang={jl} />
      <div
        lang={jl}
        className="prose max-w-[var(--container-prose)]"
        dangerouslySetInnerHTML={{ __html: lang === "ja" ? aboutJa : aboutVi }}
      />
    </>
  );
}
