"use client";

import { useLang } from "./LangProvider";
import { home } from "@/lib/home";

/**
 * Nút chuyển Tiếng Việt ⇄ 日本語 — đặt ở header, đổi ngôn ngữ cả site.
 * `size="sm"` cho bản gọn trong header; mặc định to hơn cho menu mobile.
 */
export function LangToggle({ size = "md" }: { size?: "sm" | "md" }) {
  const { lang, setLang } = useLang();
  const pad = size === "sm" ? "px-2.5 py-1 text-[12px]" : "px-4 py-1.5 text-[13px]";

  return (
    <div className="inline-flex rounded-full border border-line p-0.5 font-medium">
      {(["vi", "ja"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l === "ja" ? "ja" : undefined}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full transition-colors ${pad} ${
            lang === l ? "bg-ink text-bg" : "text-ink-2 hover:text-ink"
          }`}
        >
          {home.langLabel[l]}
        </button>
      ))}
    </div>
  );
}
