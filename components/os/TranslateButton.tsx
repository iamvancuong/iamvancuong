"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Languages, Loader2, AlertTriangle } from "lucide-react";
import { translatePost } from "@/lib/os/postActions";

/**
 * Nút «Dịch sang tiếng Nhật» ở trang soạn bài.
 *
 * ## Ba thứ nút này phải làm, và vì sao
 *
 * **1. Hỏi lại khi đã có bản tiếng Nhật.** Dịch là ghi ĐÈ. Nếu đã có bản cũ —
 * dù do AI dịch rồi sửa tay, hay do tự viết — thì một cú bấm nhầm xóa sạch
 * công sửa đó mà không có cách nào lấy lại. `confirm()` thô nhưng đúng việc:
 * nó chặn đúng cái duy nhất cần chặn.
 *
 * **2. Nói rõ đang chờ.** Gọi mô hình mất 10–60 giây tùy độ dài bài. Không có
 * dấu hiệu nào thì người ta bấm lần thứ hai, thứ ba — mỗi lần là một lượt tính
 * tiền thật và một lần ghi đè nữa. `useFormStatus` khóa nút ngay khi gửi đi.
 *
 * **3. Hiện lỗi TẠI CHỖ.** Hết hạn mức, khóa sai, mất mạng — toàn thứ hỏng vì
 * lý do bên ngoài. Nếu để server action ném lỗi thì cả trang rơi vào
 * `error.tsx` và **mất trắng mọi thứ đang gõ dở trong form**. Nên action trả
 * chuỗi lỗi, `useActionState` nhận, và nó hiện ngay dưới nút.
 *
 * Trang KHÔNG tự tải lại sau khi dịch xong — `revalidatePath` trong action lo
 * việc đó, và React thay nội dung tại chỗ nên phần form đang gõ dở vẫn còn.
 */

/**
 * Tách riêng vì `useFormStatus` chỉ đọc được trạng thái của `<form>` CHA nó.
 * Gọi hook đó trong cùng component chứa `<form>` thì luôn nhận `pending: false`
 * — một cái bẫy im lặng: nút trông như không bao giờ bận.
 */
function Submit({ hasJa }: { hasJa: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (
          hasJa &&
          !confirm(
            "Bài này đã có bản tiếng Nhật. Dịch lại sẽ GHI ĐÈ toàn bộ, kể cả những chỗ bạn đã sửa tay.\n\nTiếp tục?",
          )
        ) {
          e.preventDefault();
        }
      }}
      className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-line px-3 py-1.5 text-[13px] transition-colors hover:border-ink-3 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 size={14} strokeWidth={2} className="animate-spin" />
          Đang dịch…
        </>
      ) : (
        <>
          <Languages size={14} strokeWidth={1.75} />
          {hasJa ? "Dịch lại bằng AI" : "Dịch sang tiếng Nhật"}
        </>
      )}
    </button>
  );
}

export function TranslateButton({
  postId,
  hasJa,
}: {
  postId: string;
  /** Đã có `bodyJa` chưa — quyết định việc hỏi lại và chữ trên nút. */
  hasJa: boolean;
}) {
  const [error, action] = useActionState(translatePost.bind(null, postId), null);

  return (
    <div>
      <form action={action}>
        <Submit hasJa={hasJa} />
      </form>

      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-relaxed text-down">
          <AlertTriangle size={13} strokeWidth={2} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
