import { type ReactNode } from "react";

type Width = "site" | "prose" | "os";

const widths: Record<Width, string> = {
  site: "max-w-[var(--container-site)]",
  prose: "max-w-[var(--container-prose)]",
  os: "max-w-[var(--container-os)]",
};

/** PLAN §4.6 — không để cả site dùng chung một max-width. */
export function Container({
  children,
  width = "site",
  className = "",
}: {
  children: ReactNode;
  width?: Width;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full px-6 md:px-8 ${widths[width]} ${className}`}>
      {children}
    </div>
  );
}
