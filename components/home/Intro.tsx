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
import { PhotoStrip, type StripItem } from "./PhotoStrip";
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
  { href: "/projects", label: "Dự án" },
];

const FILL: Record<0 | 1 | 2 | 3, string> = {
  0: "bg-surface-2",
  1: "bg-ink/20",
  2: "bg-ink/55",
  3: "bg-ink",
};

/**
 * HAI loại mục, và đây là thay đổi chính của lần làm lại giao diện.
 *
 * Trước đây MỌI mục đều là `HERO`: cao đúng một màn hình, mọi thứ căn giữa.
 * Sáu mục liên tiếp cùng một hình dạng thì dù nội dung khác nhau, mắt vẫn đọc
 * ra "lại một màn nữa giống hệt màn vừa rồi" — đó chính là cảm giác đơn điệu,
 * và nó đến từ NHỊP chứ không phải từ màu hay font.
 *
 * Giờ chỉ hero giữ nguyên (nó là bìa sách, căn giữa là đúng). Các mục nội dung
 * chuyển sang `BAND`: cao theo nội dung, chữ căn TRÁI. Căn trái còn đọc nhanh
 * hơn hẳn ở đoạn văn dài — mắt luôn biết dòng sau bắt đầu ở đâu.
 */
const HERO = "flex min-h-[calc(100svh-4rem)] items-center py-16";
const BAND = "py-20 md:py-28";

