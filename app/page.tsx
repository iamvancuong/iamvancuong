import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Intro } from "@/components/home/Intro";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublicStreaks } from "@/lib/streaks";
import { getPublicJourney } from "@/lib/journey";
import { listPosts } from "@/lib/posts";
import { mergeTimeline } from "@/lib/timeline";
import { todayISO } from "@/lib/os/day";
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
  const [streaks, journey, posts] = await Promise.all([
    getPublicStreaks(),
    getPublicJourney(),
    listPosts(),
  ]);

  // Khung năm dùng CHUNG với /journey — cùng một nguồn, nên hai trang không
  // bao giờ nói hai điều khác nhau về cùng một năm.
  const iso = todayISO();
  const rows = mergeTimeline(
    journey.flatMap((y) =>
      y.months.flatMap((m) =>
        m.memories.map(() => ({ year: y.year, month: m.month })),
      ),
    ),
    Number(iso.slice(0, 4)),
    Number(iso.slice(5, 7)),
  );

  return (
    <Container>
      <JsonLd data={[personLd(), websiteLd()]} />
      <Intro
        streaks={streaks}
        journey={journey}
        // Ba bài mới nhất. `listPosts` đã lọc bài riêng tư với khách và tự
        // kèm ảnh bìa, nên chỗ này không phải biết gì về quyền xem.
        posts={posts.slice(0, 3)}
        rows={rows}
      />
    </Container>
  );
}
