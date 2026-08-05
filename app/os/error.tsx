"use client";

import Link from "next/link";

/**
 * Lỗi bên trong Life OS. Chỉ mình tôi thấy trang này, nên hiện thẳng thông
 * điệp lỗi — đỡ phải mở terminal để biết chuyện gì.
 *
 * Trường hợp hay gặp nhất là hết phiên đăng nhập: mọi server action gọi
 * assertOwner() và ném lỗi khi cookie hết hạn. Nên có sẵn lối đăng nhập lại
 * ngay ở đây thay vì để người dùng tự đoán.
 */
export default function OsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const signedOut = error.message.includes("Chưa đăng nhập");

  return (
    <div className="max-w-[560px] py-6">
      <h1 className="text-[20px] font-semibold tracking-[-0.01em]">
        {signedOut ? "Phiên đăng nhập đã hết" : "Có gì đó hỏng"}
      </h1>

      <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
        {signedOut
          ? "Cookie đăng nhập hết hạn sau 30 ngày. Đăng nhập lại rồi làm tiếp — thao tác vừa rồi chưa được lưu."
          : "Thao tác vừa rồi không chạy được. Dữ liệu đã lưu trước đó vẫn nguyên."}
      </p>

      {!signedOut && (
        <pre className="mt-4 overflow-x-auto rounded-[var(--radius-md)] border border-line bg-surface px-3 py-2 text-[12px] leading-relaxed text-ink-2">
          {error.message}
          {error.digest ? `\n\ndigest: ${error.digest}` : ""}
        </pre>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {signedOut ? (
          <Link
            href="/login"
            className="rounded-[var(--radius-md)] bg-ink px-4 py-2.5 text-[14px] font-medium text-white"
          >
            Đăng nhập lại
          </Link>
        ) : (
          <button
            type="button"
            onClick={reset}
            className="rounded-[var(--radius-md)] bg-ink px-4 py-2.5 text-[14px] font-medium text-white"
          >
            Thử lại
          </button>
        )}
        <Link
          href="/os"
          className="text-[14px] text-ink-2 transition-colors hover:text-ink"
        >
          Về Hôm nay
        </Link>
      </div>
    </div>
  );
}