export function Intro({
  streaks,
  journey,
  stripJourney,
  stripBlog,
}: {
  streaks: PublicStreaks;
  journey: JourneyYear[];
  stripJourney: StripItem[];
  stripBlog: StripItem[];
}) {
  const { lang } = useLang();
  const jl = lang === "ja" ? "ja" : undefined;

  // Ô nhiệt: bỏ các ô TRỐNG ở đầu (trước ngày hoạt động đầu tiên) để dải bắt
  // đầu từ bên trái — web vừa chạy thì nhỏ, lớn dần theo ngày, không phơi cả
  // chục tuần quá khứ trống. Chưa có hoạt động nào thì hiện tuần gần nhất.
  const heatCells = (() => {
    const h = streaks.heatmap;
    const first = h.findIndex((c) => c.level > 0);
    return first === -1 ? h.slice(-7) : h.slice(first);
  })();

  useEffect(() => {
    const el = document.documentElement;
    el.classList.add("snap");
    return () => el.classList.remove("snap");
  }, []);

  /**
   * Tiêu đề mục: một nhãn nhỏ chữ hoa ở trên, tiêu đề lớn ở dưới.
   *
   * Nhãn nhỏ làm việc mà một đường kẻ ngang vẫn hay bị bắt làm: báo "sang mục
   * mới". Khác ở chỗ nó còn NÓI được mục đó là gì, nên vừa phân đoạn vừa mang
   * thông tin — trong khi đường kẻ chỉ chiếm chỗ.
   */
  const Heading = ({
    label,
    children,
  }: {
    label?: string;
    children: ReactNode;
  }) => (
    <>
      {label && (
        <div
          lang={jl}
          className="mb-3 text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3"
        >
          {label}
        </div>
      )}
      <h2
        lang={jl}
        className="text-[32px] font-semibold leading-[1.08] tracking-[-0.025em] text-ink md:text-[44px]"
      >
        {children}
      </h2>
    </>
  );

  const socialRow = (
    // `justify-start`: cả hai chỗ dùng nó (hero và liên hệ) đều đã căn trái.
    <div className="flex items-center justify-start gap-3">
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
    // `text-center` KHÔNG còn ở đây nữa — nó đã chuyển vào riêng hằng HERO, để
    // các mục nội dung bên dưới được căn trái.
    <div className="md:-mt-20">
      {/* ── HERO ─────────────────────────────────────────────── */}
      {/* Nút chuyển ngôn ngữ nằm ở header (dùng chung cả site) — không lặp lại ở đây. */}
      {/*
        Hero NẰM NGANG: chữ bên trái, ảnh bên phải.

        Bản cũ xếp dọc và căn giữa — ảnh tròn, rồi lời chào, rồi tên, rồi mô
        tả, mỗi thứ một dòng riêng giữa màn hình. Kiểu đó ăn trọn chiều cao mà
        chỉ nói được đúng một câu, và nó là bố cục mặc định của mọi trang cá
        nhân dựng từ template — nhìn phát ra ngay.

        Nằm ngang thì hai nửa làm việc cùng lúc: đọc tên và nhìn mặt trong một
        lần nhìn, không phải cuộn. Ảnh đổi từ hình TRÒN nhỏ sang KHUNG NGANG
        4:3 — tròn thì cắt mất bối cảnh và luôn trông như ảnh đại diện hồ sơ,
        khung ngang giữ được cả khung hình.

        Ảnh xuống DƯỚI chữ trên điện thoại (`order`): màn hẹp thì thứ cần đọc
        trước là tên, không phải ảnh.
      */}
      <section className={HERO}>
        <div className="grid w-full items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14 lg:gap-20">
          <div className="order-2 md:order-1">
            {/* `rise-mask`: chữ trồi lên từ khung cắt. `pb/-mb` chừa chỗ cho
                đuôi chữ (g, y, ợ) khỏi bị cắt — xem chú thích ở globals.css. */}
            <p
              lang={jl}
              className="rise-mask -mb-[0.14em] pb-[0.14em] text-[12px] uppercase tracking-[0.16em] text-ink-3"
            >
              <span style={{ animationDelay: "60ms" }}>
                {home.hero.greeting[lang]}
              </span>
            </p>

            <h1
              lang={jl}
              className="rise-mask -mb-[0.14em] mt-3 pb-[0.14em] text-[clamp(2.5rem,6.5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-ink"
            >
              <span style={{ animationDelay: "160ms" }}>
                {home.hero.name[lang]}
              </span>
            </h1>

            <p
              lang={jl}
              className="animate-fade-up mt-5 max-w-[34ch] text-[18px] leading-snug text-ink-2 md:text-[21px]"
              style={{ animationDelay: "420ms" }}
            >
              {home.hero.tagline[lang]}
            </p>

            <div
              className="animate-fade-up mt-8"
              style={{ animationDelay: "520ms" }}
            >
              {socialRow}
            </div>

            <div
              className="animate-fade-up mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px]"
              style={{ animationDelay: "600ms" }}
            >
              <a
                href="#about"
                lang={jl}
                className="font-medium text-accent underline decoration-accent/35 decoration-1 underline-offset-[4px] transition-colors hover:decoration-accent"
              >
                {home.hero.ctaAbout[lang]}
              </a>
              <Link
                href="/journey"
                lang={jl}
                className="text-ink-2 transition-colors hover:text-ink"
              >
                {home.hero.ctaJourney[lang]}
              </Link>
            </div>
          </div>

          {/*
            HAI hình dạng, theo bề ngang màn hình.

            **Điện thoại → tròn nhỏ.** Màn hẹp thì hero xếp dọc, ảnh nằm trên
            chữ; một khung chữ nhật cao 400px ở đó đẩy hết tên và mô tả xuống
            dưới màn hình đầu tiên. Hình tròn 180px chiếm ít chỗ hơn hẳn và
            nhẹ mắt hơn khi nó là thứ đầu tiên đập vào.

            **Máy tính → khung đứng 3:4**, đúng tỉ lệ ảnh gốc 1922×2560 nên
            `object-cover` không cắt một pixel nào. Trước đó khung để 4:3
            (ngang) và cắt mất 44% chiều cao: cái "ngang" cần có là BỐ CỤC
            hero — chữ một bên, ảnh một bên — chứ không phải bản thân tấm ảnh.
            (Bản tròn vẫn cắt hai bên, nhưng ở cỡ nhỏ và với ảnh chân dung thì
            đó chính là kiểu cắt người ta mong đợi.)

            `ml-auto` đẩy ảnh sát mép phải để hai cột không hở một khoảng lạ
            ở giữa.
          */}
          <div className="order-1 md:order-2">
            <Frame
              src={home.images.hero.src}
              alt={home.images.hero.alt}
              priority
              sizes="(min-width: 768px) 40vw, 180px"
              className="animate-reveal-up mx-auto aspect-square w-full max-w-[180px] rounded-full border border-line md:mx-0 md:ml-auto md:aspect-[3/4] md:max-w-[380px] md:rounded-[var(--radius-xl)]"
            />
          </div>
        </div>
      </section>

      {/* ── HAI DẢI ẢNH ──────────────────────────────────────
          KHÔNG ép cao full màn như các mục khác: đây là băng để lướt qua,
          không phải một chặng dừng.

          Hai hàng chứ không phải một hàng trộn: bấm vào ảnh hành trình là sang
          dòng thời gian, bấm vào ảnh bài viết là sang bài đó — hai đích khác
          nhau thì phải nhìn ra được TRƯỚC khi bấm, không thì mỗi cú bấm là một
          lần đoán. */}
      {/* Cả hai dải rỗng thì bỏ luôn khoảng đệm của mục — nếu không, trang chủ
          có một khoảng trắng 200px không giải thích được ở giữa. */}
      <section
        className={
          stripJourney.length + stripBlog.length > 0
            ? "space-y-10 py-14 md:py-20"
            : ""
        }
      >
        <Reveal className="w-full">
          <PhotoStrip label="Hành trình" items={stripJourney} />
        </Reveal>
        <Reveal className="w-full">
          <PhotoStrip label="Viết" items={stripBlog} />
        </Reveal>
      </section>

      {/* ── VỀ TÔI + KỸ NĂNG ─────────────────────────────────── */}
      {/* Hai cột LỆCH (2fr / 3fr) chứ không phải chia đôi: chia đôi thì hai bên
          nặng ngang nhau và mắt không biết đọc bên nào trước. Cột trái chỉ giữ
          tiêu đề và dính lại khi cuộn, nên lúc đọc đoạn dài vẫn luôn thấy mình
          đang ở mục nào. */}
      <section id="about" className={`${BAND} scroll-mt-20`}>
        {/* `stagger` so le theo CON TRỰC TIẾP, mà ở đây chỉ còn đúng một lưới
            — nên dùng Reveal thường, không thì delay rơi vào hư không. */}
        <Reveal className="w-full">
          <div className="grid gap-10 md:grid-cols-[2fr_3fr] md:gap-16">
            <div className="md:sticky md:top-24 md:self-start">
              <Heading>{home.about.heading[lang]}</Heading>
              <p
                lang={jl}
                className="mt-4 max-w-[24ch] text-[19px] font-medium leading-snug text-ink-2 md:text-[21px]"
              >
                {home.about.slogan[lang]}
              </p>
            </div>

            <div>
              <div
                lang={jl}
                className="max-w-[62ch] space-y-5 text-[17px] leading-relaxed text-ink-2 md:text-[18px]"
              >
                {home.about.paragraphs[lang].map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {/* Ba dữ kiện: bỏ khung viền bo 24px, chỉ còn đường kẻ mảnh ngăn
                  giữa. Khung viền quanh ba ô chữ ngắn làm chúng trông như nút
                  bấm được — mà chúng không bấm được. */}
              <dl className="mt-10 grid grid-cols-1 divide-y divide-line-soft border-y border-line-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {home.facts.map((f) => (
                  <div key={f.label.vi} className="py-4 sm:px-5 sm:first:pl-0">
                    <dt
                      lang={jl}
                      className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-3"
                    >
                      {f.label[lang]}
                    </dt>
                    <dd lang={jl} className="mt-1.5 text-[15px] text-ink">
                      {f.value[lang]}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-10">
                <div
                  lang={jl}
                  className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-3"
                >
                  {home.skills.heading[lang]}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {home.skills.items.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-line px-3.5 py-1.5 text-[13px] text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── CHUỖI + Ô NHIỆT ──────────────────────────────────── */}
      <section className={BAND}>
        <Reveal stagger className="w-full">
          <div>
            <Heading>{home.streaks.heading[lang]}</Heading>
            <p lang={jl} className="mt-3 text-[15px] text-ink-3">
              {home.streaks.caption[lang]}
            </p>
          </div>

          {/* Con số phóng lên 64px và bỏ hết khung: ba con số lớn tự nó đã là
              ba khối rõ ràng, thêm viền chỉ là vẽ lại ranh giới mà mắt đã thấy
              sẵn. Ngọn lửa lùi về làm dấu nhỏ cạnh nhãn, không còn đứng giữa
              hét lên ở mỗi ô. */}
          <dl className="mt-10 grid grid-cols-1 divide-y divide-line-soft border-y border-line-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {home.streaks.items.map((it) => {
              const n = streaks[it.key];
              return (
                <div key={it.key} className="py-7 sm:px-7 sm:first:pl-0">
                  <dd className="flex items-baseline gap-1.5">
                    <span className="text-[52px] font-semibold leading-none tabular-nums text-ink md:text-[64px]">
                      {n}
                    </span>
                    <span lang={jl} className="text-[14px] text-ink-3">
                      {home.streaks.unit[lang]}
                    </span>
                  </dd>
                  <dt
                    lang={jl}
                    className="mt-3 flex items-center gap-1.5 text-[15px] font-medium text-ink"
                  >
                    <Flame
                      size={15}
                      strokeWidth={1.75}
                      aria-hidden
                      className={n > 0 ? "text-ink-2" : "text-ink-3"}
                    />
                    {it.label[lang]}
                  </dt>
                </div>
              );
            })}
          </dl>

          {/* Ô nhiệt — cũng bỏ khung, chỉ còn nhãn và dải ô. */}
          <div className="mt-10">
            <div
              lang={jl}
              className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-3"
            >
              {home.streaks.heatmapLabel[lang]}
            </div>
            <div className="mt-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="grid w-max grid-flow-col grid-rows-7 gap-1">
                {heatCells.map((c) => (
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
      <section className={BAND}>
        <Reveal className="w-full">
          <Heading>{home.journey.heading[lang]}</Heading>
          <p lang={jl} className="mt-3 text-[15px] text-ink-3">
            {home.journey.caption[lang]}
          </p>
        </Reveal>
        <div className="mt-12 w-full">
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
          Chỉ có `pt`, KHÔNG có `pb`: khoảng cách xuống footer để `main` và
          `footer` tự lo, giống mọi trang khác. Thêm `pb` ở đây là mục cuối của
          riêng trang chủ bị đẩy xa footer hơn các trang còn lại. */}
      <section className="pt-16 md:pt-24">
        <Reveal stagger className="w-full">
          <Heading>{home.contact.heading[lang]}</Heading>
          <p lang={jl} className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-ink-2">
            {home.contact.line[lang]}
          </p>

          <ContactForm lang={lang} />

          <div className="mt-10 flex justify-start">{socialRow}</div>

          <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-8 text-[14px]">
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
