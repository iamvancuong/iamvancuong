import type { Metadata } from "next";
import { Visibility } from "@prisma/client";
import { Container } from "@/components/layout/Container";
import { Intro } from "@/components/home/Intro";
import type { StripPhoto } from "@/components/home/PhotoStrip";
import { JsonLd } from "@/components/seo/JsonLd";
import { db } from "@/lib/db";
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
  const [streaks, journey, photos] = await Promise.all([
    getPublicStreaks(),
    getPublicJourney(),
    /**
     * Dải ảnh trang chủ — ảnh của những ký ức đã tick chia sẻ trong `/os`.
     * Lấy 12 tấm mới nhất: đủ để dải tràn ra khỏi mép màn hình rộng (tín hiệu
     * duy nhất cho biết còn kéo được), không nhiều tới mức tải nặng trang chủ.
     */
    db.photo.findMany({
      where: { visibility: Visibility.PUBLIC },
      orderBy: [{ takenAt: "desc" }, { createdAt: "desc" }],
      take: 12,
      select: {
        id: true,
        url: true,
        thumbUrl: true,
        caption: true,
        width: true,
        height: true,
      },
    }),
  ]);

  return (
    <Container>
      <JsonLd data={[personLd(), websiteLd()]} />
      <Intro
        streaks={streaks}
        journey={journey}
        photos={photos satisfies StripPhoto[]}
      />
    </Container>
  );
}
