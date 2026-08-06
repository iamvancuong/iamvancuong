import Link from "next/link";
import { Container } from "./Container";
import { nav, site } from "@/lib/site";
import { OsLink } from "./OsLink";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-line">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            className="text-[15px] font-semibold tracking-tight hover:text-ink-2"
          >
            {site.name}
          </Link>

          {/* Menu chung cho cả mobile và desktop — 4 mục thì không cần
              hamburger. Thêm MobileNav khi nào vượt quá 5 mục. */}
          <nav className="flex items-center gap-4 text-[14px] sm:gap-6">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-ink-2 transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <span className="h-4 w-px bg-line" aria-hidden />
            <ThemeToggle />
            <OsLink />
          </nav>
        </div>
      </Container>
    </header>
  );
}
