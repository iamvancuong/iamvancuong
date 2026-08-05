"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type LightboxPhoto = {
  id: string;
  url: string;
  thumbUrl: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
};

/**
 * Xem ảnh ngay tại chỗ, không mở tab mới.
 *
 * Bàn phím: ← → chuyển ảnh, Esc đóng. Trên điện thoại thì vuốt ngang.
 * Khóa cuộn trang khi đang mở, nếu không nền sẽ trôi sau lưng.
 */
export function Lightbox({
  photos,
  index,
  onClose,
  onIndex,
}: {
  photos: LightboxPhoto[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const [touchX, setTouchX] = useState<number | null>(null);

  const many = photos.length > 1;
  const prev = useCallback(
    () => onIndex((index - 1 + photos.length) % photos.length),
    [index, photos.length, onIndex],
  );
  const next = useCallback(
    () => onIndex((index + 1) % photos.length),
    [index, photos.length, onIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && many) prev();
      else if (e.key === "ArrowRight" && many) next();
    };
    window.addEventListener("keydown", onKey);

    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, prev, next, many]);

  const photo = photos[index];
  if (!photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh"
      onClick={onClose}
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX === null || !many) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
        setTouchX(null);
      }}
      className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-sm"
    >
      <div className="flex shrink-0 items-center justify-between px-4 py-3 text-white/70">
        <span className="text-[13px] tabular-nums">
          {many ? `${index + 1} / ${photos.length}` : ""}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="flex size-9 items-center justify-center rounded-[var(--radius-md)] transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={20} strokeWidth={1.75} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-2">
        {many && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Ảnh trước"
            className="absolute left-2 z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ChevronLeft size={22} strokeWidth={1.75} />
          </button>
        )}

        {/* Bấm vào chính tấm ảnh thì không đóng — chỉ bấm ra nền mới đóng */}
        <Image
          key={photo.id}
          src={photo.url}
          alt={photo.caption ?? ""}
          width={photo.width ?? 1600}
          height={photo.height ?? 1200}
          unoptimized
          onClick={(e) => e.stopPropagation()}
          className="max-h-full w-auto max-w-full object-contain"
        />

        {many && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Ảnh sau"
            className="absolute right-2 z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ChevronRight size={22} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {photo.caption && (
        <p className="shrink-0 px-6 pb-5 text-center text-[14px] leading-relaxed text-white/70">
          {photo.caption}
        </p>
      )}
    </div>
  );
}
