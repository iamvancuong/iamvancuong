"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLang } from "./LangProvider";
import { home } from "@/lib/home";
import type { Lang } from "@/lib/i18n";

/**
 * Nút chuyển Tiếng Việt ⇄ 日本語 — đặt ở header, đổi ngôn ngữ cả site.
 * `size="sm"` cho bản gọn trong header; mặc định to hơn cho menu mobile.
 *
 * Trên trang đọc bài (`PostLangSync` đã đăng ký `postLangLinks`), nút này
 * KIÊM LUÔN việc chuyển bài — bấm sẽ điều hướng `/blog/slug` ⇄
 * `/blog/slug/ja` thay vì chỉ đổi chữ giao diện. Bài chưa có bản dịch thì
 * nút phía tiếng Nhật khoá lại (không còn URL nào để sang) thay vì biến mất,
 * vì giờ đây nó là nút DUY NHẤT — ẩn đi sẽ trông như site bị lỗi.
 */
export function LangToggle({ size = "md" }: { size?: "sm" | "md" }) {
  const { lang, setLang, postLangLinks } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const pad = size === "sm" ? "px-2.5 py-1 text-[12px]" : "px-4 py-1.5 text-[13px]";

  const onPost = postLangLinks !== null;
  const active: Lang = onPost ? (pathname.endsWith("/ja") ? "ja" : "vi") : lang;

  function pick(l: Lang) {
    if (onPost) {
      const href = postLangLinks[l];
      if (!href) return; // bài này chưa có bản dịch
      router.push(href);
    }
    setLang(l);
  }

  return (
    <div className="inline-flex rounded-full border border-line p-0.5 font-medium">
      {(["vi", "ja"] as const).map((l) => {
        const disabled = onPost && !postLangLinks[l];
        return (
          <button
            key={l}
            type="button"
            lang={l === "ja" ? "ja" : undefined}
            onClick={() => pick(l)}
            disabled={disabled}
            aria-pressed={active === l}
            className={`rounded-full transition-colors ${pad} ${
              active === l
                ? "bg-ink text-bg"
                : disabled
                  ? "cursor-not-allowed text-ink-3 opacity-40"
                  : "text-ink-2 hover:text-ink"
            }`}
          >
            {home.langLabel[l]}
          </button>
        );
      })}
    </div>
  );
}
