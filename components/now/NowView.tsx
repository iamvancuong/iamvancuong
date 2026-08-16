"use client";

import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";
import type { Focus } from "@/lib/now";
import { PageHeader } from "@/components/layout/PageHeader";

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
      <PageHeader index={2} label="Dạo này" en="Now" lang={jl} title={t.now.title[lang]}>
        <span lang={jl}>{t.now.updated[lang]}</span>: {d.updated}
      </PageHeader>

      {/*
        LƯỚI THẺ thay cho danh sách dọc.

        Bản cũ là một cột: số thứ tự, nhãn, tiêu đề, mô tả — lặp sáu lần theo
        chiều dọc. Đọc được, nhưng sáu mục đều dài bằng nhau xếp dọc thì mắt
        không so sánh được cái nào với cái nào; mà "dạo này" chính là một BẢNG
        TỔNG QUAN, thứ tồn tại để liếc một cái thấy hết.

        Lưới ba cột cho phép liếc. Số thứ tự chuyển sang màu nhấn và nhãn lĩnh
        vực thành viên bo tròn — hai chi tiết đó biến mỗi ô thành một đơn vị
        khép kín, thay vì bốn dòng chữ nằm cạnh nhau.
      */}
      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {d.focus.map((f, i) => (
          <li
            key={i}
            className="rounded-[var(--radius-xl)] border border-line bg-surface p-5 transition-colors hover:border-ink-3"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="tag text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                lang={jl}
                className="tag shrink-0 rounded-full bg-surface-2 px-2.5 py-1"
              >
                {f.area}
              </span>
            </div>

            <h2
              lang={jl}
              className="mt-6 text-[20px] font-semibold leading-snug tracking-[-0.01em]"
            >
              {f.title}
            </h2>
            {f.detail && (
              <p
                lang={jl}
                className="mt-2 text-[15px] leading-relaxed text-ink-2"
              >
                {f.detail}
              </p>
            )}
          </li>
        ))}
      </ol>

      {/* Phần chữ dài đặt trong khung trắng như một thẻ nữa, không để trần —
          chữ trần trên nền kem ngay dưới một lưới thẻ thì trông như phần bị
          bỏ quên khi dựng giao diện. */}
      {d.bodyHtml.trim() && (
        <div
          lang={jl}
          className="prose mt-4 rounded-[var(--radius-xl)] border border-line bg-surface px-6 py-7"
          dangerouslySetInnerHTML={{ __html: d.bodyHtml }}
        />
      )}
    </>
  );
}
