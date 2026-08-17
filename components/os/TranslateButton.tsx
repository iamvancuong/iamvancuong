"use client";

import { useState, useTransition } from "react";
import { Languages, Loader2, AlertTriangle } from "lucide-react";
import { translatePost } from "@/lib/os/postActions";

/**
 * Nút «Dịch sang tiếng Nhật» ở trang soạn bài.
 *
 * ## ⚠️ KHÔNG bọc trong `<form>` — và đây là lỗi đã vấp
 *
 * Bản đầu tiên dùng `<form action={…}>` + `useActionState`, kiểu chuẩn của
 * server action. Nó hỏng, vì khối «Bản tiếng Nhật» nằm **bên trong** form Lưu
 * bài, mà HTML **không cho `<form>` lồng `<form>`**: trình duyệt lặng lẽ vứt
 * thẻ bên trong lúc phân tích cú pháp, nên cái nút rơi vào form NGOÀI và mỗi
 * cú bấm Dịch trở thành một cú bấm Lưu.
 *
 * Triệu chứng lại chẳng liên quan gì tới dịch thuật:
 *
 *     Uncaught Error: A React form was unexpectedly submitted.
 *
 * Nên ở đây gọi THẲNG server action từ `onClick`, bọc trong `useTransition`.
 * Không có `<form>` nào để lồng, và `type="button"` chặn nốt hành vi mặc định
 * của `<button>` trong một form (mặc định là `submit`, không phải `button`).
 *
 * ## Ba việc nút này phải làm
 *
 * **1. Hỏi lại khi đã có bản tiếng Nhật.** Dịch là ghi ĐÈ. Một cú bấm nhầm xóa
 * sạch công sửa tay của lần trước mà không lấy lại được.
 *
 * **2. Nói rõ đang chờ.** Gọi mô hình mất 10–60 giây tùy độ dài bài. Không có
 * dấu hiệu thì người ta bấm lần hai, lần ba — mỗi lần là một lượt tính tiền
 * thật và một lần ghi đè nữa.
 *
 * **3. Hiện lỗi TẠI CHỖ.** Hết hạn mức, khóa sai, mất mạng đều là chuyện hỏng
 * vì lý do bên ngoài. Để server action ném lỗi thì cả trang rơi vào `error.tsx`
 * và mất trắng mọi thứ đang gõ dở.
 */
export function TranslateButton({
  postId,
  hasJa,
}: {
  postId: string;
  /** Đã có `bodyJa` chưa — quyết định việc hỏi lại và chữ trên nút. */
  hasJa: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    if (
      hasJa &&
      !confirm(
        "Bài này đã có bản tiếng Nhật. Dịch lại sẽ GHI ĐÈ toàn bộ, kể cả những chỗ bạn đã sửa tay.\n\nTiếp tục?",
      )
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      setError(await translatePost(postId));
    });
  };

  return (
    <div>
      <button
        // `type="button"` là BẮT BUỘC: nút này nằm trong form Lưu bài, mà
        // `<button>` không khai type thì mặc định là `submit`.
        type="button"
        onClick={run}
        disabled={pending}
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

      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-relaxed text-down">
          <AlertTriangle size={13} strokeWidth={2} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
