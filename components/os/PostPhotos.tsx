"use client";

import { useRef, useState } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import { ConfirmButton } from "./FormButtons";
import {
  deletePostPhoto,
  setPostCover,
  uploadPostPhotos,
} from "@/lib/os/postActions";

/**
 * Ảnh của một bài viết — tải lên, chọn ảnh bìa, xóa.
 *
 * `Post.photos` có trong schema từ đầu nhưng **chưa từng có giao diện nào ghi
 * vào nó**. Hậu quả dây chuyền: nút «Lên trang chủ» chỉ hiện khi bài có ảnh,
 * nên nó không bao giờ hiện, nên dải ảnh "Viết" ở trang chủ vĩnh viễn trống —
 * và nhìn từ ngoài thì trông như tính năng hỏng chứ không phải thiếu đường vào.
 *
 * **Ảnh bìa là tấm đầu tiên**, không có cột riêng. Nên "đổi ảnh bìa" chính là
 * "đưa tấm đó lên đầu" — một khái niệm thay vì hai, và tấm bìa luôn nhìn thấy
 * được ngay trong danh sách chứ không nấp trong một ô chọn.
 */

export type PostPhoto = {
  id: string;
  url: string;
  thumbUrl: string | null;
};

export function PostPhotos({
  postId,
  photos,
}: {
  postId: string;
  photos: PostPhoto[];
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <section className="rounded-[var(--radius-lg)] border border-line p-3">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
          Ảnh của bài
        </span>
        <span className="text-[12px] text-ink-3">
          Tấm đầu tiên là <strong className="font-medium">ảnh bìa</strong> — nó
          là thứ hiện ở dải ảnh trang chủ.
        </span>
      </div>

      {photos.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <li
              key={p.id}
              className={`relative overflow-hidden rounded-[var(--radius-md)] border ${
                i === 0 ? "border-accent" : "border-line"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- ảnh đi qua
                  /api/uploads (kiểm quyền từng tấm), next/image không qua đó */}
              <img
                src={p.thumbUrl ?? p.url}
                alt=""
                className="block size-24 object-cover"
              />

              {i === 0 && (
                <span className="absolute left-1 top-1 rounded-[var(--radius-sm)] bg-accent px-1.5 py-0.5 text-[10px] font-medium text-bg">
                  bìa
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 px-1 py-0.5">
                {i > 0 ? (
                  <form action={setPostCover.bind(null, p.id)}>
                    <button
                      type="submit"
                      aria-label="Đặt làm ảnh bìa"
                      title="Đặt làm ảnh bìa"
                      className="flex p-0.5 text-white/80 transition-colors hover:text-white"
                    >
                      <Star size={13} strokeWidth={2} />
                    </button>
                  </form>
                ) : (
                  <span />
                )}

                <form action={deletePostPhoto.bind(null, p.id)}>
                  <ConfirmButton
                    label="Xóa ảnh"
                    confirm="Xóa tấm này? File thật trên đĩa cũng mất theo, không hoàn tác được."
                    className="flex p-0.5 text-white/80 hover:text-down"
                  >
                    <Trash2 size={13} strokeWidth={2} />
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form
        ref={formRef}
        action={async (fd) => {
          setBusy(true);
          try {
            await uploadPostPhotos(postId, fd);
            formRef.current?.reset();
            setFiles([]);
          } finally {
            setBusy(false);
          }
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-dashed border-line px-3 py-2 text-[14px] text-ink-2 transition-colors hover:border-ink-3">
          <ImagePlus size={16} strokeWidth={1.75} />
          {files.length > 0 ? `${files.length} ảnh đã chọn` : "Chọn ảnh"}
          <input
            type="file"
            name="photos"
            multiple
            accept="image/*"
            onChange={(e) => setFiles([...(e.target.files ?? [])])}
            className="hidden"
          />
        </label>

        {/* Nút riêng chứ không tự gửi lúc chọn file: nén vài tấm ảnh điện thoại
            mất mấy giây, cần một nút biết nói "đang lưu" — không thì người ta
            tưởng treo rồi bấm lại và up trùng. */}
        <button
          type="submit"
          disabled={busy || files.length === 0}
          className="shrink-0 rounded-[var(--radius-sm)] bg-ink px-4 py-2 text-[14px] font-medium text-bg transition-opacity disabled:opacity-40"
        >
          {busy ? "Đang lưu ảnh…" : "Tải lên"}
        </button>
      </form>
    </section>
  );
}
