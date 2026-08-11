"use client";

import { useRef, useState } from "react";
import type { DayTask } from "@prisma/client";
import { Check, CopyPlus, Plus, X } from "lucide-react";
import {
  createDayTask,
  deleteDayTask,
  moveUndoneTasks,
  repeatTask,
  toggleDayTask,
} from "@/lib/os/dayActions";
import { weekdayVN } from "@/lib/os/day";

/**
 * «Hôm nay làm gì» — danh sách việc của ĐÚNG MỘT NGÀY.
 *
 * Mục đích của cả mục này: sáng dậy mở /os là biết phải làm gì, không phải
 * ngồi nghĩ. Muốn vậy thì việc phải được viết từ **tối hôm trước**, lúc còn
 * nhớ hôm nay học tới đâu — nên có tab «Ngày mai» ngay cạnh, và cái viết vào
 * đó sáng mai tự nằm ở tab «Hôm nay» (`DayTask.date` là ngày phải làm, không
 * phải ngày viết).
 *
 * Việc chưa xong của hôm qua hiện thành một dòng nhắc kèm nút dời sang hôm
 * nay — không có nó thì việc bỏ dở nằm lại ngày cũ và không ai nhìn lại nữa.
 */
export function DayPlan({
  todayISO: today,
  tomorrowISO: tomorrow,
  todayTasks,
  tomorrowTasks,
  yesterdayISO,
  yesterdayUndone,
}: {
  todayISO: string;
  tomorrowISO: string;
  todayTasks: DayTask[];
  tomorrowTasks: DayTask[];
  yesterdayISO: string;
  yesterdayUndone: number;
}) {
  const [tab, setTab] = useState<"today" | "tomorrow">("today");

  const iso = tab === "today" ? today : tomorrow;
  const tasks = tab === "today" ? todayTasks : tomorrowTasks;
  const done = tasks.filter((t) => t.done).length;

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          {(
            [
              ["today", "Hôm nay", todayTasks.length],
              ["tomorrow", "Ngày mai", tomorrowTasks.length],
            ] as const
          ).map(([key, label, n]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={key === tab}
              className={`rounded-[var(--radius-sm)] px-2.5 py-1 text-[13px] transition-colors ${
                key === tab
                  ? "bg-ink text-bg"
                  : "text-ink-2 hover:bg-surface-2 hover:text-ink"
              }`}
            >
              {label}
              {n > 0 && <span className="ml-1.5 tabular-nums opacity-70">{n}</span>}
            </button>
          ))}
        </div>
        {tasks.length > 0 && (
          <span className="text-[12px] tabular-nums text-ink-3">
            {done}/{tasks.length} xong
          </span>
        )}
      </div>

      <div className="rounded-[var(--radius-lg)] border border-line p-2">
        {tasks.length === 0 ? (
          <p className="px-2 py-3 text-[14px] leading-relaxed text-ink-3">
            {tab === "today"
              ? "Hôm nay chưa có việc nào. Viết ngay, hoặc tối nay viết cho ngày mai."
              : "Viết trước cho mai — sáng dậy khỏi phải nghĩ. Ví dụ: «ôn lại bài 2, 3», «từ vựng bài 5»."}
          </p>
        ) : (
          <ul>
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-1">
                <form action={toggleDayTask.bind(null, t.id)} className="min-w-0 flex-1">
                  <button
                    type="submit"
                    aria-pressed={t.done}
                    className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2 py-2.5 text-left transition-colors hover:bg-surface"
                  >
                    <span
                      /* Viền `ink-3` chứ không phải `line` — xem chú thích
                         cùng loại ở TodayPanel.tsx. */
                      className={`flex size-[22px] shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-colors ${
                        t.done ? "border-ink bg-ink text-bg" : "border-ink-3 bg-bg"
                      }`}
                    >
                      {t.done && <Check size={14} strokeWidth={3} />}
                    </span>
                    <span
                      className={`min-w-0 text-[15px] leading-snug ${
                        t.done ? "text-ink-3 line-through" : "text-ink"
                      }`}
                    >
                      {t.title}
                    </span>
                  </button>
                </form>
                {/* Lặp lại việc này sang ngày mai. Chỉ ở tab «Hôm nay»: đứng
                    ở tab «Ngày mai» mà lặp thì đích là ngày kia — một ngày
                    không nhìn thấy được ở đây, bấm xong không biết chuyện gì
                    đã xảy ra. Bấm hai lần không nhân đôi (chặn ở server). */}
                {tab === "today" && (
                  <form action={repeatTask.bind(null, t.id, tomorrow)}>
                    <button
                      type="submit"
                      aria-label={`Lặp lại cho ngày mai: ${t.title}`}
                      title="Lặp lại cho ngày mai"
                      className="rounded-[var(--radius-sm)] p-1.5 text-ink-3 transition-colors hover:bg-surface hover:text-ink"
                    >
                      <CopyPlus size={15} strokeWidth={1.75} />
                    </button>
                  </form>
                )}
                <form action={deleteDayTask.bind(null, t.id)}>
                  <button
                    type="submit"
                    aria-label={`Xóa: ${t.title}`}
                    title="Xóa"
                    className="rounded-[var(--radius-sm)] p-1.5 text-ink-3 transition-colors hover:bg-surface hover:text-ink"
                  >
                    <X size={15} strokeWidth={1.75} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <AddTask iso={iso} />
      </div>

      {tab === "today" && yesterdayUndone > 0 && (
        <form
          action={moveUndoneTasks.bind(null, yesterdayISO, today)}
          className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[var(--radius-md)] border border-line bg-surface px-4 py-3"
        >
          <span className="text-[14px] leading-relaxed text-ink-2">
            {weekdayVN(yesterdayISO)} còn{" "}
            <strong className="font-medium text-ink">{yesterdayUndone} việc</strong>{" "}
            chưa xong.
          </span>
          <button
            type="submit"
            className="text-[13px] text-accent underline decoration-accent/35 underline-offset-[3px] hover:decoration-accent"
          >
            Dời sang hôm nay
          </button>
        </form>
      )}
    </section>
  );
}

/** Ô thêm việc. Gửi xong tự xóa trắng để gõ tiếp việc kế — không phải bấm lại. */
function AddTask({ iso }: { iso: string }) {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      action={async (fd) => {
        await createDayTask(iso, fd);
        ref.current?.reset();
      }}
      className="flex items-center gap-2 px-2 pb-1 pt-1"
    >
      <Plus size={15} strokeWidth={1.75} className="shrink-0 text-ink-3" />
      <input
        name="title"
        maxLength={200}
        autoComplete="off"
        placeholder="Thêm việc…"
        className="w-full bg-transparent py-1.5 text-[15px] outline-none placeholder:text-ink-3"
      />
    </form>
  );
}
