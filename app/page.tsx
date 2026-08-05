import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PostCard } from "@/components/blog/PostCard";
import { listPosts } from "@/lib/posts";
import { getNow } from "@/lib/now";
import { site } from "@/lib/site";

export default async function HomePage() {
  const posts = (await listPosts()).slice(0, 3);
  const { focus, updated } = getNow();

  return (
    <Container>
      {/* Người lạ vào phải hiểu trong 10 giây — PLAN §7 */}
      <section className="max-w-[640px]">
        <h1 className="text-[36px] font-semibold leading-[1.15] tracking-[-0.02em] md:text-[44px]">
          {site.tagline}
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed text-ink-2">
          {site.description} Tôi đang hướng tới JLPT N2 và một công việc lập
          trình ở đây. Trang này là nơi tôi ghi lại quá trình đó — cả những phần
          chưa xong.
        </p>
      </section>

      <section className="mt-20">
        <SectionHeading
          label={`Đang tập trung · ${updated}`}
          href="/now"
          hrefLabel="Chi tiết"
        />
        <ol className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line md:grid-cols-3">
          {focus.map((f, i) => (
            <li key={f.title} className="bg-bg p-5">
              <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
                {String(i + 1).padStart(2, "0")} — {f.area}
              </div>
              <h3 className="mt-2 text-[16px] font-semibold leading-snug">
                {f.title}
              </h3>
              {f.detail && (
                <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
                  {f.detail}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20 max-w-[720px]">
        <SectionHeading label="Viết gần đây" href="/blog" />
        {posts.length > 0 ? (
          <div>
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <p className="text-[15px] text-ink-2">Chưa có bài nào.</p>
        )}
      </section>

      <section className="mt-20 max-w-[720px]">
        <SectionHeading label="Về tôi" />
        <p className="text-[16px] leading-relaxed text-ink-2">
          Tôi viết về ba thứ: học tiếng Nhật, học lập trình, và cuộc sống hằng
          ngày ở Nhật.{" "}
          <Link
            href="/about"
            className="text-accent underline decoration-accent/35 underline-offset-[3px] hover:decoration-accent"
          >
            Đọc thêm về tôi
          </Link>
          .
        </p>
      </section>
    </Container>
  );
}
