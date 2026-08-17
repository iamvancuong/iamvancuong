"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, Flame } from "lucide-react";
import { home } from "@/lib/home";
import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";
import { site } from "@/lib/site";
import type { PublicStreaks } from "@/lib/streaks";
import type { JourneyYear } from "@/lib/journey";
import { Frame } from "./Frame";
import { Journey } from "./Journey";
import { ContactForm } from "./ContactForm";
// `components/ui/`, không phải `./`: trang Hồ sơ cũng dùng icon GitHub, và
// lúc đó nó không còn là một mảnh của riêng trang chủ nữa.
import { BrandIcon, type BrandName } from "@/components/ui/BrandIcon";
import { Heatmap } from "./Heatmap";
import type { TimelineRow } from "@/lib/timeline";
import { WritingGrid } from "./WritingGrid";
import type { PostWithTags } from "@/lib/posts-format";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { quoted } from "./quoted";

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
const HERO =
  "relative flex min-h-[calc(100svh-4rem)] flex-col justify-center py-16";
/**
 * Phân đoạn giữa các mục — bằng ĐƯỜNG KẺ, không còn bằng màu nền.
 *
 * Bản trước xen kẽ nền kem → trắng → kem → trắng. Nền một màu suốt cả trang thì
 * dù mỗi mục có tiêu đề riêng, mắt vẫn trôi tuột từ đầu tới cuối và không biết
 * mình vừa qua mấy mục; đổi nền là cách phân đoạn không tốn thêm chữ.
 *
 * Từ lúc cả site về nền trắng (xem globals.css) thì cách đó hết dùng được —
 * hai loại dải bây giờ cùng một màu. Thay bằng một đường kẻ mảnh ở ĐẦU mỗi
 * mục: nó tốn đúng 1px, vẫn trả lời được câu «mình vừa qua mấy mục», và không
 * đòi con chữ nào.
 *
 * `.band` vẫn giữ: nó lo phần TRÀN HẾT BỀ NGANG màn hình cho đường kẻ, dù mục
 * nằm trong container hẹp. Xem globals.css để biết vì sao không dùng `100vw`.
 *
 * Mục ĐẦU TIÊN sau hero không lấy đường kẻ — hero đã là một mặt phẳng riêng,
 * thêm một vạch ngay dưới nó thì vạch đó đọc ra là chân của hero.
 */
const BAND = "band border-t border-line-soft py-20 md:py-28";
const BAND_WHITE = BAND;
/** Mục ngay sau hero — không kẻ. */
const BAND_FIRST = "band py-20 md:py-28";

