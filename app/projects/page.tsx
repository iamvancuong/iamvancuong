import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/Badge";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Những thứ tôi đã build. Mã nguồn và demo nếu có.",
};

export default function ProjectsPage() {
  return (
    <Container width="prose">
      <header className="border-b border-line pb-8">
        <h1 className="text-[32px] font-semibold tracking-[-0.02em]">
          Projects
        </h1>
        <p className="mt-2 text-[16px] text-ink-2">
          Những thứ tôi thật sự đã build, không phải danh sách công nghệ tôi
          từng đọc qua.
        </p>
      </header>

      <div className="mt-10 space-y-12">
        {projects.map((p) => (
          <article key={p.slug} className="border-b border-line-soft pb-12 last:border-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[20px] font-semibold tracking-[-0.01em]">
                {p.name}
              </h2>
              <Badge>{p.status}</Badge>
              <span className="text-[13px] text-ink-3">{p.year}</span>
            </div>

            <p className="mt-3 text-[16px] leading-relaxed text-ink-2">
              {p.summary}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>

            <div className="mt-6 space-y-4 text-[15px] leading-relaxed">
              <div>
                <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
                  Vấn đề
                </div>
                <p className="mt-1.5 text-ink-2">{p.problem}</p>
              </div>

              <div>
                <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
                  Tôi đã làm gì
                </div>
                <ul className="mt-1.5 list-disc space-y-1.5 pl-5 text-ink-2 marker:text-ink-3">
                  {p.built.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>

            {(p.repo || p.demo) && (
              <div className="mt-6 flex gap-4 text-[14px]">
                {p.repo && (
                  <a
                    href={p.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent underline decoration-accent/35 underline-offset-[3px] hover:decoration-accent"
                  >
                    Mã nguồn
                  </a>
                )}
                {p.demo && (
                  <a
                    href={p.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent underline decoration-accent/35 underline-offset-[3px] hover:decoration-accent"
                  >
                    Xem thử
                  </a>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </Container>
  );
}
