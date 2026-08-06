import type { Metadata } from "next";
import { inter, notoJP } from "./fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/lib/site";
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
  /* Để trình duyệt và trình đọc RSS tự tìm ra /feed.xml — không có dòng này
     thì feed vẫn chạy nhưng phải biết địa chỉ mới đăng ký được. */
  alternates: {
    types: { "application/rss+xml": `${site.url}/feed.xml` },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${notoJP.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1 py-14 md:py-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
