"use client";

import { useState, useTransition, type ReactNode } from "react";

/**
 * Nút «sửa» mở một form ngay tại chỗ, và **tự đóng lại sau khi lưu**.
 *
 * Vì sao không dùng `<details>` thuần như `Disclosure`: `<details>` không biết
 * form bên trong đã gửi xong hay chưa, nên lưu xong bảng vẫn mở nguyên với
 * đúng những giá trị vừa gõ — nhìn y hệt lúc chưa bấm. Người dùng không có
 * cách nào biết là đã lưu, và phản xạ tự nhiên là bấm Lưu thêm lần nữa.
 *
 * Ở đây việc **đóng lại chính là lời xác nhận**: bảng thu về, dòng phía trên
 * hiện giá trị mới (server action đã `revalidatePath`). Không cần thêm một
 * dòng chữ "đã lưu" rồi phải nghĩ xem bao lâu thì nó biến mất.
 */
export function InlineEditor({
  action,
  label = "sửa",
  children,
}: {
  /** Server action đã bind sẵn id — nhận FormData của form này. */
  action: (fd: FormData) => Promise<void>;
  label?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [saving, start] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[12px] text-ink-3 transition-colors hover:text-ink"
      >
        {label}
      </button>
    );
  }

  return (
    <form
      // `w-full` để form chiếm trọn hàng thay vì bị bóp trong ô flex cạnh «xóa».
      className="w-full space-y-2 rounded-[var(--radius-md)] border border-line p-2.5"
      action={(fd) =>
        start(async () => {
          await action(fd);
          setOpen(false);
        })
      }
    >
      {children}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[12px] text-ink-3 transition-colors hover:text-ink"
        >
          hủy
        </button>
        {/* Không dùng SubmitButton: nó đọc `useFormStatus`, mà ở đây việc gửi
            chạy trong `startTransition` nên trạng thái thật nằm ở `saving`. */}
        <button
          type="submit"
          disabled={saving}
          aria-busy={saving}
          className="rounded-[var(--radius-sm)] bg-ink px-3 py-1.5 text-[13px] font-medium text-bg transition-opacity disabled:opacity-40"
        >
          {saving ? "Đang lưu…" : "Lưu"}
        </button>
      </div>
    </form>
  );
}
