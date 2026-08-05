import { MetricDirection, type Metric, type MetricEntry } from "@prisma/client";
import { ArrowDown, ArrowUp, Minus, X } from "lucide-react";
import { fmtDateVN, isoUTC, todayISO } from "@/lib/os/day";
import {
  addMetricEntry,
  createMetric,
  deleteMetric,
  deleteMetricEntry,
  updateMetric,
} from "@/lib/os/metricActions";
import {
  ConfirmButton,
  EmptyNote,
  MicroLabel,
  SubmitButton,
  inputCls,
  inputSmCls,
} from "./formBits";
import { Disclosure } from "./Disclosure";
import { Sparkline } from "./Sparkline";

export type MetricWithEntries = Metric & { entries: MetricEntry[] };

/**
 * Số đo — chỗ ghi con số thật của một lĩnh vực.
 *
 * PLAN §9: neo vào thứ đo được thật (điểm thang JLPT 60/60/60), đừng dùng
 * "Vocabulary 72%" — phần trăm của cái gì thì không ai biết. Tab này tồn tại
 * để con số thật đó có chỗ ở.
 *
 * Cùng một bộ code phục vụ điểm mock test, cân nặng, chi tiêu tháng — vì cả
 * ba đều là "một con số ghi lại theo thời gian" (OS-DESIGN §1).
 */
/** Nhãn của số đo chưa đặt nhóm. Luôn xếp cuối, sau mọi nhóm có tên. */
const UNGROUPED = "Chưa phân nhóm";

/**
 * Gom theo `group`, giữ nguyên thứ tự nhóm xuất hiện lần đầu.
 *
 * `Array.sort` ổn định nên chỉ cần đẩy nhóm không tên xuống cuối, phần còn lại
 * tự giữ thứ tự `order` mà trang lĩnh vực đã sắp.
 */
function byGroup(metrics: MetricWithEntries[]) {
  const map = new Map<string, MetricWithEntries[]>();
  for (const m of metrics) {
    const key = m.group?.trim() || UNGROUPED;
    const bucket = map.get(key);
    if (bucket) bucket.push(m);
    else map.set(key, [m]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a === UNGROUPED ? 1 : b === UNGROUPED ? -1 : 0))
    .map(([title, items]) => ({ title, items }));
}

/**
 * Danh sách gợi ý cho ô nhóm, dùng chung một `<datalist>` cho mọi form trên
 * trang. Đây là thứ bù lại nhược điểm của chuỗi tự do: gõ "JLPT" lần thứ hai
 * thì trình duyệt tự gợi ý, đỡ đẻ ra nhóm trùng vì sai chính tả.
 */
const GROUP_LIST_ID = "metric-groups";

