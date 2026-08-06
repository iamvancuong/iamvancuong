import Link from "next/link";
import type { Metadata } from "next";
import { Visibility } from "@prisma/client";
import { Container } from "@/components/layout/Container";
import { db } from "@/lib/db";
import { PhotoGrid } from "@/components/PhotoGrid";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hành trình",
  description: `Những gì tôi đã đi qua — từ ${site.hometown} tới Nhật.`,
};

function fmt(d: Date) {
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(
    d.getUTCMonth() + 1,
  ).padStart(2, "0")}`;
}

/**
 * Bản công khai của /os/journey — CHỈ những ký ức đã tick "cho người khác xem".
 *
 * Cùng một kho dữ liệu, khác nhau đúng một điều kiện lọc. Bạn viết một lần
 * trong Life OS; tick vào thì nó xuất hiện ở đây.
 */
export default async function PublicJourneyPage() {
  const memories = await db.memory.findMany({
    where: { visibility: Visibility.PUBLIC },
    orderBy: { date: "desc" },
    include: {
      photos: {
        where: { visibility: Visibility.PUBLIC },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
      area: { select: { name: true } },
    },
  });

  const byYear = new Map<number, typeof memories>();
  for (const m of memories) {
    const y = m.date.getUTCFullYear();
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(m);
  }

  return (
    <Container width="prose">
      <header className="border-b border-line pb-8">
        <h1 className="text-[32px] font-semibold tracking-[-0.02em]">
          Hành trình
        </h1>
        <p className="mt-2 text-[16px] leading-relaxed text-ink-2">
          Những gì tôi đã đi qua, từ {site.hometown} tới Nhật. Không phải tất cả
          — chỉ những thứ tôi muốn giữ lại và kể ra.
        </p>
      </header>

      {memories.length === 0 ? (
        <p className="mt-10 text-[15px] text-ink-2">
          Chưa có gì ở đây.{" "}
          <Link href="/blog" className="text-accent underline underline-offset-2">
            Đọc bài viết
          </Link>{" "}
          trong lúc chờ.
        </p>
      ) : (
        <div className="mt-12 space-y-14">
          {[...byYear.entries()]
            .sort((a, b) => b[0] - a[0])
            .map(([year, list]) => (
              <section key={year}>
                <h2 className="mb-6 text-[20px] font-semibold tabular-nums tracking-[-0.01em]">
                  {year}
                </h2>

                <ul className="space-y-10 border-l border-line pl-6">
                  {list.map((m) => (
                    <li key={m.id} className="relative">
                      <span
                        className="absolute -left-[27px] top-2 size-1.5 rounded-full bg-ink-3"
                        aria-hidden
                      />
                      <div className="flex items-baseline gap-3">
                        <time
                          dateTime={m.date.toISOString()}
                          className="shrink-0 text-[13px] tabular-nums text-ink-3"
                        >
                          {fmt(m.date)}
                        </time>
                        <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.01em]">
                          {m.title}
                        </h3>
                      </div>

                      {(m.place || m.area) && (
                        <div className="mt-1 text-[12px] text-ink-3">
                          {[m.place, m.area?.name].filter(Boolean).join(" · ")}
                        </div>
                      )}

                      {m.body && (
                        <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink-2">
                          {m.body}
                        </p>
                      )}

                      {m.learned && (
                        <p className="mt-3 border-l-2 border-line pl-3 text-[14px] leading-relaxed text-ink-2">
                          {m.learned}
                        </p>
                      )}

                      <div className="mt-3">
                        <PhotoGrid photos={m.photos} alt={m.title} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}
    </Container>
  );
}
