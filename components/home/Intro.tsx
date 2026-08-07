"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { home } from "@/lib/home";
import { useLang } from "@/components/i18n/LangProvider";
import { site } from "@/lib/site";
import type { PublicStreaks } from "@/lib/streaks";
import type { JourneyYear } from "@/lib/journey";
import { Frame } from "./Frame";
import { Journey } from "./Journey";
import { ContactForm } from "./ContactForm";
import { BrandIcon, type BrandName } from "./BrandIcon";
import { Reveal } from "@/components/Reveal";

const ALL_SOCIALS: { name: BrandName; href: string }[] = [
  { name: "github", href: site.social.github },
  { name: "linkedin", href: site.social.linkedin },
  { name: "instagram", href: site.social.instagram },
  { name: "youtube", href: site.social.youtube },
  { name: "tiktok", href: site.social.tiktok },
];
const HERO_SOCIALS = ALL_SOCIALS.filter((s) => s.href);

const MORE = [
  { href: "/blog", label: "Viết" },
  { href: "/now", label: "Dạo này" },
  { href: "/journey", label: "Hành trình" },
  { href: "/photos", label: "Ảnh" },
  { href: "/projects", label: "Dự án" },
];

const FILL: Record<0 | 1 | 2 | 3, string> = {
  0: "bg-surface-2",
  1: "bg-ink/20",
  2: "bg-ink/55",
  3: "bg-ink",
};

const SECTION = "flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center py-16";

