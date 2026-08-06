"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import type { Memory } from "@prisma/client";
import { createMemory, updateMemory } from "@/lib/os/actions";
import { isoUTC } from "@/lib/os/day";

/**
 * Form ký ức — dùng chung cho TẠO MỚI và SỬA.
 *
 * Ngày để tự do, lùi được về tận tuổi thơ, không giới hạn từ hôm nay trở đi.
 * Mặc định là hôm nay vì phần lớn lúc ghi là ghi chuyện vừa xảy ra.
 *
 * Vẫn là client component dù server action tự chạy được: upload vài tấm ảnh
 * điện thoại mất mấy giây, cần một nút biết nói "đang lưu ảnh…" — không thì
 * người ta tưởng treo rồi bấm lại lần nữa.
 */
export function MemoryForm({
  areaSlug,
  memory,
  areas,
}: {
  areaSlug: string | null;
  /** Có thì là sửa; không có thì là tạo mới. */
  memory?: Memory;
  /**
   * Chỉ dùng khi SỬA, để đổi lĩnh vực của ký ức. Lúc tạo mới thì lĩnh vực do
   * trang quyết định (trang lĩnh vực → chính nó; Hành trình → không thuộc
   * lĩnh vực nào), nên bày thêm ô chọn ở đó chỉ là một quyết định thừa.
   */
  areas?: { id: string; name: string }[];
}) {
  const editing = memory != null;

  const [open, setOpen] = useState(editing);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Ngày lưu ở nửa đêm UTC nên phải đọc bằng getUTC*, nếu không ô ngày sẽ
  // hiện lùi một hôm khi máy đang ở múi giờ Nhật.
  const defaultDate = memory ? isoUTC(memory.date) : todayISO;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-[var(--radius-lg)] border border-dashed border-line py-4 text-[14px] text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
      >
        + Ghi một ký ức
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        setBusy(true);
        try {
          if (editing) {
            await updateMemory(memory.id, areaSlug, fd);
          } else {
            await createMemory(areaSlug, fd);
            formRef.current?.reset();
            setOpen(false);
          }
          setFiles([]);
        } finally {
          setBusy(false);
        }
      }}
      className="space-y-2 rounded-[var(--radius-lg)] border border-line p-3"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="date"
          name="date"
          required
          defaultValue={defaultDate}
          aria-label="Ngày chuyện xảy ra"
          className="rounded-[var(--radius-sm)] border border-line bg-bg px-3 py-2 text-[15px] tabular-nums outline-none focus:border-ink-3"
        />
        <input
          name="title"
          required
          defaultValue={memory?.title ?? ""}
          placeholder="Chuyện gì?"
          className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line px-3 py-2 text-[15px] outline-none focus:border-ink-3"
        />
      </div>

      <textarea
        name="body"
        rows={3}
        defaultValue={memory?.body ?? ""}
        placeholder="Kể lại..."
        aria-label="Kể lại"
        className="w-full resize-y rounded-[var(--radius-sm)] border border-line px-3 py-2 text-[15px] leading-relaxed outline-none focus:border-ink-3"
      />

      <input
        name="learned"
        defaultValue={memory?.learned ?? ""}
        placeholder="Học được gì? (không bắt buộc)"
        aria-label="Học được gì"
        className="w-full rounded-[var(--radius-sm)] border border-line px-3 py-2 text-[14px] outline-none focus:border-ink-3"
      />

      {editing && areas && areas.length > 0 && (
        <select
          name="areaId"
          defaultValue={memory.areaId ?? ""}
          aria-label="Lĩnh vực"
          className="w-full rounded-[var(--radius-sm)] border border-line bg-bg px-3 py-2 text-[14px] outline-none focus:border-ink-3"
        >
          <option value="">— không thuộc lĩnh vực nào —</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="place"
          defaultValue={memory?.place ?? ""}
          placeholder="Ở đâu"
          aria-label="Ở đâu"
          className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line px-3 py-2 text-[14px] outline-none focus:border-ink-3"
        />
        <input
          name="people"
          defaultValue={memory?.people ?? ""}
          placeholder="Với ai"
          aria-label="Với ai"
          className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line px-3 py-2 text-[14px] outline-none focus:border-ink-3"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-dashed border-line px-3 py-2.5 text-[14px] text-ink-2 transition-colors hover:border-ink-3">
        <ImagePlus size={16} strokeWidth={1.75} />
        {files.length > 0
          ? `${files.length} ảnh đã chọn`
          : editing
            ? "Thêm ảnh nữa"
            : "Thêm ảnh"}
        <input
          type="file"
          name="photos"
          multiple
          accept="image/*"
          onChange={(e) => setFiles([...(e.target.files ?? [])])}
          className="hidden"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        {/* Chỉ hỏi lúc tạo. Khi sửa thì quyền công khai đổi bằng nút riêng ở
            danh sách — gộp vào đây rất dễ vô tình mở công khai một ký ức riêng
            tư chỉ vì vào sửa lại một chữ. */}
        {!editing && (
          <label className="flex cursor-pointer items-center gap-2 text-[14px] text-ink-2">
            <input
              type="checkbox"
              name="public"
              className="size-4 accent-[var(--color-ink)]"
            />
            Cho người khác xem
          </label>
        )}

        <div className="ml-auto flex gap-2">
          {!editing && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-[var(--radius-sm)] px-3 py-2 text-[14px] text-ink-2 transition-colors hover:text-ink"
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            disabled={busy}
            className="rounded-[var(--radius-sm)] bg-ink px-4 py-2 text-[14px] font-medium text-white transition-opacity disabled:opacity-40"
          >
            {busy
              ? files.length > 0
                ? "Đang lưu ảnh…"
                : "Đang lưu…"
              : editing
                ? "Lưu thay đổi"
                : "Lưu"}
          </button>
        </div>
      </div>

      {!editing && (
        <p className="text-[12px] leading-relaxed text-ink-3">
          Mặc định là riêng tư. Ảnh tự nén sang WebP, không cần chỉnh trước khi up.
        </p>
      )}
    </form>
  );
}
