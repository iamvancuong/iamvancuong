"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Container } from "./Container";
import { nav } from "@/lib/site";
import { useLang } from "@/components/i18n/LangProvider";
import { LangToggle } from "@/components/i18n/LangToggle";
import { t } from "@/lib/i18n";
import { OsLink } from "./OsLink";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { lang } = useLang();
  const jl = lang === "ja" ? "ja" : undefined;
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  /** Mục đang mở — so theo tiền tố để /blog/<bài> vẫn sáng ở «Viết». */
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    // KHÔNG còn `border-b`: nav giờ là một viên thuốc nổi, mà một đường kẻ
    // ngang chạy hết bề ngang phía sau nó thì cắt đôi trang và làm viên thuốc
    // trông như bị đóng đinh vào thanh, chứ không phải nổi trên nền.
    <header className="animate-fade-down sticky top-0 z-40 bg-bg/85 backdrop-blur-md">
      <Container>
        <div className="flex h-[72px] items-center gap-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="shrink-0 text-[17px] font-semibold tracking-[-0.02em] transition-opacity hover:opacity-70"
          >
            iamvancuong
            {/* Dấu chấm xanh — cùng một dấu kết đặt ở cuối mọi tiêu đề lớn.
                Lặp lại đúng một ký tự ở nhiều chỗ là cách rẻ nhất để các trang
                trông như cùng một nhà. */}
            <span className="text-accent">.</span>
          </Link>

          {/* Nav ngang — chỉ từ md trở lên. Màn nhỏ dùng menu hamburger bên dưới. */}
          <nav className="ml-auto hidden items-center rounded-full border border-line bg-surface p-1 text-[13px] md:flex">
            {nav.map((item) => {
              const on = active(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  lang={jl}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors ${
                    on
                      ? "bg-ink font-medium text-bg"
                      : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {item.label[lang]}
                </Link>
              );
            })}
          </nav>

          {/* `ml-auto` chỉ còn tác dụng dưới md — từ md trở lên chính thanh nav
              đã đẩy sang phải, nên cụm này bám ngay sau nó. */}
          <div className="ml-auto flex shrink-0 items-center gap-2.5 md:ml-3">
            <div className="hidden md:block">
              <LangToggle size="sm" />
            </div>
            <ThemeToggle />
            <OsLink />

            {/* Nút mở menu — chỉ hiện dưới md */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={t.menu[lang]}
              className="flex items-center rounded-full border border-line bg-surface p-2 text-ink-2 transition-colors hover:text-ink md:hidden"
            >
              {open ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
            </button>
          </div>
        </div>
      </Container>

      {/* Panel menu mobile — trượt mở, chứa nav dọc + nút đổi ngôn ngữ */}
      <div
        className={`grid overflow-hidden border-line transition-[grid-template-rows,border-width] duration-300 ease-out md:hidden ${
          open ? "grid-rows-[1fr] border-t" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <Container>
            <nav className="flex flex-col py-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  lang={jl}
                  onClick={() => setOpen(false)}
                  className="rounded-[var(--radius-md)] px-2 py-2.5 text-[15px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  {item.label[lang]}
                </Link>
              ))}
              <div className="mt-2 border-t border-line px-2 pb-3 pt-3">
                <LangToggle />
              </div>
            </nav>
          </Container>
        </div>
      </div>
    </header>
  );
}
