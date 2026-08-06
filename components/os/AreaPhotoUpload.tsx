"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { uploadAreaPhotos } from "@/lib/os/actions";

/**
 * Tải ảnh tiến trình.
 *
 * Client component vì đúng lý do `MemoryForm` là client: nén và ghi vài tấm
 * ảnh điện thoại mất mấy giây, cần một nút biết nói "đang lưu ảnh…" — không
 * thì người ta tưởng treo rồi bấm lại lần nữa và up trùng.
 */
export function AreaPhotoUpload({ slug }: { slug: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        setBusy(true);
        try {
          await uploadAreaPhotos(slug, fd);
          formRef.current?.reset();
          setFiles([]);
        } finally {
          setBusy(false);
        }
      }}
      className="space-y-2 rounded-[var(--radius-lg)] border border-line p-3"
    >
      <label className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-dashed border-line px-3 py-2.5 text-[14px] text-ink-2 transition-colors hover:border-ink-3">
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

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="caption"
          placeholder="ghi chú chung cho lần này (không bắt buộc)"
          aria-label="Ghi chú"
          className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line bg-bg px-3 py-2 text-[14px] outline-none focus:border-ink-3"
        />
        <button
          type="submit"
          disabled={busy || files.length === 0}
          className="rounded-[var(--radius-sm)] bg-ink px-4 py-2 text-[14px] font-medium text-white transition-opacity disabled:opacity-40"
        >
          {busy ? "Đang lưu ảnh…" : "Tải lên"}
        </button>
      </div>

      <p className="text-[12px] leading-relaxed text-ink-3">
        Luôn riêng tư. Ngày lấy từ EXIF của ảnh nếu có, nên chụp hôm nay mà mai
        mới tải lên thì vẫn tính đúng ngày chụp.
      </p>
    </form>
  );
}
