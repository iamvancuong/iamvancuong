import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { NowView, type NowData } from "@/components/now/NowView";
import { getNow } from "@/lib/now";
import { renderMarkdown } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "Dạo này",
  description: "Ba việc tôi đang tập trung ở thời điểm hiện tại.",
};

async function load(lang: "vi" | "ja"): Promise<NowData> {
  const { focus, updated, body } = getNow(lang);
  return { updated, focus, bodyHtml: await renderMarkdown(body) };
}

export default async function NowPage() {
  const [vi, ja] = await Promise.all([load("vi"), load("ja")]);

  return (
    <Container width="prose">
      <NowView vi={vi} ja={ja} />
    </Container>
  );
}
