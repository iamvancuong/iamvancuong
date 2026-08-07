import Image from "next/image";
import { ImageIcon } from "lucide-react";

/**
 * Khung ảnh dùng chung cho Hero + Gallery.
 * - Có `src`  → ảnh thật qua next/image (tối ưu, object-cover).
 * - Trống     → khung placeholder gọn gàng, không vỡ layout.
 *
 * Kích thước/tỷ lệ/bo góc do phía gọi truyền qua `className` (vd `aspect-square
 * rounded-[var(--radius-lg)]`). Component thuần trình bày — không có hook, nên
 * dùng được cả trong server (Hero) lẫn client (Gallery).
 */
export function Frame({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  src?: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-surface ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-surface to-surface-2 text-ink-3">
          <div className="flex flex-col items-center gap-2">
            <ImageIcon size={22} strokeWidth={1.5} />
            <span className="text-[11px] uppercase tracking-[0.08em]">Ảnh</span>
          </div>
        </div>
      )}
    </div>
  );
}
