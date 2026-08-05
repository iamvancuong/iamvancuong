import type { ReactNode } from "react";

/**
 * Phần mở ra / thu lại, dựng bằng `<details>` thuần.
 *
 * Không dùng useState vì không cần: `<details>` đã có sẵn trạng thái mở/đóng,
 * mở được bằng bàn phím, và hoạt động cả khi JavaScript chưa tải xong. Nhờ
 * vậy các tab lĩnh vực vẫn là server component — thêm một form sửa không kéo
 * theo cả cây component xuống client.
 *
 * Dùng cho form sửa và form thêm: chúng chiếm nhiều chỗ nhưng ít khi cần tới,
 * và một trang toàn ô nhập mở sẵn thì nhìn đã thấy mệt.
 */
export function Disclosure({
  label,
  children,
  small = false,
}: {
  label: string;
  children: ReactNode;
  small?: boolean;
}) {
  return (
    <details className="group mt-2">
      <summary
        className={`inline-flex cursor-pointer list-none items-center gap-1 text-ink-3 transition-colors hover:text-ink [&::-webkit-details-marker]:hidden ${
          small ? "text-[12px]" : "text-[14px]"
        }`}
      >
        <span className="transition-transform group-open:rotate-90" aria-hidden>
          ›
        </span>
        {label}
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}
