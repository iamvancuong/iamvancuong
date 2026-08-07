"use client";

import { useState } from "react";
import Link from "next/link";
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

  return (
    <header className="animate-fade-down sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center gap-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="shrink-0 text-[15px] font-semibold tracking-tight transition-opacity hover:opacity-70"
          >
            iamvancuong
          </Link>

          {/* Nav ngang — chỉ từ md trở lên. Màn nhỏ dùng menu hamburger bên dưới. */}
          <nav className="hidden flex-1 items-center justify-center gap-5 text-[14px] md:flex lg:gap-7">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                lang={jl}
                className="nav-link whitespace-nowrap text-ink-2 transition-colors hover:text-ink"
              >
                {item.label[lang]}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2.5 md:ml-0">
            <div className="hidden md:block">
              <LangToggle size="sm" />
            </div>
            <span className="hidden h-4 w-px bg-line md:block" aria-hidden />
            <ThemeToggle />
            <OsLink />

            {/* Nút mở menu — chỉ hiện dưới md */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={t.menu[lang]}
              className="flex items-center rounded-[var(--radius-md)] p-1.5 text-ink-2 transition-colors hover:bg-surface hover:text-ink md:hidden"
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
                  className="rounded-[var(--radius-md)] px-2 py-2.5 text-[15px] text-ink-2 transition-colors hover:bg-surface hover:text-ink"
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
