import Image from "next/image";
import type { Photo } from "@prisma/client";
import { X } from "lucide-react";
import { isoUTC, fmtDateVN, daysBetweenISO } from "@/lib/os/day";
import { deletePhoto, setPhotoCaption } from "@/lib/os/actions";
import { ConfirmButton, EmptyNote, SubmitButton } from "./formBits";
import { AreaPhotoUpload } from "./AreaPhotoUpload";

/**
 * Ảnh tiến trình của một lĩnh vực.
 *
 * Xếp CŨ → MỚI, ngược với Ký ức. Ký ức đọc như nhật ký nên mới nhất lên trước;
 * còn ở đây thứ có nghĩa là **khoảng cách giữa hai tấm**, mà đọc khoảng cách
 * thì phải đi theo chiều thời gian tiến tới.
 *
 * Mỗi tấm ghi rõ cách tấm trước bao nhiêu ngày — đó là con số nói cho bạn biết
 * mình có đang giữ được chu kỳ chụp hay không, và cũng là thứ khiến hai tấm
 * cạnh nhau so sánh được.
 */
export function ProgressPhotos({
  slug,
  photos,
}: {
  slug: string;
  photos: Photo[];
}) {
  /** Ngày của một tấm: ưu tiên EXIF, không có thì lấy ngày tải lên. */
  const dayOf = (p: Photo) => isoUTC(p.takenAt ?? p.createdAt);

  const sorted = [...photos].sort((a, b) => dayOf(a).localeCompare(dayOf(b)));

  return (
    <div className="space-y-6">
      {sorted.length === 0 ? (
        <EmptyNote>
          Chưa có ảnh tiến trình nào. Dùng cho thứ đổi quá chậm để nhớ — da,
          tóc, cơ thể. Chụp cùng một góc, cùng chỗ đứng, mỗi tháng một lần là
          đủ; giá trị nằm ở việc so hai tấm cách nhau nửa năm, không nằm ở việc
          chụp nhiều.
        </EmptyNote>
      ) : (
        <>
          <p className="text-[13px] leading-relaxed text-ink-3">
            Xếp cũ → mới. {sorted.length} tấm, trải{" "}
            {daysBetweenISO(dayOf(sorted[0]), dayOf(sorted[sorted.length - 1]))}{" "}
            ngày.
          </p>

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {sorted.map((p, i) => {
              const iso = dayOf(p);
              const gap =
                i === 0 ? null : daysBetweenISO(dayOf(sorted[i - 1]), iso);

              return (
                <li key={p.id} className="space-y-1.5">
                  <div className="relative">
                    <Image
                      src={p.thumbUrl ?? p.url}
                      alt={p.caption ?? `Ảnh ngày ${fmtDateVN(iso)}`}
                      width={p.width ?? 400}
                      height={p.height ?? 400}
                      unoptimized
                      className="w-full rounded-[var(--radius-md)] border border-line object-cover"
                    />
                    <form
                      action={deletePhoto.bind(null, p.id, slug)}
                      className="absolute right-1 top-1"
                    >
                      <ConfirmButton
                        label={`Xóa ảnh ngày ${fmtDateVN(iso)}`}
                        confirm={`Xóa tấm ngày ${fmtDateVN(iso)} khỏi ổ đĩa? Không hoàn tác được.`}
                        className="rounded-[var(--radius-sm)] bg-bg/85 p-1 text-ink-3 backdrop-blur hover:text-down"
                      >
                        <X size={13} strokeWidth={2} />
                      </ConfirmButton>
                    </form>
                  </div>

                  <div className="flex items-baseline gap-2 text-[12px] tabular-nums text-ink-3">
                    <span>{fmtDateVN(iso)}</span>
                    {gap != null && <span>+{gap} ngày</span>}
                    {!p.takenAt && (
                      <span title="Ảnh không có ngày chụp trong EXIF — lấy ngày tải lên">
                        ~
                      </span>
                    )}
                  </div>

                  <form
                    action={setPhotoCaption.bind(null, p.id, slug)}
                    className="flex items-center gap-1"
                  >
                    <input
                      name="caption"
                      defaultValue={p.caption ?? ""}
                      placeholder="ghi chú…"
                      aria-label={`Ghi chú ảnh ngày ${fmtDateVN(iso)}`}
                      className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line-soft bg-surface px-2 py-1 text-[12px] outline-none focus:border-ink-3 focus:bg-bg"
                    />
                    <SubmitButton variant="quiet" pendingLabel="…">
                      lưu
                    </SubmitButton>
                  </form>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <AreaPhotoUpload slug={slug} />
    </div>
  );
}
