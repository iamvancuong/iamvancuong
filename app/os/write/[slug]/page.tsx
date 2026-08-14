import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Eye, EyeOff, Home, Plus, Trash2, X } from "lucide-react";
import { Visibility } from "@prisma/client";
import { db } from "@/lib/db";
import { listTags } from "@/lib/posts";
import {
  createTag,
  updateTag,
  deletePost,
  deleteTag,
  savePost,
  togglePostHome,
  togglePublish,
} from "@/lib/os/postActions";
import { MarkdownEditor } from "@/components/os/MarkdownEditor";

export const metadata: Metadata = { title: "Soạn bài" };

export default async function EditPostPage({
  params,
}: PageProps<"/os/write/[slug]">) {
  const { slug } = await params;

  const [post, tags] = await Promise.all([
    db.post.findUnique({
      where: { slug },
      // `photos` để biết bài có ảnh bìa hay chưa — nút «lên trang chủ»
      // chỉ có nghĩa khi có ít nhất một tấm.
      include: { tags: true, photos: { select: { id: true } } },
    }),
    listTags(),
  ]);
  if (!post) notFound();

  const chosen = new Set(post.tags.map((t) => t.id));
  const isPublic =
    post.visibility === Visibility.PUBLIC && post.publishedAt !== null;

  return (
    <div className="max-w-[900px] space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <Link
          href="/os/write"
          className="text-[13px] text-ink-2 transition-colors hover:text-ink"
        >
          ← Tất cả bài
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/blog/${post.slug}`}
            className="text-[13px] text-accent underline underline-offset-2"
          >
            Xem trang thật
          </Link>

          <form action={togglePublish.bind(null, post.id)}>
            <button
              type="submit"
              className={`flex items-center gap-1.5 rounded-[var(--radius-md)] border px-3 py-1.5 text-[13px] transition-colors ${
                isPublic
                  ? "border-line text-up hover:border-ink-3"
                  : "border-ink bg-ink text-bg"
              }`}
            >
              {isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
              {isPublic ? "Đang công khai" : "Xuất bản"}
            </button>
          </form>

          {/* Chỉ hiện khi bài ĐÃ công khai VÀ có ảnh — hai điều kiện bắt buộc
              để nó lên được dải ảnh trang chủ. Ảnh bìa là tấm đầu tiên theo
              thứ tự ảnh của bài. */}
          {isPublic && post.photos.length > 0 && (
            <form action={togglePostHome.bind(null, post.id)}>
              <button
                type="submit"
                title={
                  post.showOnHome
                    ? "Đang hiện ở trang chủ — bấm để gỡ xuống"
                    : "Bấm để đưa ảnh bìa lên dải ảnh trang chủ"
                }
                className={`flex items-center gap-1.5 rounded-[var(--radius-md)] border px-3 py-1.5 text-[13px] transition-colors ${
                  post.showOnHome
                    ? "border-line text-accent hover:border-ink-3"
                    : "border-line text-ink-3 hover:border-ink-3 hover:text-ink"
                }`}
              >
                <Home size={14} />
                {post.showOnHome ? "Ở trang chủ" : "Lên trang chủ"}
              </button>
            </form>
          )}

          <form action={deletePost.bind(null, post.id)}>
            <button
              type="submit"
              aria-label="Xóa bài"
              className="p-1.5 text-ink-3 transition-colors hover:text-down"
            >
              <Trash2 size={15} strokeWidth={1.75} />
            </button>
          </form>
        </div>
      </header>

      {/* Chủ đề tách khỏi form bài viết: tạo/xóa chủ đề là hành động riêng,
          không nên vô tình lưu cả bài khi chỉ muốn thêm một chủ đề. */}
      <section className="rounded-[var(--radius-lg)] border border-line p-3">
        <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
          Quản lý chủ đề
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((t) => (
            <span
              key={t.id}
              className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-line-soft bg-surface px-2 py-1 text-[12px] text-ink-2"
            >
              {/* Sửa tại chỗ: gõ tên mới rồi Enter. Trước đây đổi tên chỉ làm
                  được bằng cách gõ lại vào ô "chủ đề mới" đúng một tên sinh ra
                  cùng slug cũ — lệch một chữ là đẻ chủ đề thứ hai. `slug` giữ
                  nguyên vì nó nằm trong địa chỉ bộ lọc của /blog. */}
              <form action={updateTag.bind(null, t.id)}>
                <input
                  name="name"
                  defaultValue={t.name}
                  aria-label={`Đổi tên chủ đề ${t.name}`}
                  title={`/${t.slug} — đổi tên rồi Enter`}
                  size={Math.max(t.name.length, 4)}
                  className="bg-transparent text-[12px] text-ink-2 outline-none focus:text-ink"
                />
              </form>
              <form action={deleteTag.bind(null, t.id)}>
                <button
                  type="submit"
                  aria-label={`Xóa chủ đề ${t.name}`}
                  title="Xóa chủ đề này (bài viết không bị xóa)"
                  className="flex text-ink-3 transition-colors hover:text-down"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </form>
            </span>
          ))}

          <form action={createTag} className="flex items-center gap-1">
            <input
              name="name"
              required
              placeholder="Chủ đề mới…"
              className="w-32 rounded-[var(--radius-sm)] border border-line px-2 py-1 text-[12px] outline-none focus:border-ink-3"
            />
            <button
              type="submit"
              aria-label="Thêm chủ đề"
              className="flex size-6 items-center justify-center rounded-[var(--radius-sm)] border border-line text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
            >
              <Plus size={13} strokeWidth={2} />
            </button>
          </form>
        </div>
        <p className="mt-2 text-[12px] text-ink-3">
          Chủ đề tạo ở đây xuất hiện luôn thành bộ lọc ngoài trang /blog.
        </p>
      </section>

      <form action={savePost.bind(null, post.id)} className="space-y-4">
        <input
          name="title"
          defaultValue={post.title}
          placeholder="Tiêu đề"
          className="w-full rounded-[var(--radius-sm)] border border-line px-3 py-2.5 text-[20px] font-semibold tracking-[-0.01em] outline-none focus:border-ink-3"
        />

        {/*
          Địa chỉ bài viết. Trước đây KHÔNG sửa được: slug sinh ra lúc bấm «bài
          mới» — khi bài chưa có tiêu đề — rồi đóng băng ở đó, nên mọi bài đều
          là `bai-viet-chua-dat-ten`, `-2`, `-3`…

          Để trống thì tự lấy theo tiêu đề. Đó là hành vi người ta mong đợi, và
          nó chữa luôn cả những bài đã lỡ mang tên xấu: xóa trắng ô này rồi Lưu.
        */}
        <label className="block">
          <span className="text-[12px] text-ink-3">
            Địa chỉ · iamvancuong.com/blog/
          </span>
          <input
            name="slug"
            defaultValue={post.slug}
            placeholder="để trống thì lấy theo tiêu đề"
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-line px-3 py-2 font-mono text-[13px] outline-none focus:border-ink-3"
          />
          {post.publishedAt && (
            <span className="mt-1 block text-[12px] leading-relaxed text-ink-3">
              Bài đã công khai — đổi địa chỉ là mọi link đã chia sẻ và kết quả
              Google trỏ tới bài này đều chết. Chỉ đổi khi thật sự cần.
            </span>
          )}
        </label>

        <input
          name="excerpt"
          defaultValue={post.excerpt ?? ""}
          placeholder="Một câu tóm tắt (hiện ở trang danh sách)"
          className="w-full rounded-[var(--radius-sm)] border border-line px-3 py-2 text-[14px] outline-none focus:border-ink-3"
        />

        <fieldset>
          <legend className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
            Chủ đề của bài này
          </legend>
          <div className="flex flex-wrap gap-2">
            {tags.length === 0 && (
              <p className="text-[13px] text-ink-3">
                Chưa có chủ đề nào — tạo ở ô phía trên.
              </p>
            )}
            {tags.map((t) => (
              <label
                key={t.id}
                className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-line px-3 py-1.5 text-[13px] transition-colors hover:border-ink-3 has-checked:border-ink has-checked:bg-ink has-checked:text-bg"
              >
                <input
                  type="checkbox"
                  name="tagIds"
                  value={t.id}
                  defaultChecked={chosen.has(t.id)}
                  className="sr-only"
                />
                {t.name}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
            Nội dung
          </div>
          <MarkdownEditor
            name="body"
            postId={post.id}
            defaultValue={post.body}
            placeholder="Viết ở đây…"
          />
        </div>

        <div className="rounded-[var(--radius-lg)] border border-line p-3">
          <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
            Bản tiếng Nhật — tùy chọn
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
            Không phải bản dịch. Viết lại ngắn hơn (300–500 chữ) bằng đúng trình
            độ hiện tại. Để trống thì nút 日本語 không hiện và trang{" "}
            <code className="text-ink-2">/blog/{post.slug}/ja</code> không tồn tại.
          </p>

          <input
            name="titleJa"
            lang="ja"
            defaultValue={post.titleJa ?? ""}
            placeholder="日本語のタイトル"
            className="mt-3 w-full rounded-[var(--radius-sm)] border border-line px-3 py-2 text-[15px] outline-none focus:border-ink-3"
          />
          <div className="mt-2">
            <MarkdownEditor
              name="bodyJa"
              postId={post.id}
              defaultValue={post.bodyJa ?? ""}
              rows={10}
              lang="ja"
              placeholder="日本語の本文…"
            />
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center gap-3 border-t border-line bg-bg/95 py-3 backdrop-blur">
          <button
            type="submit"
            className="rounded-[var(--radius-md)] bg-ink px-5 py-2.5 text-[14px] font-medium text-bg"
          >
            Lưu
          </button>
          <span className="text-[13px] text-ink-3">
            Lưu không đồng nghĩa với xuất bản — bài vẫn riêng tư cho tới khi bạn
            bấm Xuất bản.
          </span>
        </div>
      </form>
    </div>
  );
}
