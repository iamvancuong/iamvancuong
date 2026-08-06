import Link from "next/link";
import { Check } from "lucide-react";
import type { DailyLog } from "@prisma/client";
import { toggleKeystone } from "@/lib/os/dayActions";
import { buildingTooMuch, weekStats } from "@/lib/os/stats";
import { fmtH } from "@/lib/os/day";

/** Ba việc nền tảng + cảnh báo tuần. Tick ngay tại đây, không phải mở trang khác. */
export function TodayPanel({
  iso,
  log,
  logs,
}: {
  iso: string;
  log: DailyLog | null;
  logs: DailyLog[];
}) {
  const week = weekStats(logs);

  const rows = [
    { field: "kSleep", label: "Ngủ trước 00:00", on: !!log?.kSleep, hint: undefined as string | undefined },
    {
      field: "kJapanese",
      label: "Tiếng Nhật ≥ 60 phút",
      on: !!log?.kJapanese,
      hint: log?.jpMin ? `Đã ghi ${fmtH(log.jpMin)}` : undefined,
    },
    { field: "kEat", label: "Ăn đủ 3 bữa", on: !!log?.kEat, hint: undefined },
  ] as const;

  return (
    <section>
      <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
        Ba việc nền tảng
      </h2>

      <div className="rounded-[var(--radius-lg)] border border-line p-2">
        {rows.map((r) => (
          <ToggleRow key={r.field} iso={iso} field={r.field} label={r.label} hint={r.hint} on={r.on} />
        ))}
        <div className="my-1 border-t border-line-soft" />
        <ToggleRow
          iso={iso}
          field="workout"
          label="Tập luyện"
          hint={`${week.workouts}/3 buổi tuần này`}
          on={!!log?.workout}
        />
      </div>

      {buildingTooMuch(week) && (
        <p className="mt-3 rounded-[var(--radius-md)] border border-line bg-surface px-4 py-3 text-[14px] leading-relaxed">
          <strong className="font-medium">
            Bạn đang xây hệ thống thay vì dùng hệ thống.
          </strong>{" "}
          <span className="text-ink-2">
            Tuần này xây web {fmtH(week.webMin)} · Tiếng Nhật {fmtH(week.jpMin)}.
            Xây công cụ để quản lý việc học không phải là học.
          </span>
        </p>
      )}

      <Link
        href={`/os/log/${iso}`}
        className="mt-3 inline-block text-[14px] text-accent underline decoration-accent/35 underline-offset-[3px] hover:decoration-accent"
      >
        Ghi nhật ký hôm nay →
      </Link>
    </section>
  );
}

function ToggleRow({
  iso,
  field,
  label,
  hint,
  on,
}: {
  iso: string;
  field: "kSleep" | "kJapanese" | "kEat" | "workout";
  label: string;
  hint?: string;
  on: boolean;
}) {
  return (
    <form action={toggleKeystone.bind(null, iso, field)}>
      <button
        type="submit"
        aria-pressed={on}
        className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2 py-2.5 text-left transition-colors hover:bg-surface"
      >
        <span
          className={`flex size-[22px] shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-colors ${
            on ? "border-ink bg-ink text-white" : "border-line bg-bg"
          }`}
        >
          {on && <Check size={14} strokeWidth={3} />}
        </span>
        <span className="min-w-0">
          <span
            className={`block text-[15px] leading-snug ${
              on ? "text-ink-3 line-through" : "text-ink"
            }`}
          >
            {label}
          </span>
          {hint && <span className="block text-[12px] text-ink-3">{hint}</span>}
        </span>
      </button>
    </form>
  );
}
