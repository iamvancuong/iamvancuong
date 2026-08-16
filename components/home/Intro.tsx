"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { home } from "@/lib/home";
import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";
import { site } from "@/lib/site";
import type { PublicStreaks } from "@/lib/streaks";
import type { JourneyYear } from "@/lib/journey";
import { Frame } from "./Frame";
import { Journey } from "./Journey";
import { ContactForm } from "./ContactForm";
import { BrandIcon, type BrandName } from "./BrandIcon";
import { PhotoStrip, type StripItem } from "./PhotoStrip";
import { Heatmap } from "./Heatmap";
import type { TimelineRow } from "@/lib/timeline";
import { PostCard } from "@/components/blog/PostCard";
import type { PostWithTags } from "@/lib/posts-format";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/layout/SectionLabel";

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
/**
 * Hai loại dải nền, XEN KẼ từ trên xuống: kem → trắng → kem → trắng.
 *
 * Nền một màu suốt cả trang thì dù mỗi mục có tiêu đề riêng, mắt vẫn trôi tuột
 * từ đầu tới cuối và không biết mình vừa qua mấy mục. Đổi nền là cách phân
 * đoạn duy nhất không tốn thêm chữ, thêm đường kẻ, hay thêm khoảng trắng.
 *
 * `.band` + `.band-white` tràn hết bề ngang màn hình dù nằm trong container —
 * xem globals.css để biết vì sao không dùng `100vw`.
 */
const BAND = "band py-20 md:py-28";
const BAND_WHITE = "band band-white py-20 md:py-28";

