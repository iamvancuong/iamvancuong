import type { Metadata } from "next";
import Script from "next/script";
import { cookies } from "next/headers";
import { inter, mono, notoJP } from "./fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LangProvider } from "@/components/i18n/LangProvider";
import { BackgroundMusic } from "@/components/audio/BackgroundMusic";
import { backgroundTrack, listTracks } from "@/lib/audio";
import { site } from "@/lib/site";
import { DEFAULT_LANG, LANG_COOKIE, isLang } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    url: site.url,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  /* Xác minh quyền sở hữu với Google Search Console. Token lấy từ site.ts
     (được commit → deploy theo git); env chỉ để override khi cần. */
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || site.googleVerification,
  },
  /* Để trình duyệt và trình đọc RSS tự tìm ra /feed.xml — không có dòng này
     thì feed vẫn chạy nhưng phải biết địa chỉ mới đăng ký được. */
  alternates: {
    types: { "application/rss+xml": `${site.url}/feed.xml` },
  },
};

/**
 * Gán `data-theme` TRƯỚC khi trình duyệt vẽ khung hình đầu tiên.
 *
 * Bắt buộc phải là script chặn nằm trong <head>. Nếu để React gán sau khi
 * hydrate thì trang luôn vẽ màu sáng trước rồi mới nhảy sang tối — và cái chớp
 * trắng đó xuất hiện ở MỌI lần tải trang, khó chịu nhất đúng lúc đang dùng
 * trong tối.
 *
 * Bọc try/catch vì trình duyệt có thể chặn localStorage (chế độ ẩn danh, cấm
 * cookie bên thứ ba). Ném lỗi ở đây sẽ chặn luôn phần còn lại của <head>.
 *
 * Không đọc `prefers-color-scheme` ở đây: khi chưa chọn tay thì để CSS lo, như
 * vậy trang vẫn đổi theo máy ngay lập tức mà không cần JavaScript chạy lại.
 */
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Đọc ngôn ngữ đã chọn từ cookie ngay ở server → HTML dựng sẵn đúng ngôn ngữ,
  // không nháy Việt→Nhật khi tải trang.
  const cookieLang = (await cookies()).get(LANG_COOKIE)?.value;
  const lang = isLang(cookieLang) ? cookieLang : DEFAULT_LANG;

  return (
    <html
      lang="vi"
      className={`${inter.variable} ${notoJP.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* `beforeInteractive` = Next nhét thẳng vào HTML đầu tiên và chạy
            trước mọi mã của Next. Viết `<script>` trần ở đây cũng chạy, nhưng
            React 19 kêu "Encountered a script tag while rendering React
            component" — cảnh báo đó đúng (khi chuyển trang phía client thì thẻ
            script không chạy lại), và console ồn thì lỗi thật sẽ bị lẫn vào. */}
        <Script
          id="theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <LangProvider initial={lang}>
          <Header />
          <main className="flex-1 py-10 md:py-16">{children}</main>
          <Footer />

          {/* Nhạc nền trang công khai. Tự ẩn trong /os — layout này bọc cả /os,
              mà /os đã có trình phát riêng. Xem BackgroundMusic.tsx. */}
          <BackgroundMusic track={backgroundTrack(listTracks())} />
        </LangProvider>
      </body>
    </html>
  );
}
