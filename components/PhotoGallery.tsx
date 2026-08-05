"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox, type LightboxPhoto } from "./Lightbox";

export type PhotoSection = { key: string; label: string; photos: LightboxPhoto[] };

/**
 * Thư viện ảnh chia theo tháng, nhưng khi mở ra thì lướt được **toàn bộ**.
 *
 * Khác với PhotoGrid: ở đó mỗi nhóm ảnh thuộc về một ký ức nên chuyển ảnh
 * trong nhóm là đúng. Ở trang thư viện thì người xem muốn lướt tiếp sang
 * tháng trước chứ không bị chặn ở ranh giới tháng.
 */
export function PhotoGallery({ sections }: { sections: PhotoSection[] }) {
  const [open, setOpen] = useState<number | null>(null);

  // Danh sách phẳng để lightbox đi xuyên các tháng
  const flat = sections.flatMap((s) => s.photos);
  const offsets = new Map<string, number>();
  let running = 0;
  for (const s of sections) {
    offsets.set(s.key, running);
    running += s.photos.length;
  }

  return (
    <>
      <div className="mt-12 space-y-12">
        {sections.map((s) => (
          <section key={s.key}>
            <h2 className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-ink-3">
              {s.label}
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {s.photos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  title={p.caption ?? undefined}
                  onClick={() => setOpen(offsets.get(s.key)! + i)}
                  className="block overflow-hidden rounded-[var(--radius-lg)] border border-line transition-opacity hover:opacity-90"
                >
                  <Image
                    src={p.thumbUrl ?? p.url}
                    alt={p.caption ?? "Ảnh"}
                    width={480}
                    height={480}
                    unoptimized
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {open !== null && (
        <Lightbox
          photos={flat}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
