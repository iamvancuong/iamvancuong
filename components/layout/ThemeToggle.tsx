"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

/**
 * Nút chuyển Sáng / Tối / Theo hệ thống.
 *
 * Ba trạng thái chứ không phải hai. Nếu chỉ có bật/tắt thì lần đầu bấm vào là
 * mất luôn khả năng đi theo cài đặt máy — mà "theo máy" mới là thứ đúng phần
 * lớn thời gian: điện thoại tự chuyển tối buổi tối, và trang nên chuyển theo.
 *
 * Lựa chọn nằm ở `localStorage` + thuộc tính `data-theme` trên <html>. Thuộc
 * tính đó được gán bởi một đoạn script CHẶN trong <head> (xem app/layout.tsx),
 * chạy trước khi trình duyệt vẽ khung hình đầu tiên — không có nó thì trang
 * luôn vẽ màu sáng trước rồi mới nhảy sang tối, và cái chớp đó xuất hiện ở MỌI
 * lần tải trang.
 *
 * Đọc trạng thái bằng `useSyncExternalStore` — cùng cách `OsLink` đọc cookie.
 * Lúc dựng trên máy chủ không có `localStorage`, nên bản dựng trả về "system";
 * client sửa lại ngay sau khi gắn vào cây. Nhờ vậy HTML hai bên khớp nhau và
 * không có cảnh báo hydrate.
 */

const KEY = "theme";
const EVENT = "themechange";

type Theme = "system" | "light" | "dark";

/** Vòng lặp khi bấm: theo máy → sáng → tối → theo máy. */
const NEXT: Record<Theme, Theme> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const LABEL: Record<Theme, string> = {
  system: "Theo hệ thống",
  light: "Giao diện sáng",
  dark: "Giao diện tối",
};

const ICON = { system: Monitor, light: Sun, dark: Moon };

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  // Đổi ở tab khác thì tab này cập nhật theo.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function read(): Theme {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "system";
}

function apply(theme: Theme) {
  const el = document.documentElement;

  if (theme === "system") {
    delete el.dataset.theme;
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Trình duyệt chặn lưu trữ (chế độ ẩn danh chẳng hạn) — chọn vẫn có tác
      // dụng cho phiên này, chỉ là không nhớ được. Không đáng để hỏng cả nút.
    }
  } else {
    el.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* như trên */
    }
  }

  window.dispatchEvent(new Event(EVENT));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "system" as Theme);
  const Icon = ICON[theme];

  return (
    <button
      type="button"
      onClick={() => apply(NEXT[theme])}
      title={`${LABEL[theme]} — bấm để đổi sang ${LABEL[NEXT[theme]].toLowerCase()}`}
      aria-label={`Giao diện: ${LABEL[theme]}. Bấm để đổi.`}
      className="flex items-center rounded-[var(--radius-md)] p-1.5 text-ink-3 transition-colors hover:bg-surface hover:text-ink"
    >
      <Icon size={15} strokeWidth={1.75} />
    </button>
  );
}
