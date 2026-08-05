import Link from "next/link";

/** Nhãn micro của PLAN §4.2 — uppercase, 12px, tracking rộng. */
export function SectionHeading({
  label,
  href,
  hrefLabel = "Xem tất cả",
}: {
  label: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-baseline justify-between border-b border-line-soft pb-3">
      <h2 className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
        {label}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-[13px] text-ink-2 transition-colors hover:text-ink"
        >
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}
