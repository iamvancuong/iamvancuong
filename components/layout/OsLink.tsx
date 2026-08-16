"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { LockKeyhole, SquareUser } from "lucide-react";
import { useLang } from "@/components/i18n/LangProvider";
import { t } from "@/lib/i18n";

/**
 * Báo cho React đọc lại cookie ngay sau khi mount, và mỗi lần quay lại tab.
 *
 * Nếu để subscribe rỗng thì React giữ nguyên giá trị của lần render đầu
 * (lúc đó luôn là false vì trang được dựng tĩnh trên server) và nút sẽ không
 * bao giờ đổi kiểu. Lắng nghe `focus` để đăng nhập ở tab khác thì tab này
 * cũng cập nhật.
 */
function subscribe(onChange: () => void) {
  const id = setTimeout(onChange, 0);
  window.addEventListener("focus", onChange);
  return () => {
    clearTimeout(id);
    window.removeEventListener("focus", onChange);
  };
}

/**
 * Lối vào Life OS từ giao diện ngoài.
 *
 * Đọc cookie gợi ý (không httpOnly) để đổi nhãn: đã đăng nhập thì "Life OS",
 * chưa thì hiện ổ khóa. Đọc phía client nên các trang công khai vẫn được
 * dựng tĩnh — nếu kiểm tra phiên ở server thì cả site phải render động chỉ
 * vì cái nút này.
 *
 * Người lạ bấm vào cũng chỉ tới trang đăng nhập.
 */
export function OsLink() {
  const { lang } = useLang();
  // Trong lúc SSR và hydrate thì trả về false → HTML hai bên khớp nhau.
  const signedIn = useSyncExternalStore(
    subscribe,
    () => document.cookie.includes("vc_owner=1"),
    () => false,
  );

  return (
    <Link
      href="/os"
      title={signedIn ? t.os.enter[lang] : t.os.private[lang]}
      // Bo tròn hẳn — cùng hệ hình khối với viên thuốc nav (xem ThemeToggle).
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
        signedIn
          ? "border-line bg-surface text-ink hover:border-ink-3"
          : "border-transparent text-ink-3 hover:text-ink"
      }`}
    >
      {signedIn ? (
        <SquareUser size={14} strokeWidth={1.75} />
      ) : (
        <LockKeyhole size={13} strokeWidth={1.75} />
      )}
      <span className={signedIn ? "" : "hidden sm:inline"}>Life OS</span>
    </Link>
  );
}