export function Intro({
  streaks,
  journey,
  posts,
  rows,
}: {
  streaks: PublicStreaks;
  journey: JourneyYear[];
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
          // `bg-surface`, KHÔNG để trong suốt — và KHÔNG phải `bg-white`.
          //
          // Ở chế độ SÁNG dòng này giờ không đổi gì: từ lúc cả site về nền
          // trắng thì `--color-surface` bằng đúng `--color-bg`, nút phân biệt
          // với nền bằng `border-line`.
          //
          // Nó vẫn cần thiết ở chế độ TỐI: ở đó `--color-surface` (#1c1a15)
          // sáng hơn nền (#14120e), nên nút vẫn nhô lên khỏi trang. Viết
          // `bg-white` thì chế độ tối ra sáu đốm trắng chói.
          className="flex size-10 items-center justify-center rounded-full border border-line bg-surface text-ink-2 transition-colors hover:border-ink hover:bg-ink hover:text-bg"
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
                {/* CHẤM TRÒN, không phải ký tự dấu chấm.
                    Dấu chấm của font co theo font và ở cỡ 72px thì nó nhỏ xíu,
                    lệch xuống dưới đường chân chữ — trông như bụi bám chứ không
                    như một chi tiết có chủ ý. Một hình tròn vẽ tay giữ đúng tỉ
                    lệ ở mọi cỡ chữ vì nó tính bằng `em`. */}
                <span
                  aria-hidden
                  className="ml-[0.06em] inline-block size-[0.16em] rounded-full bg-accent align-baseline"
                />
              </span>
            </h1>

            <p
              lang={jl}
              className="animate-fade-up mt-5 max-w-[34ch] text-[18px] leading-snug text-ink-2 md:text-[21px]"
              style={{ animationDelay: "420ms" }}
            >
              {home.hero.tagline[lang]}
            </p>

            {/* HAI VIÊN THUỐC, không phải hai link chữ.

                Link gạch chân nằm lẫn trong một khối chữ thì nó là "chỗ bấm
                được", còn viên thuốc đặc là "việc nên làm tiếp theo". Hero cần
                loại thứ hai: khách vừa tới, chưa biết đi đâu, và trang phải
                trả lời hộ. Viên đặc = đường chính, viên viền = đường phụ. */}
            <div
              className="animate-fade-up mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "520ms" }}
            >
              <a
                href="#about"
                lang={jl}
                className="tag inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-medium text-bg transition-opacity hover:opacity-90"
              >
                {home.hero.ctaAbout[lang]}
              </a>
              <Link
                href="/journey"
                lang={jl}
                className="tag inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-3 text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
              >
                {home.hero.ctaJourney[lang]}
              </Link>
            </div>

            <div
              className="animate-fade-up mt-8"
              style={{ animationDelay: "620ms" }}
            >
              {socialRow}
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
              <div className="tag mt-0.5">Nagoya · JP</div>
            </div>
          </div>
        </div>

        {/*
          CHỈ DẪN CUỘN — chỉ hiện từ md trở lên.

          Hero cao trọn một màn hình nên không có mép nội dung nào thò ra dưới
          đáy để nói "còn nữa". Không có tín hiệu đó thì một phần khách đọc
          xong hero là đóng tab, tưởng trang chỉ có bấy nhiêu.

          Trên điện thoại thì bỏ: màn hẹp đã xếp dọc nên phần dưới luôn thò
          lên, tín hiệu đã có sẵn — thêm mũi tên chỉ là chiếm chỗ.

          `animate-bounce` của Tailwind tự tắt theo `prefers-reduced-motion`
          nhờ khối media query trong globals.css? KHÔNG — nó không tự tắt, nên
          phải khai `motion-reduce:animate-none` bằng tay.
        */}
        <a
          href="#about"
          aria-label="Cuộn xuống"
          className="animate-fade-up absolute inset-x-0 bottom-6 mx-auto hidden w-fit flex-col items-center gap-1.5 text-ink-3 transition-colors hover:text-ink md:flex"
          style={{ animationDelay: "800ms" }}
        >
          <span className="tag">Scroll</span>
          <ArrowDown
            size={14}
            strokeWidth={1.75}
            className="animate-bounce motion-reduce:animate-none"
          />
        </a>
      </section>

      {/* ── ĐÃ GỠ: HAI DẢI ẢNH «Hành trình» + «Viết» ─────────
          Chúng nằm ngay dưới hero và mang đúng hai cái tên của mục 03 (Viết)
          và mục 04 (Chặng đường ở Nhật) ở phía dưới. Người xem gặp chữ «Viết»
          hai lần trong một lần cuộn, mỗi lần một hình dạng khác — nên không
          đọc ra là "cùng một thứ", mà đọc ra là "trang này có hai mục viết".

          Bỏ dải ở TRÊN chứ không bỏ mục ở dưới: dải chỉ có ảnh bìa, còn mục
          dưới có tiêu đề, ngày, chủ đề và mô tả — cùng một cú bấm nhưng biết
          trước mình sắp mở cái gì. */}

      {/* ── VỀ TÔI ───────────────────────────────────────────
          Nội dung bên trái, THẺ THÔNG SỐ bên phải (1.6fr / 1fr).

          Bản trước để tiêu đề bên trái và dồn tất cả — đoạn văn, dữ kiện, kỹ
          năng — vào cột phải. Cột phải thành một cột dài lẫn lộn ba loại nội
          dung khác hẳn nhau: thứ để ĐỌC, thứ để TRA, và thứ để LIẾC. Ba loại
          đó cần ba cách trình bày, không phải ba khối xếp chồng.

          Giờ tách theo đúng loại: bên trái chỉ còn thứ để đọc; bên phải là một
          thẻ tra cứu — dữ kiện dạng bảng nhãn/giá trị, rồi stack dạng viên. */}
      <section id="about" className={`${BAND_FIRST} scroll-mt-20`}>
        <Reveal className="w-full">
          <SectionLabel index={1} en="About">
            Về tôi
          </SectionLabel>

          <div className="mt-8 grid gap-10 md:grid-cols-[1.6fr_1fr] md:gap-14">
            {/* ── Cột đọc ── */}
            <div>
              {/*
                KHẨU HIỆU lên làm tiêu đề, thay cho chữ "Về tôi".

                "Về tôi" là một cái nhãn — nó đã nằm ở dòng đánh số phía trên
                rồi, in lại lần nữa ở cỡ 46px là tốn một dòng lớn nhất trang để
                nói một điều người đọc vừa đọc xong. Khẩu hiệu thì nói được một
                điều mới, và nói bằng giọng của chủ nhân.
              */}
              <h2
                lang={jl}
                className="text-balance text-[34px] font-semibold leading-[1.12] tracking-[-0.03em] text-ink md:text-[46px]"
              >
                {quoted(home.about.slogan[lang])}
              </h2>

              <div
                lang={jl}
                className="mt-8 max-w-[62ch] space-y-5 text-[17px] leading-relaxed text-ink-2"
              >
                {home.about.paragraphs[lang].map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            {/* ── Thẻ thông số ── */}
            <aside className="h-fit rounded-[var(--radius-xl)] border border-line bg-surface p-6 md:sticky md:top-24">
              <div className="tag">// identity_specs</div>

              {/* Bảng nhãn TRÁI, giá trị PHẢI, kẻ ngăn từng dòng. Cùng một cặp
                  chữ đó xếp chồng dọc thì đọc ra là danh sách; xếp hai đầu một
                  dòng thì đọc ra là THÔNG SỐ — mắt biết ngay bên nào là tên,
                  bên nào là giá trị mà không cần nghĩ. */}
              <dl className="mt-4 divide-y divide-line-soft">
                {[
                  ...home.facts.map((f) => [f.label[lang], f.value[lang]] as const),
                  // Múi giờ: không có trong `home.facts` vì nó không phải một
                  // "dữ kiện đời" — nhưng với người tuyển dụng ở xa thì đây là
                  // dòng đáng giá nhất trong cả thẻ.
                  ["Timezone", "Asia/Tokyo"] as const,
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-baseline justify-between gap-4 py-3"
                  >
                    <dt lang={jl} className="tag shrink-0">
                      {k}
                    </dt>
                    <dd lang={jl} className="tag text-right text-ink">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="tag mt-7">// tech_stack</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {home.skills.items.map((sk) => (
                  <span
                    key={sk}
                    className="tag rounded-full border border-line px-2.5 py-1.5 normal-case tracking-normal text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </aside>
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

          Bố cục nằm trong `WritingGrid` (bài nổi bật + hai bài phụ), không còn
          là ba `PostCard` xếp dọc — lý do đầy đủ ở đầu file đó. */}
      {posts.length > 0 && (
        <section className={BAND}>
          <Reveal className="w-full">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Heading index={3} label="Viết" en="Writing">
                  {t.blog.title[lang]}
                </Heading>
                <p lang={jl} className="mt-3 text-[15px] text-ink-3">
                  {t.blog.subtitle[lang]}
                </p>
              </div>
              <Link
                href="/blog"
                className="tag rounded-full border border-line px-3.5 py-2 transition-colors hover:border-ink-3 hover:text-ink"
              >
                Xem tất cả →
              </Link>
            </div>

            <div className="mt-10">
              <WritingGrid posts={posts} />
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
      <section className="band border-t border-line-soft pt-16 md:pt-24 pb-20 md:pb-28">
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
