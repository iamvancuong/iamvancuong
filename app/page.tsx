import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Intro } from "@/components/home/Intro";
import { getPublicStreaks } from "@/lib/streaks";
import { getPublicJourney } from "@/lib/journey";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  description: site.description,
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
      <Intro streaks={streaks} journey={journey} />
    </Container>
  );
}