export function Intro({
  streaks,
  journey,
  stripJourney,
  stripBlog,
  posts,
  rows,
}: {
  streaks: PublicStreaks;
  journey: JourneyYear[];
  stripJourney: StripItem[];
  stripBlog: StripItem[];
  posts: PostWithTags[];
  rows: TimelineRow[];
}) {
  const { lang } = useLang();
  const jl = lang === "ja" ? "ja" : undefined;

  /**
   * Giữ NGUYÊN cả 119 ngày, không cắt bỏ những ngày trống ở đầu nữa.
   *
   * Bản trước cắt vì lưới chỉ hiện được một dải; giờ Heatmap có nút lùi/tiến
   * nên ngày trống ở đầu không còn chiếm chỗ của ngày có dữ liệu — nó nằm ở
   * kỳ trước, và đi tới đó là chuyện của người xem.
   */
  const heatCells = streaks.heatmap;

  useEffect(() => {
    const el = document.documentElement;
    el.classList.add("snap");
    return () => el.classList.remove("snap");
  }, []);

  /**
   * Tiêu đề mục: nhãn đánh số ở trên, tiêu đề lớn ở dưới, **kết bằng dấu chấm**.
   *
   * Dấu chấm là chi tiết nhỏ nhất nhưng làm nhiều nhất: nó biến một tiêu đề
   * thành một câu đã nói xong. "Ghi chép nhỏ" là một nhãn; "Ghi chép nhỏ." là
   * một lời tuyên bố. Cùng ký tự đó lặp lại ở logo và ở mọi mục — đó là thứ
   * khiến các trang trông như cùng một nhà mà không cần thêm màu hay khung.
   */
  const Heading = ({
    index,
    label,
    en,
    children,
  }: {
    index?: number;
    label?: string;
    en?: string;
    children: ReactNode;
  }) => (
    <>
      {index != null && label && (
        <div className="mb-5">
          <SectionLabel index={index} en={en}>
            {label}
          </SectionLabel>
        </div>
      )}
      <h2
        lang={jl}
        className="text-[34px] font-semibold leading-[1.06] tracking-[-0.03em] text-ink md:text-[46px]"
      >
        {children}
        <span className="text-accent">.</span>
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
            {/* `.tag` — cùng kiểu nhãn với `01 / VỀ TÔI` ở các mục dưới, nên
                lời chào đọc ra là một nhãn hệ thống chứ không phải một câu bỏ
                lửng. Xem globals.css. */}
            <p
              lang={jl}
              className="tag rise-mask -mb-[0.14em] pb-[0.14em]"
            >
              <span style={{ animationDelay: "60ms" }}>
                {home.hero.greeting[lang]}
              </span>
            </p>

            <h1
              lang={jl}
              className="rise-mask -mb-[0.14em] mt-4 pb-[0.14em] text-[clamp(2.5rem,6.5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-ink"
            >
              <span style={{ animationDelay: "160ms" }}>
                {home.hero.name[lang]}
                <span className="text-accent">.</span>
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
          <div className="relative order-1 mx-auto w-full max-w-[180px] md:order-2 md:ml-auto md:mr-0 md:max-w-[380px]">
            <Frame
              src={home.images.hero.src}
              alt={home.images.hero.alt}
              priority
              sizes="(min-width: 768px) 40vw, 180px"
              className="animate-reveal-up aspect-square w-full rounded-full border border-line md:aspect-[3/4] md:rounded-[var(--radius-xl)]"
            />

            {/* Huy hiệu trạng thái — CHỈ từ md trở lên. Trên điện thoại ảnh là
                hình tròn 180px, dán một nhãn chữ nhật lên góc nó thì nhãn to
                gần bằng ảnh và cắt mất mặt người.
                Chấm xanh có `animate-pulse`: đó là thứ khiến nó đọc ra là một
                trạng thái đang sống, chứ không phải một nhãn dán tĩnh. */}
            <div className="absolute -bottom-3 -left-3 hidden rounded-[var(--radius-lg)] border border-line bg-surface px-3 py-2 shadow-sm md:block">
              <div className="tag flex items-center gap-1.5 text-ink-2">
                <span className="size-1.5 animate-pulse rounded-full bg-up" />
                Available
              </div>
              <div className="tag mt-0.5">Tokyo · JP</div>
            </div>
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
            ? "band band-white space-y-10 py-14 md:py-20"
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
              <Heading index={1} label="Về tôi" en="About">
                {home.about.heading[lang]}
              </Heading>
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
      <section className={BAND_WHITE}>
        <Reveal stagger className="w-full">
          <div>
            <Heading index={2} label="Đang duy trì" en="Life OS">
              {home.streaks.heading[lang]}
            </Heading>
            <p lang={jl} className="mt-3 text-[15px] text-ink-3">
              {home.streaks.caption[lang]}
            </p>
          </div>

          {/* Lịch hoạt động lên TRƯỚC ba thẻ: nó là bức tranh cả năm, ba thẻ
              là con số rút ra từ bức tranh đó. Đọc tranh rồi mới đọc số.
              Component riêng vì nó có TRẠNG THÁI (đang xem năm nào). */}
          <div className="mt-10">
            <Heatmap
              cells={heatCells}
              label={home.streaks.heatmapLabel[lang]}
              currentYear={streaks.currentYear}
            />
          </div>

          {/*
            BA THẺ TRẮNG, không phải ba cột chia bằng đường kẻ.

            Bản trước bỏ hết khung với lý do "ba con số lớn tự nó đã là ba
            khối". Đúng về mặt lý thuyết, sai khi đặt lên nền KEM: chữ nổi trên
            kem thì mọi thứ cùng một mặt phẳng, và ba con số trôi thành một dãy
            chứ không thành ba đơn vị. Có thẻ trắng thì mỗi con số có một cái
            hộp của riêng nó — đó là lý do thiết kế tham chiếu dùng thẻ.

            Vạch tiến độ dưới mỗi số: con số trần không nói được "nhiều hay ít".
            Vạch lấy mốc so là KỶ LỤC của chính chỉ số đó, nên nó trả lời đúng
            câu "mình đang gần mức tốt nhất từng đạt tới đâu".
          */}
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {home.streaks.items.map((it) => {
              const s = streaks[it.key];
              // Kẹp 4–100%: 0% là một vạch vô hình, trông như hỏng chứ không
              // như "chưa có gì".
              const pct =
                s.best > 0 ? Math.max(4, Math.min(100, (s.now / s.best) * 100)) : 0;
              return (
                <div
                  key={it.key}
                  className="rounded-[var(--radius-xl)] border border-line bg-surface p-5"
                >
                  <div className="flex items-start justify-between">
                    <span lang={jl} className="tag">
                      {it.label[lang]}
                    </span>
                    {/* Chấm trạng thái: xanh khi đang có nhịp, xám khi đứng —
                        thay cho ngọn lửa cũ vốn to và hét lên ở cả ba ô. */}
                    <span
                      className={`mt-0.5 size-1.5 shrink-0 rounded-full ${
                        s.now > 0 ? "bg-up" : "bg-ink-3/40"
                      }`}
                      aria-hidden
                    />
                  </div>

                  <dd className="mt-6 flex items-baseline gap-1.5">
                    <span className="text-[52px] font-semibold leading-none tabular-nums text-ink">
                      {s.now}
                    </span>
                    <span lang={jl} className="tag">
                      {home.streaks.unit[lang]}
                    </span>
                  </dd>

                  <div className="mt-5 h-px w-full bg-line">
                    <div
                      className={`h-px ${s.now > 0 ? "bg-up" : "bg-transparent"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Dòng nhỏ: con số lớn đo cái gì, và kỷ lục là bao nhiêu.
                      Cần thiết vì lập trình đếm CỘNG DỒN còn hai cái kia đếm
                      CHUỖI — không nói ra thì ba con số cạnh nhau trông như
                      cùng một đơn vị, và số của lập trình sẽ bị đọc nhầm
                      thành một chuỗi dài bất thường. */}
                  <dt lang={jl} className="mt-3 text-[12px] text-ink-3">
                    {s.mode === "total"
                      ? home.streaks.totalNote[lang]
                      : home.streaks.streakNote[lang]}
                    {s.best > 0 &&
                      ` · ${home.streaks.best[lang]} ${s.best} ${home.streaks.unit[lang]}`}
                  </dt>
                </div>
              );
            })}
          </dl>

        </Reveal>
      </section>

      {/* ── VIẾT ─────────────────────────────────────────────
          Trang chủ trước đây KHÔNG hề nhắc tới blog — thứ tốn công nhất và
          đáng đọc nhất lại chỉ vào được qua thanh nav. Ba bài mới nhất đặt
          ngay đây là đường ngắn nhất từ "ai đó vừa tới" sang "ai đó đang đọc".
          Dùng lại đúng PostCard của /blog: hai nơi hiện một bài thì phải hiện
          giống hệt nhau, nếu không mỗi lần sửa thẻ là phải sửa hai chỗ. */}
      {posts.length > 0 && (
        <section className={BAND}>
          <Reveal className="w-full">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <Heading index={3} label="Viết" en="Writing">
                {t.blog.title[lang]}
              </Heading>
              <Link
                href="/blog"
                className="tag rounded-full border border-line px-3.5 py-2 transition-colors hover:border-ink-3 hover:text-ink"
              >
                Xem tất cả →
              </Link>
            </div>

            <div className="mt-10 space-y-4">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ── CHẶNG ĐƯỜNG Ở NHẬT ───────────────────────────────── */}
      <section className={BAND}>
        <Reveal className="w-full">
          <Heading index={4} label="Chặng đường ở Nhật" en="Journey">
            {home.journey.heading[lang]}
          </Heading>
          <p lang={jl} className="mt-3 text-[15px] text-ink-3">
            {home.journey.caption[lang]}
          </p>
        </Reveal>
        {/*
          NẰM NGANG, không phải cuộn dọc.

          Bản trước là accordion dọc: mở một năm thì các năm khác bị đẩy xuống
          khỏi màn hình, nên không bao giờ thấy được TOÀN BỘ hành trình cùng
          lúc — mà "chặng đường" là thứ chỉ có nghĩa khi nhìn được cả chặng.

          Dải ngang giữ mọi năm trong một băng: liếc một cái thấy hết, và việc
          nó tràn khỏi mép phải chính là lời mời kéo tiếp.
        */}
        <div className="-mx-6 mt-10 overflow-x-auto px-6 pb-2 md:-mx-8 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex w-max gap-4">
            {rows.map((r) => (
              <li
                key={r.year}
                className="flex w-[260px] shrink-0 flex-col rounded-[var(--radius-xl)] border border-line bg-surface p-5"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-[44px] font-semibold leading-none tabular-nums tracking-[-0.04em] text-ink-3/40">
                    {r.year}
                  </span>
                  <span className="tag">
                    {r.memoryCount > 0 ? `${r.memoryCount} ký ức` : "chưa viết"}
                  </span>
                </div>

                {r.title && (
                  <div className="mt-4 text-[16px] font-semibold leading-snug tracking-[-0.01em]">
                    {r.title}
                  </div>
                )}
                {r.note && (
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
                    {r.note}
                  </p>
                )}

                {/* Ô tháng nhỏ hơn bản ở /journey: ở đây chúng là bản đồ thu
                    nhỏ, không phải thứ để đọc từng ô. */}
                <ul className="mt-auto flex flex-wrap gap-1 pt-5">
                  {r.months.map((m) => (
                    <li
                      key={m.month}
                      title={`Tháng ${m.month} · ${m.count > 0 ? `${m.count} ký ức` : "chưa viết"}`}
                      className={`size-5 rounded-[4px] ${m.count > 0 ? "bg-up" : "bg-surface-2"}`}
                    />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        {journey.length > 0 && (
          <div className="mt-8">
            <Link
              href="/journey"
              className="tag rounded-full border border-line px-3.5 py-2 transition-colors hover:border-ink-3 hover:text-ink"
            >
              {home.journey.viewAll[lang]} →
            </Link>
          </div>
        )}
      </section>

      {/* ── LIÊN HỆ (FORM) + Khám phá ──────────────────────────
          Chỉ có `pt`, KHÔNG có `pb`: khoảng cách xuống footer để `main` và
          `footer` tự lo, giống mọi trang khác. Thêm `pb` ở đây là mục cuối của
          riêng trang chủ bị đẩy xa footer hơn các trang còn lại. */}
      <section className="band band-white pt-16 md:pt-24 pb-20 md:pb-28">
        <Reveal stagger className="w-full">
          <Heading index={5} label="Kết nối" en="Contact">
            {home.contact.heading[lang]}
          </Heading>
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
