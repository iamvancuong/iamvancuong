"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Hiện dần khi cuộn tới — không dùng thư viện (dự án giữ 0 dependency giao diện).
 *
 * Bọc một khối; khi khối lọt vào khung nhìn thì thêm class `.is-in` để CSS
 * (`app/globals.css` §MOTION) chạy transition. Một lần rồi thôi (ngắt quan sát).
 * Nếu trình duyệt không có IntersectionObserver, hiện luôn — không giấu nội dung.
 *
 * `prefers-reduced-motion` được xử ở CSS, không cần đụng ở đây.
 */
export function Reveal({
  children,
  className = "",
  delayMs = 0,
  stagger = false,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  /** true = từng phần tử con trượt lên so le (đẹp cho tiêu đề → nội dung). */
  stagger?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const base = stagger ? "reveal-stagger" : "reveal";
  return (
    <div
      ref={ref}
      className={`${base} ${shown ? "is-in" : ""} ${className}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
