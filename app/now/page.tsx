import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { getNow } from "@/lib/now";
import { renderMarkdown } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "Now",
  description: "Ba việc tôi đang tập trung ở thời điểm hiện tại.",
};

export default async function NowPage() {
  const { focus, updated, body } = getNow();
  const html = await renderMarkdown(body);

  return (
    <Container width="prose">
      <header className="border-b border-line pb-8">
        <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Now</h1>
        <p className="mt-2 text-[14px] text-ink-3">
          Cập nhật lần cuối: {updated}
        </p>
      </header>

      <ol className="mt-10 space-y-8">
        {focus.map((f, i) => (
          <li key={f.title} className="flex gap-5">
            <span className="pt-0.5 text-[13px] font-medium tabular-nums text-ink-3">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
                {f.area}
              </div>
              <h2 className="mt-1 text-[20px] font-semibold leading-snug">
                {f.title}
              </h2>
              {f.detail && (
                <p className="mt-2 text-[16px] leading-relaxed text-ink-2">
                  {f.detail}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div
        className="prose mt-14 border-t border-line pt-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Container>
  );
}
