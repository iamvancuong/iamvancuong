"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

/**
 * Nút bấm biết lúc nào form đang chạy.
 *
 * `useFormStatus` chỉ đọc được form cha gần nhất, nên hai nút này bắt buộc
 * phải là component con nằm trong form — không gộp vào trang được.
 */

/**
 * Nút gửi form.
 *
 * Trước đây mọi nút đều im lặng: bấm xong không có gì đổi cho tới lúc trang
 * render lại, nên phản xạ tự nhiên là bấm thêm lần nữa.
 */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "solid",
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: "solid" | "quiet";
}) {
  const { pending } = useFormStatus();

  const cls =
    variant === "solid"
      ? "rounded-[var(--radius-sm)] bg-ink px-4 py-2 text-[14px] font-medium text-white hover:opacity-90"
      : "text-[12px] text-accent underline underline-offset-2";

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`shrink-0 transition-opacity disabled:opacity-40 ${cls}`}
    >
      {pending ? (pendingLabel ?? "Đang lưu…") : children}
    </button>
  );
}

/**
 * Nút xóa có hỏi lại.
 *
 * Bắt buộc với ký ức: xóa một ký ức là xóa luôn ảnh thật trên đĩa, không có
 * thùng rác, không hoàn tác được. Một cú chạm nhầm trên điện thoại là mất
 * vĩnh viễn — mà các nút xóa đều là icon nhỏ nằm sát mép màn hình.
 */
export function ConfirmButton({
  confirm,
  label,
  children,
  className = "",
}: {
  confirm: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={label}
      title={label}
      onClick={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
      className={`shrink-0 transition-opacity disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}
