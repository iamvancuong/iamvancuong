import type { Metadata } from "next";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { FocusStatus } from "@prisma/client";
import { db } from "@/lib/db";
import {
  createFocusItem,
  deleteFocusItem,
  moveFocusItem,
  reorderFocusItem,
  updateFocusItem,
} from "@/lib/os/dayActions";
import { MAX_NOW } from "@/lib/os/constants";
import { ConfirmButton, SubmitButton, inputSmCls } from "@/components/os/formBits";
import { Disclosure } from "@/components/os/Disclosure";

export const metadata: Metadata = { title: "Focus" };

const STATUSES: { key: FocusStatus; hint: string }[] = [
  { key: FocusStatus.NOW, hint: `Đang tập trung — tối đa ${MAX_NOW}` },
  { key: FocusStatus.NEXT, hint: "Quan trọng nhưng chưa tới lượt" },
  { key: FocusStatus.LATER, hint: "Để sau, không phải bây giờ" },
  { key: FocusStatus.NO, hint: "Chủ động không làm" },
];

type Area = { id: string; name: string };

export default async function FocusPage({
  searchParams,
}: PageProps<"/os/focus">) {
  const sp = await searchParams;
  const err = Array.isArray(sp.err) ? sp.err[0] : sp.err;

  const [items, areas] = await Promise.all([
    db.focusItem.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    db.area.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const areaName = new Map(areas.map((a) => [a.id, a.name]));
  const nowCount = items.filter((i) => i.status === FocusStatus.NOW).length;

  return (
    <div className="max-w-[760px] space-y-10">
      <header className="border-b border-line pb-5">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Focus</h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">
          Nơi duy nhất chứa mọi thứ bạn định làm. NOW tối đa {MAX_NOW} việc —
          không nới.
        </p>
      </header>

      {err === "now-full" && (
        <p className="rounded-[var(--radius-md)] border border-line bg-surface px-4 py-3 text-[14px] leading-relaxed text-down">
          NOW đã đủ {MAX_NOW} việc. Muốn thêm việc này thì phải đẩy một việc
          đang có xuống NEXT trước.
        </p>
      )}

      <form
        action={createFocusItem}
        className="space-y-2 rounded-[var(--radius-lg)] border border-line p-3"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            name="title"
            required
            placeholder="Việc gì?"
            className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line px-3 py-2 text-[15px] outline-none focus:border-ink-3"
          />
          <AreaSelect areas={areas} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            name="why"
            placeholder="Vì sao việc này quan trọng? (không bắt buộc)"
            aria-label="Vì sao việc này quan trọng"
            className={inputSmCls}
          />
          <SubmitButton>Thêm vào NEXT</SubmitButton>
        </div>
      </form>

      {STATUSES.map(({ key, hint }) => {
        const list = items.filter((i) => i.status === key);
        return (
          <section key={key}>
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3 border-b border-line-soft pb-2">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em]">
                {key}
              </h2>
              <span className="text-[12px] text-ink-3">
                {key === FocusStatus.NOW
                  ? `${nowCount}/${MAX_NOW}`
                  : list.length}{" "}
                · {hint}
              </span>
            </div>

            {list.length === 0 ? (
              <p className="px-1 text-[14px] text-ink-3">Trống.</p>
            ) : (
              <ul className="divide-y divide-line-soft">
                {list.map((f, i) => (
                  <li key={f.id} className="flex items-start gap-2 py-3">
                    {/* Thứ tự trong NOW là thứ tự ưu tiên thật, không phải thứ
                        tự tình cờ lúc tạo. Hai nút thay vì kéo thả: dùng được
                        bằng bàn phím và không cần thêm thư viện. */}
                    <div className="flex shrink-0 flex-col pt-0.5">
                      <ReorderButton
                        id={f.id}
                        dir="up"
                        disabled={i === 0}
                        title={f.title}
                      />
                      <ReorderButton
                        id={f.id}
                        dir="down"
                        disabled={i === list.length - 1}
                        title={f.title}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-[15px] leading-snug ${
                          key === FocusStatus.NO ? "text-ink-3 line-through" : ""
                        }`}
                      >
                        {f.title}
                      </div>
                      {(f.areaId || f.why) && (
                        <div className="mt-0.5 text-[12px] text-ink-3">
                          {[f.areaId ? areaName.get(f.areaId) : null, f.why]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      )}

                      <Disclosure label="Sửa" small>
                        <form
                          action={updateFocusItem.bind(null, f.id)}
                          className="space-y-2 rounded-[var(--radius-lg)] border border-line p-3"
                        >
                          <input
                            name="title"
                            required
                            defaultValue={f.title}
                            placeholder="Việc gì?"
                            aria-label="Việc gì"
                            className={inputSmCls}
                          />
                          <input
                            name="why"
                            defaultValue={f.why ?? ""}
                            placeholder="Vì sao việc này quan trọng?"
                            aria-label="Vì sao việc này quan trọng"
                            className={inputSmCls}
                          />
                          <div className="flex flex-wrap justify-end gap-2">
                            <AreaSelect areas={areas} value={f.areaId} />
                            <SubmitButton>Lưu</SubmitButton>
                          </div>
                        </form>
                      </Disclosure>
                    </div>

                    <form
                      action={moveFocusItem.bind(null, f.id)}
                      className="flex shrink-0 items-center gap-1"
                    >
                      <select
                        name="status"
                        defaultValue={f.status}
                        aria-label={`Chuyển "${f.title}" sang cột khác`}
                        className="rounded-[var(--radius-sm)] border border-line bg-bg px-2 py-1 text-[12px] outline-none focus:border-ink-3"
                      >
                        {STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.key}
                          </option>
                        ))}
                      </select>
                      <SubmitButton variant="quiet" pendingLabel="…">
                        đổi
                      </SubmitButton>
                    </form>

                    <form action={deleteFocusItem.bind(null, f.id)}>
                      <ConfirmButton
                        label={`Xóa: ${f.title}`}
                        confirm={`Xóa "${f.title}"? Nếu chỉ là chưa làm bây giờ thì chuyển sang LATER hoặc NO sẽ đúng hơn.`}
                        className="p-1 text-ink-3 hover:text-down"
                      >
                        <X size={15} strokeWidth={2} />
                      </ConfirmButton>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <p className="border-t border-line pt-6 text-[13px] leading-relaxed text-ink-3">
        Cột <strong className="font-medium text-ink-2">NO</strong> là cột có giá
        trị nhất ở đây. Nó không phải chỗ chứa rác — nó là bằng chứng rằng bạn
        đã cân nhắc một việc rồi chủ động quyết định không làm. Mỗi dòng trong
        NO là một thứ không còn chiếm chỗ trong đầu bạn nữa.
      </p>
    </div>
  );
}

function AreaSelect({ areas, value }: { areas: Area[]; value?: string | null }) {
  return (
    <select
      name="areaId"
      defaultValue={value ?? ""}
      aria-label="Lĩnh vực"
      className="rounded-[var(--radius-sm)] border border-line bg-bg px-3 py-2 text-[14px] outline-none focus:border-ink-3"
    >
      <option value="">Không thuộc lĩnh vực nào</option>
      {areas.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </select>
  );
}

function ReorderButton({
  id,
  dir,
  disabled,
  title,
}: {
  id: string;
  dir: "up" | "down";
  disabled: boolean;
  title: string;
}) {
  // Giữ chỗ thay vì nút mờ: dòng không xê dịch khi ở đầu/cuối cột.
  if (disabled) return <span className="block size-5" aria-hidden />;

  const Icon = dir === "up" ? ChevronUp : ChevronDown;
  const label = `Đưa "${title}" lên ${dir === "up" ? "trên" : "dưới"}`;

  return (
    <form action={reorderFocusItem.bind(null, id, dir)}>
      <button
        type="submit"
        aria-label={label}
        title={label}
        className="flex size-5 items-center justify-center text-ink-3 transition-colors hover:text-ink"
      >
        <Icon size={14} strokeWidth={2} />
      </button>
    </form>
  );
}
