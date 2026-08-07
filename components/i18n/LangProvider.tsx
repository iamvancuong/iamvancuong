"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { LANG_COOKIE, type Lang } from "@/lib/i18n";

/**
 * Ngôn ngữ hiển thị dùng chung cho toàn site (nút chuyển ở header đổi cái này).
 *
 * `initial` do layout đọc từ cookie phía SERVER rồi truyền vào — nhờ vậy HTML
 * dựng sẵn đã đúng ngôn ngữ, không có cảnh nháy Việt→Nhật lúc tải trang, và
 * hai bên server/client khớp nhau (không cảnh báo hydrate).
 *
 * Đổi ngôn ngữ = cập nhật state + ghi cookie (để lần sau vào vẫn nhớ). KHÔNG
 * set `<html lang="ja">` toàn cục: dữ liệu người dùng viết bằng tiếng Việt sẽ
 * bị đẩy sang font Nhật (thiếu dấu ề/ữ/ộ). Từng phần tử chữ Nhật tự gắn
 * `lang="ja"` như trang chủ đang làm.
 */
type Ctx = { lang: Lang; setLang: (l: Lang) => void };

const LangCtx = createContext<Ctx | null>(null);

export function LangProvider({
  initial,
  children,
}: {
  initial: Lang;
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initial);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      // 1 năm, path gốc, SameSite=Lax là đủ cho một cookie sở thích không nhạy cảm.
      document.cookie = `${LANG_COOKIE}=${l};path=/;max-age=31536000;samesite=lax`;
      localStorage.setItem(LANG_COOKIE, l);
    } catch {
      // Trình duyệt chặn lưu trữ → vẫn đổi cho phiên này, chỉ là không nhớ được.
    }
  }, []);

  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang phải nằm trong <LangProvider>");
  return ctx;
}