export function Intro({ streaks, journey }: { streaks: PublicStreaks; journey: JourneyYear[] }) {
  const { lang } = useLang();
  const jl = lang === "ja" ? "ja" : undefined;

  useEffect(() => {
    const el = document.documentElement;
    el.classList.add("snap");
    return () => el.classList.remove("snap");
  }, []);

  const Heading = ({ children }: { children: ReactNode }) => (
    <h2 lang={jl} className="text-[28px] font-semibold tracking-[-0.01em] text-ink md:text-[34px]">
      {children}
    </h2>
  );

  const socialRow = (
    <div className="flex items-center justify-center gap-3">
      {HERO_SOCIALS.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.name}
          className="flex size-10 items-center justify-center rounded-full border border-line text-ink-2 transition-colors hover:border-ink hover:bg-ink hover:text-bg"
        >
          <BrandIcon name={s.name} size={17} />
        </a>
      ))}
    </div>
  );

  return (
    // Không kéo âm trên mobile: màn thấp dễ đẩy hero lên dưới header dính. Chỉ
    // căn giữa toàn viewport từ md trở lên.
    <div className="text-center md:-mt-20">
      {/* ── HERO ─────────────────────────────────────────────── */}
      {/* Nút chuyển ngôn ngữ nằm ở header (dùng chung cả site) — không lặp lại ở đây. */}
      <section className={SECTION}>
        <div className="animate-fade-up">
          <Frame
            src={home.images.hero.src}
            alt={home.images.hero.alt}
            priority
            sizes="224px"
            className="size-40 rounded-full ring-1 ring-line md:size-52"
          />
        </div>

        <p lang={jl} className="animate-fade-up mt-7 text-[12px] uppercase tracking-[0.16em] text-ink-3" style={{ animationDelay: "150ms" }}>
          {home.hero.greeting[lang]}
        </p>
        <h1 lang={jl} className="animate-fade-up mt-3 text-balance px-2 text-[clamp(2.25rem,7.5vw,5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-ink" style={{ animationDelay: "210ms" }}>
          {home.hero.name[lang]}
        </h1>
        <p lang={jl} className="animate-fade-up mt-4 max-w-[32ch] text-[18px] leading-snug text-ink-2 md:text-[21px]" style={{ animationDelay: "280ms" }}>
          {home.hero.tagline[lang]}
        </p>

        <div className="animate-fade-up mt-7" style={{ animationDelay: "350ms" }}>{socialRow}</div>

        <div className="animate-fade-up mt-9 flex items-center justify-center gap-6 text-[14px]" style={{ animationDelay: "430ms" }}>
          <a href="#about" lang={jl} className="font-medium text-accent underline decoration-accent/35 decoration-1 underline-offset-[4px] transition-colors hover:decoration-accent">
            {home.hero.ctaAbout[lang]}
          </a>
          <Link href="/journey" lang={jl} className="text-ink-2 transition-colors hover:text-ink">
            {home.hero.ctaJourney[lang]}
          </Link>
        </div>
      </section>

      {/* ── VỀ TÔI + KỸ NĂNG ─────────────────────────────────── */}
      <section id="about" className={`${SECTION} scroll-mt-20`}>
        <Reveal stagger className="w-full">
          <Heading>{home.about.heading[lang]}</Heading>

          <p lang={jl} className="mx-auto mt-5 max-w-[26ch] text-[21px] font-medium leading-snug text-ink md:text-[24px]">
            {home.about.slogan[lang]}
          </p>

          <div lang={jl} className="mx-auto mt-7 max-w-[60ch] space-y-5 text-[17px] leading-relaxed text-ink-2 md:text-[18px]">
            {home.about.paragraphs[lang].map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mx-auto mt-10 grid max-w-[620px] grid-cols-1 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3">
            {home.facts.map((f) => (
              <div key={f.label.vi} className="bg-bg px-4 py-6">
                <div lang={jl} className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">
                  {f.label[lang]}
                </div>
                <div lang={jl} className="mt-2 text-[15px] text-ink">
                  {f.value[lang]}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-[640px]">
            <div lang={jl} className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
              {home.skills.heading[lang]}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2.5">
              {home.skills.items.map((s) => (
                <span key={s} className="rounded-full border border-line px-4 py-2 text-[14px] font-medium text-ink-2">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── CHUỖI + Ô NHIỆT ──────────────────────────────────── */}
      <section className={SECTION}>
        <Reveal stagger className="w-full">
          <Heading>{home.streaks.heading[lang]}</Heading>
          <p lang={jl} className="mx-auto mt-3 text-[14px] text-ink-3">{home.streaks.caption[lang]}</p>

          <div className="mx-auto mt-10 grid max-w-[760px] grid-cols-1 gap-4 sm:grid-cols-3">
            {home.streaks.items.map((it) => {
              const n = streaks[it.key];
              return (
                <div key={it.key} className="rounded-3xl border border-line bg-bg px-6 py-8">
                  <Flame size={22} strokeWidth={1.75} className={`mx-auto ${n > 0 ? "text-ink" : "text-ink-3"}`} />
                  <div className="mt-3 flex items-baseline justify-center gap-1.5">
                    <span className="text-[46px] font-semibold leading-none tabular-nums text-ink">{n}</span>
                    <span lang={jl} className="text-[13px] text-ink-3">{home.streaks.unit[lang]}</span>
                  </div>
                  <div lang={jl} className="mt-3 text-[15px] font-medium text-ink">{it.label[lang]}</div>
                </div>
              );
            })}
          </div>

          {/* Ô nhiệt như trong /os */}
          <div className="mx-auto mt-6 max-w-[760px] rounded-3xl border border-line bg-bg p-6">
            <div lang={jl} className="text-left text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
              {home.streaks.heatmapLabel[lang]}
            </div>
            <div className="mt-4 overflow-x-auto">
              <div className="grid grid-flow-col grid-rows-7 gap-1">
                {streaks.heatmap.map((c) => (
                  <span
                    key={c.iso}
                    title={c.iso}
                    className={`size-3 rounded-[3px] ${FILL[c.level]} ${c.isToday ? "ring-1 ring-accent" : ""}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── CHẶNG ĐƯỜNG Ở NHẬT ───────────────────────────────── */}
      <section className={`${SECTION} py-20`}>
        <Reveal className="w-full">
          <Heading>{home.journey.heading[lang]}</Heading>
          <p lang={jl} className="mx-auto mt-3 text-[14px] text-ink-3">
            {home.journey.caption[lang]}
          </p>
        </Reveal>
        <div className="mt-14 w-full">
          <Journey years={journey} lang={lang} />
        </div>
        {journey.length > 0 && (
          <div className="mt-10">
            <Link href="/journey" lang={jl} className="text-[14px] text-ink-2 underline underline-offset-4 transition-colors hover:text-ink">
              {home.journey.viewAll[lang]}
            </Link>
          </div>
        )}
      </section>

      {/* ── LIÊN HỆ (FORM) + Khám phá ──────────────────────────
          Section CUỐI KHÔNG ép cao full màn: `min-h` + `justify-center` để lại
          khoảng trống lớn dưới "Khám phá thêm" trước footer. Cho nó ôm sát nội
          dung; khoảng cách tới footer khi đó bằng các trang khác (main pb + footer mt). */}
      <section className="flex flex-col items-center pt-16 md:pt-24">
        <Reveal stagger className="w-full">
          <Heading>{home.contact.heading[lang]}</Heading>
          <p lang={jl} className="mx-auto mt-4 max-w-[48ch] text-[17px] leading-relaxed text-ink-2">
            {home.contact.line[lang]}
          </p>

          <ContactForm lang={lang} />

          <div className="mt-10">{socialRow}</div>

          <div className="mx-auto mt-14 flex max-w-[760px] flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-line pt-8 text-[14px]">
            <span lang={jl} className="text-ink-3">{home.more[lang]}:</span>
            {MORE.map((m) => (
              <Link key={m.href} href={m.href} className="text-ink-2 transition-colors hover:text-ink">
                {m.label}
              </Link>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
