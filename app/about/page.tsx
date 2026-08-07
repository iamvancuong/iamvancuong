import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { AboutView } from "@/components/about/AboutView";
import { renderMarkdown } from "@/lib/markdown";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: site.description,
};

function read(file: string) {
  return fs.readFileSync(path.join(process.cwd(), "content", file), "utf8");
}

export default async function AboutPage() {
  const [vi, ja] = await Promise.all([
    renderMarkdown(read("about.md")),
    renderMarkdown(read("about.ja.md")),
  ]);

  return (
    <Container width="prose">
      <AboutView vi={vi} ja={ja} />
    </Container>
  );
}
