import Link from "next/link";
import type { Metadata } from "next";
import { Eye, EyeOff, PenLine, Plus } from "lucide-react";
import { Visibility } from "@prisma/client";
import { db } from "@/lib/db";
import { fmtDate, hasJa } from "@/lib/posts";
import { createPost, createPostFromLog } from "@/lib/os/postActions";
import { isoUTC, fmtDateVN } from "@/lib/os/day";
import { EmptyNote, SubmitButton } from "@/components/os/formBits";

export const metadata: Metadata = { title: "Viết" };

export default async function WritePage() {
  const [posts, publishable] = await Promise.all([
    db.post.findMany({ include: { tags: true }, orderBy: { updatedAt: "desc" } }),
    // Những ngày bạn đã đánh dấu "đáng viết thành bài" trong nhật ký
    db.dailyLog.findMany({
      where: { publishable: true },
      orderBy: { date: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="max-w-[760px] space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-5">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Viết</h1>
          <p className="mt-1.5 text-[15px] text-ink-2">
            Bài riêng tư và bài công khai nằm chung một chỗ.
          </p>
        </div>
        <form action={createPost}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-ink px-4 py-2 text-[14px] font-medium text-bg"
          >
            <Plus size={15} strokeWidth={2} />
            Bài mới
          </button>
        </form>
      </header>

      {/* Mắt xích của vòng lặp: sống → ghi vào nhật ký → chọn cái đáng kể →
          viết thành bài. Trước đây chỗ này chỉ có link tới ngày đó, còn lại
          phải tự mở và tự chép sang bài mới — nên trên thực tế không ai chép.
          Giờ một nút tạo sẵn bản nháp từ nhật ký và ký ức cùng ngày. */}
      {publishable.length > 0 && (
        <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-4">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
            Đã đánh dấu đáng viết
          </h2>
          <ul className="mt-2 divide-y divide-line-soft">
            {publishable.map((l) => {
              const iso = isoUTC(l.date);
              return (
                <li
                  key={l.id}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 first:pt-0"
                >
                  <Link
                    href={`/os/log/${iso}`}
                    className="min-w-0 flex-1 text-[14px] leading-snug text-ink-2 transition-colors hover:text-ink"
                  >
                    <span className="tabular-nums text-ink-3">
                      {fmtDateVN(iso)}
                    </span>{" "}
                    — {l.journalWhat ?? "(chưa ghi gì)"}
                  </Link>
                  <form action={createPostFromLog.bind(null, iso)}>
                    <SubmitButton variant="quiet" pendingLabel="đang tạo…">
                      <span className="inline-flex items-center gap-1">
                        <PenLine size={12} strokeWidth={2} />
                        viết thành bài
                      </span>
                    </SubmitButton>
                  </form>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {posts.length === 0 ? (
        <EmptyNote>Chưa có bài nào.</EmptyNote>
      ) : (
        <ul className="divide-y divide-line-soft border-t border-line-soft">
          {posts.map((p) => {
            const isPublic =
              p.visibility === Visibility.PUBLIC && p.publishedAt !== null;
            return (
              <li key={p.id} className="flex items-start gap-3 py-3">
                <span
                  className={`mt-1 flex shrink-0 items-center gap-1 text-[11px] ${
                    isPublic ? "text-up" : "text-ink-3"
                  }`}
                >
                  {isPublic ? <Eye size={13} /> : <EyeOff size={13} />}
                  {isPublic ? "công khai" : "riêng tư"}
                </span>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/os/write/${p.slug}`}
                    className="text-[15px] font-medium leading-snug transition-colors hover:text-accent"
                  >
                    {p.title}
                  </Link>
                  <div className="mt-0.5 text-[12px] text-ink-3">
                    {[
                      p.publishedAt ? fmtDate(p.publishedAt) : "chưa xuất bản",
                      p.tags.map((t) => t.name).join(", ") || null,
                      hasJa(p) ? "có bản tiếng Nhật" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
