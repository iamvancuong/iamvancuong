"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox, type LightboxPhoto } from "./Lightbox";

/**
 * Lưới ảnh bấm vào là xem ngay tại chỗ.
 *
 * `stopPropagation` + `preventDefault` để dùng được cả khi lưới nằm bên
 * trong một thẻ <Link> — như thẻ ngày ở trang Nhật ký, nơi bấm vào thẻ thì
 * mở ngày đó nhưng bấm vào ảnh thì phải mở ảnh.
 */
export function PhotoGrid({
  photos,
  variant = "row",
  alt = "",
}: {
  photos: LightboxPhoto[];
  /** row: hàng nhỏ trong thẻ · grid: lưới trong bài · square: lưới ảnh lớn */
  variant?: "row" | "grid" | "square";
  alt?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  if (photos.length === 0) return null;

  const wrap =
    variant === "row"
      ? "flex gap-1.5"
      : variant === "square"
        ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        : "grid grid-cols-2 gap-2 sm:grid-cols-3";

  // Bo góc đặt ở nút, kích thước đặt ở ảnh — để overflow-hidden cắt đúng
  const frame =
    variant === "row"
      ? "rounded-[var(--radius-sm)]"
      : variant === "square"
        ? "rounded-[var(--radius-lg)]"
        : "rounded-[var(--radius-md)]";

  const cell =
    variant === "row"
      ? "size-14"
      : variant === "square"
        ? "aspect-square w-full"
        : "h-32 w-full";

  return (
    <>
      <div className={wrap}>
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            title={p.caption ?? undefined}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(i);
            }}
            className={`block overflow-hidden border border-line transition-opacity hover:opacity-90 ${frame}`}
          >
            <Image
              src={p.thumbUrl ?? p.url}
              alt={p.caption ?? alt}
              width={480}
              height={480}
              unoptimized
              className={`${cell} object-cover`}
            />
          </button>
        ))}
      </div>

      {open !== null && (
        <Lightbox
          photos={photos}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
