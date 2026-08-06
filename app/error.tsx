"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";

/**
 * Lỗi ở phần công khai. Người lạ thấy trang này, nên không hiện chi tiết kỹ
 * thuật — chỉ nói rõ là lỗi phía tôi và chỉ đường đi tiếp.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <Container width="prose">
      <div className="py-10">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">
          Có gì đó hỏng
        </h1>
        <p className="mt-2 text-[16px] leading-relaxed text-ink-2">
          Lỗi nằm ở phía tôi, không phải ở bạn. Thử tải lại xem sao.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="rounded-[var(--radius-md)] bg-ink px-4 py-2.5 text-[14px] font-medium text-bg"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="text-[14px] text-ink-2 transition-colors hover:text-ink"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </Container>
  );
}
