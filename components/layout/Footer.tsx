import Link from "next/link";
import { Container } from "./Container";
import { site } from "@/lib/site";

const links = [
  { key: "github", label: "GitHub", href: site.social.github },
  { key: "instagram", label: "Instagram", href: site.social.instagram },
  { key: "youtube", label: "YouTube", href: site.social.youtube },
  {
    key: "email",
    label: "Email",
    href: site.social.email ? `mailto:${site.social.email}` : "",
  },
].filter((l) => l.href !== "");

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line py-10">
      <Container>
        <div className="flex flex-col gap-4 text-[13px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.fullName}
          </p>

          <div className="flex items-center gap-5">
            {links.map((l) => (
              <a
                key={l.key}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <Link href="/now" className="transition-colors hover:text-ink">
              Now
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