export function MetricsTab({
  slug,
  metrics,
}: {
  slug: string;
  metrics: MetricWithEntries[];
}) {
  const groups = byGroup(metrics);
  const names = [...new Set(metrics.map((m) => m.group?.trim()).filter(Boolean))];

  return (
    <div className="space-y-8">
      <datalist id={GROUP_LIST_ID}>
        {names.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      {metrics.length === 0 ? (
        <EmptyNote>
          Chưa đo gì ở đây — chưa cần thiết. Chỉ thêm khi có con số bạn thật sự
          muốn theo dõi: <em>điểm mock N3</em> · <em>cân nặng</em> ·{" "}
          <em>chi tiêu tháng</em>. Đừng đo thứ mình không định thay đổi.
        </EmptyNote>
      ) : (
        <>
          {/* Nói MỘT lần cho cả tab. Trước đây câu này in lại trên từng thẻ —
              tới số đo thứ mười thì đó là mười bản cùng một câu. */}
          <p className="text-[12px] leading-relaxed text-ink-3">
            Ghi lại cùng một ngày là đè lên giá trị cũ, không tạo dòng thứ hai.
          </p>

          <div className="space-y-10">
            {groups.map((g) => (
              <section key={g.title}>
                {/* Một nhóm duy nhất thì tiêu đề chỉ là tiếng ồn */}
                {groups.length > 1 && (
                  <h3 className="mb-3 border-b border-line-soft pb-2">
                    <MicroLabel>{g.title}</MicroLabel>
                  </h3>
                )}
                {/* Hai cột chỉ bật từ `xl`, không phải `md`.
                    Cột nội dung của /os = khung 1280 − thanh bên 192 − khoảng
                    cách 40 − đệm 64 = 984px. Chia đôi là 484px/thẻ, vừa đủ cho
                    hàng ghi nhanh nằm gọn một dòng. Ở `md` (768px) cột nội dung
                    chỉ còn 472px, chia đôi thành 228px — chật đến mức vô dụng.
                    Dưới xl thì xếp hàng dọc, thẻ nào cũng đủ rộng. */}
                <ul className="grid items-start gap-4 xl:grid-cols-2">
                  {g.items.map((m) => (
                    <li key={m.id}>
                      <MetricCard metric={m} slug={slug} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}

      <Disclosure label="+ Thêm số đo">
        <form
          action={createMetric.bind(null, slug)}
          className="space-y-2 rounded-[var(--radius-lg)] border border-line p-3"
        >
          <MetricFields />
          <div className="flex justify-end">
            <SubmitButton>Thêm số đo</SubmitButton>
          </div>
        </form>
      </Disclosure>
    </div>
  );
}

/** Số gọn: bỏ ",0" thừa nhưng giữ phần lẻ khi có (57,5 kg). */
function fmtVal(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
}

function MetricCard({
  metric: m,
  slug,
}: {
  metric: MetricWithEntries;
  slug: string;
}) {
  // Prisma trả cũ → mới (orderBy date asc ở trang lĩnh vực)
  const entries = m.entries;
  const last = entries.at(-1);
  const prev = entries.at(-2);

  const delta = last && prev ? last.value - prev.value : null;
  const better =
    delta == null || delta === 0
      ? null
      : m.direction === MetricDirection.UP
        ? delta > 0
        : delta < 0;

  const Arrow = delta == null || delta === 0 ? Minus : delta > 0 ? ArrowUp : ArrowDown;

  return (
    <section className="rounded-[var(--radius-lg)] border border-line p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <h3 className="text-[15px] font-medium leading-snug">{m.name}</h3>
          <div className="mt-0.5 text-[12px] text-ink-3">
            {[
              m.target ? `đích ${m.target}` : null,
              m.direction === MetricDirection.UP
                ? "càng cao càng tốt"
                : "càng thấp càng tốt",
              `${entries.length} lần đo`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>

        {last && (
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-[26px] font-semibold leading-none tabular-nums tracking-[-0.02em]">
                {fmtVal(last.value)}
              </span>
              {m.unit && (
                <span className="text-[13px] text-ink-3">{m.unit}</span>
              )}
            </div>
            <div
              className={`mt-1 flex items-center justify-end gap-0.5 text-[12px] tabular-nums ${
                better === null
                  ? "text-ink-3"
                  : better
                    ? "text-up"
                    : "text-down"
              }`}
            >
              <Arrow size={11} strokeWidth={2.5} />
              {delta != null && delta !== 0
                ? fmtVal(Math.abs(delta))
                : "chưa đổi"}
              <span className="ml-1 text-ink-3">{fmtDateVN(isoUTC(last.date))}</span>
            </div>
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <div className="mt-3">
          <Sparkline
            points={entries.map((e) => ({ iso: isoUTC(e.date), value: e.value }))}
            direction={m.direction}
          />
        </div>
      )}

      {m.note && (
        <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{m.note}</p>
      )}

      {/* Ghi nhanh — việc làm thường xuyên nhất, nên để sẵn không phải mở ra */}
      <form
        action={addMetricEntry.bind(null, m.id, slug)}
        className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3"
      >
        <input
          type="date"
          name="date"
          required
          defaultValue={todayISO()}
          aria-label="Ngày đo"
          className="rounded-[var(--radius-sm)] border border-line bg-bg px-2.5 py-1.5 text-[13px] tabular-nums outline-none focus:border-ink-3"
        />
        <input
          name="value"
          required
          inputMode="decimal"
          placeholder={m.unit ?? "giá trị"}
          aria-label="Giá trị"
          className="w-24 rounded-[var(--radius-sm)] border border-line bg-bg px-2.5 py-1.5 text-[13px] tabular-nums outline-none focus:border-ink-3"
        />
        {/* min-w-[9rem] chứ KHÔNG phải min-w-0: với min-w-0 thì flex cho ô này
            co về gần 0 khi hàng chật, và ô ghi chú teo lại còn đúng một ký tự
            thay vì xuống hàng. Có sàn thì nó tự rớt xuống dòng dưới. */}
        <input
          name="note"
          placeholder="ghi chú (không bắt buộc)"
          aria-label="Ghi chú lần đo"
          className="min-w-[9rem] flex-1 rounded-[var(--radius-sm)] border border-line bg-bg px-2.5 py-1.5 text-[13px] outline-none focus:border-ink-3"
        />
        <SubmitButton>Ghi</SubmitButton>
      </form>

      {/* MỘT ngăn kéo cho cả "các lần đo" lẫn "sửa": hai ngăn riêng ăn hai hàng
          trên mỗi thẻ, mà cả hai đều là việc thỉnh thoảng mới làm. */}
      <Disclosure
        label={
          entries.length > 0 ? `Chi tiết · ${entries.length} lần đo` : "Chi tiết"
        }
        small
      >
        <div className="space-y-3">
          {entries.length > 0 && (
            <ul className="divide-y divide-line-soft">
              {[...entries].reverse().map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2"
              >
                <span className="w-[86px] shrink-0 text-[12px] tabular-nums text-ink-3">
                  {fmtDateVN(isoUTC(e.date))}
                </span>
                <span className="text-[14px] font-medium tabular-nums">
                  {fmtVal(e.value)}
                  {m.unit && (
                    <span className="ml-0.5 font-normal text-ink-3">{m.unit}</span>
                  )}
                </span>
                {e.note && (
                  <span className="min-w-0 flex-1 text-[13px] text-ink-2">
                    {e.note}
                  </span>
                )}
                <form action={deleteMetricEntry.bind(null, e.id, slug)}>
                  <ConfirmButton
                    label={`Xóa lần đo ${fmtDateVN(isoUTC(e.date))}`}
                    confirm={`Xóa lần đo ngày ${fmtDateVN(isoUTC(e.date))}?`}
                    className="p-1 text-ink-3 hover:text-down"
                  >
                    <X size={13} strokeWidth={2} />
                  </ConfirmButton>
                </form>
              </li>
              ))}
            </ul>
          )}

          <div className="space-y-3 rounded-[var(--radius-lg)] border border-line p-3">
            <form
              action={updateMetric.bind(null, m.id, slug)}
              className="space-y-2"
            >
              <MetricFields metric={m} />
              <div className="flex justify-end">
                <SubmitButton>Lưu</SubmitButton>
              </div>
            </form>
            <form
              action={deleteMetric.bind(null, m.id, slug)}
              className="border-t border-line-soft pt-3"
            >
              <ConfirmButton
                label={`Xóa số đo ${m.name}`}
                confirm={`Xóa "${m.name}"? ${entries.length} lần đo cũng mất theo. Không hoàn tác được.`}
                className="text-[12px] text-ink-3 hover:text-down"
              >
                Xóa số đo này
              </ConfirmButton>
            </form>
          </div>
        </div>
      </Disclosure>
    </section>
  );
}

/** Dùng chung cho form thêm và form sửa — hai bên không lệch nhau được. */
function MetricFields({ metric }: { metric?: Metric }) {
  return (
    <>
      <input
        name="name"
        required
        defaultValue={metric?.name ?? ""}
        placeholder="Đo cái gì? — vd: điểm mock N3"
        className={inputCls}
      />
      {/* Chuỗi tự do + gợi ý từ các nhóm đã có trong lĩnh vực này, nên gõ
          "JLPT" lần thứ hai là trình duyệt tự đề xuất — đỡ đẻ nhóm trùng. */}
      <input
        name="group"
        list={GROUP_LIST_ID}
        defaultValue={metric?.group ?? ""}
        placeholder="nhóm — JLPT, Trên lớp, Ra thị trường (để trống cũng được)"
        aria-label="Nhóm"
        className={inputSmCls}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="unit"
          defaultValue={metric?.unit ?? ""}
          placeholder="đơn vị — /180, kg, ¥"
          aria-label="Đơn vị"
          className={inputSmCls}
        />
        <input
          name="target"
          defaultValue={metric?.target ?? ""}
          placeholder="đích — ≥ 95"
          aria-label="Đích cần tới"
          className={inputSmCls}
        />
        <select
          name="direction"
          defaultValue={metric?.direction ?? MetricDirection.UP}
          aria-label="Hướng nào là tốt"
          className="rounded-[var(--radius-sm)] border border-line bg-bg px-3 py-2 text-[14px] outline-none focus:border-ink-3"
        >
          <option value={MetricDirection.UP}>Càng cao càng tốt</option>
          <option value={MetricDirection.DOWN}>Càng thấp càng tốt</option>
        </select>
      </div>
      <input
        name="note"
        defaultValue={metric?.note ?? ""}
        placeholder="Ghi chú — đo thế nào, điểm yếu đang xử lý… (không bắt buộc)"
        aria-label="Ghi chú"
        className={inputSmCls}
      />
      <p className="text-[12px] leading-relaxed text-ink-3">
        Hướng quyết định màu của đường biểu diễn — chi tiêu tăng thì không phải
        tin vui, còn điểm thi tăng thì có.
      </p>
    </>
  );
}
