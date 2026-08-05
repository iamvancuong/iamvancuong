import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { renderMarkdown } from "@/lib/markdown";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: site.description,
};

export default async function AboutPage() {
  const md = fs.readFileSync(
    path.join(process.cwd(), "content", "about.md"),
    "utf8",
  );
  const html = await renderMarkdown(md);

  return (
    <Container width="prose">
      <header className="border-b border-line pb-8">
        <h1 className="text-[32px] font-semibold tracking-[-0.02em]">About</h1>
      </header>
      <div
        className="prose mt-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Container>
  );
}
