import Image from "next/image";
import { Eye, EyeOff, X } from "lucide-react";
import { Visibility, type Memory, type Photo } from "@prisma/client";
import {
  deleteMemory,
  deletePhoto,
  setPhotoCaption,
  toggleMemoryVisibility,
} from "@/lib/os/actions";
import { PhotoGrid } from "@/components/PhotoGrid";
import { ConfirmButton, MicroLabel, SubmitButton } from "./formBits";
import { Disclosure } from "./Disclosure";
import { MemoryForm } from "./MemoryForm";

export type MemoryWithPhotos = Memory & {
  photos: Photo[];
  area?: { name: string; slug: string } | null;
};

/** Đọc bằng getUTC* vì ngày được lưu ở nửa đêm UTC — dùng getDate() thường
 *  sẽ lệch một ngày ở những múi giờ âm. */
function fmt(d: Date) {
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(
    d.getUTCMonth() + 1,
  ).padStart(2, "0")}/${d.getUTCFullYear()}`;
}

export function MemoryList({
  memories,
  areaSlug,
  showArea = false,
}: {
  memories: MemoryWithPhotos[];
  areaSlug?: string;
  showArea?: boolean;
}) {
  return (
    <ul className="space-y-10">
      {memories.map((m) => {
        const isPublic = m.visibility === Visibility.PUBLIC;
        return (
          <li key={m.id}>
            <div className="flex items-baseline gap-3">
              <time
                dateTime={m.date.toISOString()}
                className="shrink-0 text-[13px] tabular-nums text-ink-3"
              >
                {fmt(m.date)}
              </time>
              <h3 className="min-w-0 flex-1 text-[17px] font-semibold leading-snug tracking-[-0.01em]">
                {m.title}
              </h3>

              {/* Hỏi lại cả hai chiều: bật nhầm là đưa chuyện riêng lên mạng,
                  tắt nhầm là làm hỏng link ai đó đang giữ. */}
              <form action={toggleMemoryVisibility.bind(null, m.id, areaSlug)}>
                <ConfirmButton
                  label={
                    isPublic
                      ? "Đang công khai — bấm để ẩn đi"
                      : "Đang riêng tư — bấm để cho người khác xem"
                  }
                  confirm={
                    isPublic
                      ? `Ẩn "${m.title}" khỏi trang công khai? Ảnh kèm theo cũng bị ẩn.`
                      : `Cho người khác xem "${m.title}"? Ký ức này và toàn bộ ảnh của nó sẽ hiện công khai trên iamvancuong.com.`
                  }
                  className={`flex items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-1 text-[11px] ${
                    isPublic
                      ? "text-up hover:bg-surface"
                      : "text-ink-3 hover:bg-surface hover:text-ink"
                  }`}
                >
                  {isPublic ? <Eye size={13} /> : <EyeOff size={13} />}
                  {isPublic ? "công khai" : "riêng tư"}
                </ConfirmButton>
              </form>

              <form action={deleteMemory.bind(null, m.id, areaSlug)}>
                <ConfirmButton
                  label={`Xóa: ${m.title}`}
                  confirm={`Xóa ký ức "${m.title}"?${
                    m.photos.length > 0
                      ? ` ${m.photos.length} tấm ảnh kèm theo cũng bị xóa khỏi ổ đĩa.`
                      : ""
                  } Không hoàn tác được.`}
                  className="p-1 text-ink-3 hover:text-down"
                >
                  <X size={15} strokeWidth={2} />
                </ConfirmButton>
              </form>
            </div>

            {(m.place || m.people || (showArea && m.area)) && (
              <div className="mt-1 pl-[76px] text-[12px] text-ink-3">
                {[showArea && m.area?.name, m.place, m.people]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            )}

            <div className="mt-2 space-y-3 pl-0 sm:pl-[76px]">
              {m.body && (
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-2">
                  {m.body}
                </p>
              )}

              {m.learned && (
                <p className="border-l-2 border-line pl-3 text-[14px] leading-relaxed text-ink-2">
                  <span className="text-ink-3">Học được: </span>
                  {m.learned}
                </p>
              )}

              <PhotoGrid photos={m.photos} alt={m.title} />

              <Disclosure label="Sửa" small>
                <div className="space-y-3">
                  <MemoryForm areaSlug={areaSlug ?? null} memory={m} />
                  {m.photos.length > 0 && (
                    <PhotoManager photos={m.photos} areaSlug={areaSlug ?? null} />
                  )}
                </div>
              </Disclosure>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Chú thích và xóa từng tấm ảnh.
 *
 * Cột `caption` được hiển thị sẵn ở lưới ảnh và ở Lightbox ngay từ đầu, nhưng
 * chưa từng có chỗ nhập — nên nó luôn rỗng, và trang /photos phải mượn tạm
 * tiêu đề ký ức để hiện thay.
 */
function PhotoManager({
  photos,
  areaSlug,
}: {
  photos: Photo[];
  areaSlug: string | null;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-line p-3">
      <div className="mb-2">
        <MicroLabel>Ảnh — {photos.length} tấm</MicroLabel>
      </div>

      <ul className="space-y-2">
        {photos.map((p) => (
          <li key={p.id} className="flex items-center gap-2">
            <Image
              src={p.thumbUrl ?? p.url}
              alt={p.caption ?? ""}
              width={44}
              height={44}
              unoptimized
              className="size-11 shrink-0 rounded-[var(--radius-sm)] border border-line object-cover"
            />

            <form
              action={setPhotoCaption.bind(null, p.id, areaSlug)}
              className="flex min-w-0 flex-1 items-center gap-2"
            >
              <input
                name="caption"
                defaultValue={p.caption ?? ""}
                placeholder="Chú thích ảnh…"
                aria-label="Chú thích ảnh"
                className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line-soft bg-surface px-2.5 py-1.5 text-[13px] outline-none focus:border-ink-3 focus:bg-bg"
              />
              <SubmitButton variant="quiet" pendingLabel="…">
                lưu
              </SubmitButton>
            </form>

            <form action={deletePhoto.bind(null, p.id, areaSlug)}>
              <ConfirmButton
                label="Xóa ảnh này"
                confirm="Xóa tấm ảnh này khỏi ổ đĩa? Không hoàn tác được."
                className="p-1 text-ink-3 hover:text-down"
              >
                <X size={14} strokeWidth={2} />
              </ConfirmButton>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
