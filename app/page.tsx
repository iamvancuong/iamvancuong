import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Intro } from "@/components/home/Intro";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublicStreaks } from "@/lib/streaks";
import { getPublicJourney } from "@/lib/journey";
import { getHomeStrips, SAMPLE_BLOG, SAMPLE_JOURNEY } from "@/lib/strips";
import { site } from "@/lib/site";
import { personLd, websiteLd } from "@/lib/seo";

export const metadata: Metadata = {
  // Tên ĐẦY ĐỦ trong <title> của đúng trang chủ — để truy vấn "Trương Văn
  // Cường" khớp được. `absolute` để KHÔNG bị template "%s — Cường" nối đuôi
  // thành "... — Cường" thừa. Các trang khác vẫn theo template như cũ.
  title: { absolute: `${site.fullName} — ${site.tagline}` },
  description: site.description,
  alternates: { canonical: "/" },
};

// Chuỗi đọc từ DB theo thời gian thực → render động mỗi lần truy cập.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [streaks, journey, strips] = await Promise.all([
    getPublicStreaks(),
    getPublicJourney(),
    getHomeStrips(),
  ]);

  return (
    <Container>
      <JsonLd data={[personLd(), websiteLd()]} />
      <Intro
        streaks={streaks}
        journey={journey}
        // Dải nào chưa có tấm nào thì dùng ảnh mẫu — xem chú thích ở lib/strips.ts
        stripJourney={
          strips.journey.length > 0 ? strips.journey : SAMPLE_JOURNEY
        }
        stripBlog={strips.blog.length > 0 ? strips.blog : SAMPLE_BLOG}
      />
    </Container>
  );
}
