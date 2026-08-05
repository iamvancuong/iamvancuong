import { type ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[var(--radius-sm)] border border-line-soft bg-surface px-2 py-0.5 text-[12px] font-medium text-ink-2">
      {children}
    </span>
  );
}
