import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Intro } from "@/components/home/Intro";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublicStreaks } from "@/lib/streaks";
import { getPublicJourney } from "@/lib/journey";
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
  const [streaks, journey] = await Promise.all([
    getPublicStreaks(),
    getPublicJourney(),
  ]);

  return (
    <Container>
      <JsonLd data={[personLd(), websiteLd()]} />
      <Intro streaks={streaks} journey={journey} />
    </Container>
  );
}
