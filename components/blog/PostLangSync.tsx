"use client";

import { useEffect } from "react";
import { useLang } from "@/components/i18n/LangProvider";

/**
 * Đăng ký URL bản Việt/Nhật của bài đang đọc với nút chuyển ngôn ngữ ở
 * header (xem `LangProvider` và `LangToggle`) — nhờ vậy trang bài không cần
 * nút chuyển ngôn ngữ riêng nữa. Gỡ đăng ký khi rời trang để nút header trở
 * lại vai trò chỉ đổi chữ giao diện ở các trang khác.
 */
export function PostLangSync({ slug, hasJa }: { slug: string; hasJa: boolean }) {
  const { setPostLangLinks } = useLang();

  useEffect(() => {
    setPostLangLinks({ vi: `/blog/${slug}`, ja: hasJa ? `/blog/${slug}/ja` : null });
    return () => setPostLangLinks(null);
  }, [slug, hasJa, setPostLangLinks]);

  return null;
}
