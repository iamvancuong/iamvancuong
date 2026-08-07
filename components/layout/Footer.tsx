"use client";

import Link from "next/link";
import { Container } from "./Container";
import { site } from "@/lib/site";
import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";

/**
 * Thứ tự = thứ tự khai trong `lib/site.ts`, tức là xếp theo mức liên quan tới
 * mục tiêu việc IT ở Nhật: GitHub và LinkedIn trước, mạng xã hội cá nhân sau.
 * Người tuyển dụng đọc footer từ trái sang.
 *
 * Chuỗi rỗng thì link tự biến mất — thêm/bớt một mạng chỉ là sửa `site.ts`,
 * không đụng file này.
 */
const links = [
  { key: "github", label: "GitHub", href: site.social.github },
  { key: "linkedin", label: "LinkedIn", href: site.social.linkedin },
  {
    key: "email",
    label: "Email",
    href: site.social.email ? `mailto:${site.social.email}` : "",
  },
  { key: "instagram", label: "Instagram", href: site.social.instagram },
  { key: "youtube", label: "YouTube", href: site.social.youtube },
  { key: "facebook", label: "Facebook", href: site.social.facebook },
].filter((l) => l.href !== "");

export function Footer() {
  const { lang } = useLang();
  return (
    <footer className="mt-12 border-t border-line py-10">
      <Container>
        <div className="flex flex-col gap-4 text-[13px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.fullName}
          </p>

          {/* Sáu link + Now ở màn hình hẹp thì tràn một hàng, nên cho xuống
              dòng thay vì bóp chữ. */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {links.map((l) => (
              <a
                key={l.key}
                href={l.href}
                target="_blank"
                /* noopener kèm noreferrer: thiếu nó thì trang mở ra vẫn chạm
                   được `window.opener` của trang này. */
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <Link href="/now" lang={lang === "ja" ? "ja" : undefined} className="transition-colors hover:text-ink">
              {t.now.title[lang]}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
