import type { ReactNode } from "react";

/**
 * Mảnh giao diện dùng lại trong /os.
 *
 * File này KHÔNG có "use client" để `EmptyNote` còn dùng được thẳng trong
 * server component. Hai nút cần `useFormStatus` nằm ở FormButtons.tsx và
 * được xuất lại ở đây, nên chỗ gọi không phải nhớ chúng nằm ở file nào.
 */
export { SubmitButton, ConfirmButton } from "./FormButtons";

/**
 * Lĩnh vực trống KHÔNG phải lỗi. Hiển thị nhẹ nhàng, không cảnh báo đỏ.
 * Sáu tháng nữa mà Tình yêu vẫn trống thì hoàn toàn ổn. (OS-DESIGN §10)
 */
export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[var(--radius-lg)] border border-dashed border-line px-4 py-5 text-[14px] text-ink-3">
      {children}
    </p>
  );
}

/** Nhãn nhỏ chữ hoa dùng khắp /os — trước đây lặp lại ở ~15 chỗ. */
export function MicroLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
      {children}
    </span>
  );
}

/** Ô nhập dùng chung, để mọi form trong /os cao bằng nhau. */
export const inputCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-bg px-3 py-2 text-[15px] outline-none focus:border-ink-3";

export const inputSmCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-bg px-3 py-2 text-[14px] outline-none focus:border-ink-3";
