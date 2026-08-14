import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Intro } from "@/components/home/Intro";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublicStreaks } from "@/lib/streaks";
import { getPublicJourney } from "@/lib/journey";
import { getHomeStrips } from "@/lib/strips";
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
        // Dải nào rỗng thì PhotoStrip tự ẩn cả mục — KHÔNG đổ ảnh mẫu vào.
        // Ảnh giả trên trang thật thì người xem không có cách nào biết là giả.
        stripJourney={strips.journey}
        stripBlog={strips.blog}
      />
    </Container>
  );
}
