"use client";

import Link from "next/link";
import { Download, Mail } from "lucide-react";
import { cv, experiences } from "@/lib/cv";
import type { Lang } from "@/lib/home";

/**
 * Bốn nhãn của riêng thẻ này — để ngay đây chứ không nhét vào `lib/i18n.ts`.
 *
 * `i18n.ts` là từ điển dùng CHUNG; thêm vào đó những chuỗi chỉ một component
 * xài thì file đó phình dần thành nơi chứa mọi thứ, và không còn ai đọc hết
 * được để biết chuỗi nào còn dùng. Chuỗi dùng một chỗ thì ở cạnh chỗ đó.
 */
const cvText = {
  available: { vi: "sẵn sàng làm việc", ja: "就業可能" },
  viewCv: { vi: "Xem CV", ja: "履歴書を見る" },
  contact: { vi: "Liên hệ", ja: "連絡する" },
} as const;

/**
 * Thẻ danh thiếp + dòng thời gian nghề nghiệp, đặt trên đầu trang Dự án.
 *
 * ## Vì sao nó nằm ở TRANG DỰ ÁN chứ không phải trang CV
 *
 * Người tuyển dụng vào trang dự án để xem *làm được gì*, rồi mới hỏi *người
 * này là ai*. Bắt họ nhảy sang một tab khác để trả lời câu thứ hai là chỗ rơi
 * rụng — mà hai câu đó cách nhau đúng một cú cuộn nếu đặt cạnh nhau.
 *
 * Dữ liệu dùng lại `lib/cv.ts` và `experiences` của `lib/projects.ts`, KHÔNG
 * khai lại. Trang /cv vẫn là bản đầy đủ để in ra PDF; đây là bản rút gọn.
 * Khai hai nơi thì một ngày nào đó hai nơi sẽ nói hai điều khác nhau, và không
 * ai biết bên nào đúng.
 */
export function CvCard({ lang }: { lang: Lang }) {
  const jl = lang === "ja" ? "ja" : undefined;

  return (
    <section className="grid gap-8 rounded-[var(--radius-xl)] border border-line bg-surface p-6 md:grid-cols-[1fr_1.1fr] md:p-8">
      {/* ── Danh thiếp ── */}
      <div>
        <div className="tag">// curriculum_vitae</div>

        <h2 lang={jl} className="mt-4 text-[26px] font-semibold tracking-[-0.02em]">
          {cv.name[lang]}
          <span className="text-accent">.</span>
        </h2>
        <div lang={jl} className="tag mt-1.5">
          {cv.title[lang]}
        </div>

        <p lang={jl} className="mt-4 text-[15px] leading-relaxed text-ink-2">
          {cv.summary[lang]}
        </p>

        <ul className="mt-5 space-y-1.5">
          {[
            cv.address[lang],
            `available: ${cvText.available[lang]}`,
            `stack: ${cv.skills[0].items[0].split(" (")[0]} · Angular · Next`,
          ].map((line) => (
            <li key={line} className="tag flex items-center gap-2 text-ink-2">
              <span className="size-1 shrink-0 rounded-full bg-accent" />
              {line}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/cv"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-bg transition-opacity hover:opacity-90"
          >
            <Download size={14} strokeWidth={2} />
            {cvText.viewCv[lang]}
          </Link>
          <a
            href={`mailto:${cv.email}`}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[14px] transition-colors hover:border-ink-3"
          >
            <Mail size={14} strokeWidth={1.75} />
            {cvText.contact[lang]}
          </a>
        </div>
      </div>

      {/* ── Dòng thời gian ── */}
      <div className="md:border-l md:border-line-soft md:pl-8">
        <div className="tag">// timeline</div>

        <ol className="mt-5 space-y-6 border-l border-line pl-5">
          {experiences.map((e) => (
            <li key={e.company + e.period} className="relative">
              <span
                className="absolute -left-[23px] top-1.5 size-2 rounded-full border-2 border-surface bg-accent"
                aria-hidden
              />
              <div className="tag">
                {e.period} · {e.company}
              </div>
              <div
                lang={jl}
                className="mt-1 text-[16px] font-semibold tracking-[-0.01em]"
              >
                {lang === "ja" ? (e.roleJa ?? e.role) : e.role}
              </div>
              {/* CHỈ gạch đầu dòng đầu tiên. Trang /cv có đủ; ở đây mà liệt kê
                  sáu gạch mỗi việc thì dòng thời gian dài hơn cả phần dự án
                  bên dưới, mà dự án mới là thứ trang này nói về. */}
              <p lang={jl} className="mt-1 text-[14px] leading-relaxed text-ink-2">
                {(lang === "ja" ? (e.bulletsJa ?? e.bullets) : e.bullets)[0]}
              </p>
            </li>
          ))}

          {cv.education.map((ed) => (
            <li key={ed.period} className="relative">
              <span
                className="absolute -left-[23px] top-1.5 size-2 rounded-full border-2 border-surface bg-ink-3"
                aria-hidden
              />
              <div className="tag">{ed.period}</div>
              <div lang={jl} className="mt-1 text-[16px] font-semibold tracking-[-0.01em]">
                {ed.school[lang]}
              </div>
              <p lang={jl} className="mt-1 text-[14px] text-ink-2">
                {ed.major[lang]} · {ed.note}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
