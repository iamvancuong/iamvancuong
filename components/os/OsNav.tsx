"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarCheck,
  CalendarDays,
  BookOpen,
  Crosshair,
  Database,
  LayoutDashboard,
  LogOut,
  PenLine,
  Route,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import * as icons from "lucide-react";

export type NavArea = { slug: string; name: string; icon: string | null };

/**
 * `mobile` = có mặt ở thanh dưới trên điện thoại.
 *
 * Bảy mục nhét vào thanh dưới là mỗi mục còn ~53px trên iPhone SE — bấm trượt
 * liên tục. PLAN §6 nói thanh dưới chỉ nên có vài mục quan trọng nhất, nên chỉ
 * giữ đúng vòng lặp hằng ngày và hằng tuần. Ba mục còn lại vẫn vào được từ
 * Hôm nay, và trên máy tính thì hiện đủ cả.
 */
const MAIN = [
  { href: "/os", label: "Hôm nay", icon: LayoutDashboard, mobile: true },
  { href: "/os/log", label: "Nhật ký", icon: CalendarCheck, mobile: true },
  { href: "/os/calendar", label: "Lịch", icon: CalendarDays, mobile: true },
  { href: "/os/focus", label: "Focus", icon: Crosshair, mobile: true },
  { href: "/os/money", label: "Tiền", icon: Wallet, mobile: false },
  { href: "/os/goals", label: "Muốn hướng tới", icon: Target, mobile: false },
  { href: "/os/journey", label: "Hành trình", icon: Route, mobile: false },
  { href: "/os/write", label: "Viết", icon: PenLine, mobile: false },
];

/** Lấy icon theo tên lưu trong database; không tìm thấy thì dùng dấu chấm tròn. */
function areaIcon(name: string | null): LucideIcon {
  if (!name) return icons.Circle;
  const found = (icons as unknown as Record<string, LucideIcon>)[name];
  return found ?? icons.Circle;
}

export function OsNav({ areas }: { areas: NavArea[] }) {
  const pathname = usePathname();

  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh(); // xóa cache router, nếu không /os vẫn hiện từ bộ nhớ đệm
  };

  const link = (
    href: string,
    label: string,
    Icon: LucideIcon,
    key: string,
  ) => {
    const on = pathname === href;
    return (
      <li key={key}>
        <Link
          href={href}
          className={`flex items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-1.5 text-[14px] transition-colors ${
            on
              ? "bg-surface-2 font-medium text-ink"
              : "text-ink-2 hover:bg-surface hover:text-ink"
          }`}
        >
          <Icon size={15} strokeWidth={1.75} />
          {label}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Desktop */}
      <nav className="hidden shrink-0 md:block md:w-48">
        <div className="sticky top-8 space-y-6">
          <ul className="space-y-0.5">
            {MAIN.map((m) => link(m.href, m.label, m.icon, m.href))}
          </ul>

          <div>
            <div className="mb-1.5 px-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">
              Lĩnh vực
            </div>
            <ul className="space-y-0.5">
              {areas.map((a) =>
                link(`/os/a/${a.slug}`, a.name, areaIcon(a.icon), a.slug),
              )}
            </ul>
          </div>

          {/* Dưới cùng, chữ nhỏ, KHÔNG vào thanh dưới của điện thoại: quản lý
              lĩnh vực và tải sao lưu là việc vài lần một năm. Trước đây /os/data
              không có link nào trỏ tới — trang mồ côi, chỉ vào được bằng cách
              tự gõ địa chỉ. */}
          <div className="space-y-1 border-t border-line-soft pt-3">
            <Link
              href="/os/data"
              className={`flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] transition-colors ${
                pathname === "/os/data"
                  ? "font-medium text-ink"
                  : "text-ink-3 hover:text-ink"
              }`}
            >
              <Database size={14} strokeWidth={1.75} />
              Dữ liệu &amp; lĩnh vực
            </Link>

            <Link
              href="/os/huong-dan"
              className={`flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] transition-colors ${
                pathname === "/os/huong-dan"
                  ? "font-medium text-ink"
                  : "text-ink-3 hover:text-ink"
              }`}
            >
              <BookOpen size={14} strokeWidth={1.75} />
              Hướng dẫn sử dụng
            </Link>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-ink-3 transition-colors hover:text-ink"
            >
              <LogOut size={14} strokeWidth={1.75} />
              Đăng xuất
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile: chỉ vòng lặp hằng ngày/hằng tuần, lĩnh vực vào qua Hôm nay */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg/95 backdrop-blur md:hidden">
        <ul className="flex">
          {MAIN.filter((m) => m.mobile).map(({ href, label, icon: Icon }) => {
            const on = pathname === href;
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${
                    on ? "text-ink" : "text-ink-3"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.75} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
