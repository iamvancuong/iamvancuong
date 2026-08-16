import type { ReactNode } from "react";
import { SectionLabel } from "./SectionLabel";

/**
 * Đầu trang dùng chung cho MỌI trang công khai.
 *
 * Trước đây năm trang mỗi trang tự viết `<header>` với `<h1 text-[32px]>` —
 * giống nhau về ý nhưng rời nhau về mã, nên sửa thang chữ là phải nhớ đủ năm
 * chỗ. Đó chính là cách một giao diện mất đồng bộ: không phải vì ai đó làm
 * khác, mà vì không có chỗ nào để làm giống.
 *
 * Ba tầng, đúng thứ tự mắt đọc:
 *   nhãn đánh số   `01 ——— VIẾT / WRITING`   — đang ở đâu trong site
 *   tiêu đề lớn    `Ghi chép nhỏ.`           — trang này là gì
 *   mô tả          một câu                   — và nó chứa gì
 *
 * Dấu chấm xanh cuối tiêu đề: cùng ký tự kết ở logo và ở mọi mục trang chủ.
 * Lặp một ký tự ở nhiều chỗ là cách rẻ nhất để các trang trông như cùng một nhà.
 */
export function PageHeader({
  index,
  label,
  en,
  title,
  lang,
  children,
}: {
  index: number;
  /** Tên trang trong nhãn nhỏ — tiếng Việt, chữ hoa hóa bằng CSS. */
  label: string;
  /** Bản tiếng Anh trong nhãn, sau dấu `/`. */
  en: string;
  title: string;
  /** Gắn `lang="ja"` khi đang xem tiếng Nhật để font Nhật ăn đúng. */
  lang?: string;
  /** Mô tả dưới tiêu đề. */
  children?: ReactNode;
}) {
  return (
    <header className="pb-4 pt-10 md:pt-16">
      <SectionLabel index={index} en={en}>
        {label}
      </SectionLabel>

      <h1
        lang={lang}
        className="mt-6 text-[40px] font-semibold leading-[1.04] tracking-[-0.035em] text-ink md:text-[64px]"
      >
        {title}
        <span className="text-accent">.</span>
      </h1>

      {children && (
        <p
          lang={lang}
          className="mt-6 max-w-[58ch] text-[17px] leading-relaxed text-ink-2"
        >
          {children}
        </p>
      )}
    </header>
  );
}
