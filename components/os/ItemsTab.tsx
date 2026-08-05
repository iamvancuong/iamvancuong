import { ItemStatus, type Item } from "@prisma/client";
import { X } from "lucide-react";
import {
  createItem,
  deleteItem,
  setItemStatus,
  setItemVerdict,
  updateItem,
} from "@/lib/os/actions";
import {
  ConfirmButton,
  EmptyNote,
  MicroLabel,
  SubmitButton,
  inputCls,
  inputSmCls,
} from "./formBits";
import { Disclosure } from "./Disclosure";

/**
 * Bảng ba cột: đang dùng · muốn thử · đã bỏ.
 *
 * Trước đây ba trạng thái xếp chồng dọc, muốn so "cái này đang dùng, cái kia
 * đã bỏ" thì phải cuộn. Ba cột cạnh nhau thì nhìn một cái là thấy toàn cảnh.
 *
 * **Cố ý KHÔNG làm kéo–thả.** Kéo–thả trông hợp lý cho ba cột, nhưng: HTML5
 * drag không chạy trên cảm ứng mà Life OS là mobile-first (PLAN §6, §14.4);
 * làm cho chạy trên cảm ứng phải thêm thư viện, trong khi dự án đang có đúng
 * 0 dependency giao diện; và người ta đổi trạng thái một món chừng một tháng
 * một lần — PLAN §14.3: "build mất 3 ngày mà chỉ tiết kiệm 30 giây/ngày thì
 * không build". Một chạm vào nút là đủ, và dùng được cả bằng bàn phím.
 */

const LABEL: Record<ItemStatus, string> = {
  USING: "Đang dùng",
  WANT: "Muốn thử",
  DROPPED: "Đã bỏ",
};

/** Bấm để chuyển sang trạng thái nào — chữ viết theo góc nhìn hành động. */
const MOVE: Record<ItemStatus, string> = {
  USING: "→ đang dùng",
  WANT: "→ muốn thử",
  DROPPED: "→ đã bỏ",
};

const COLUMNS: ItemStatus[] = [
  ItemStatus.USING,
  ItemStatus.WANT,
  ItemStatus.DROPPED,
];

function fmt(d: Date | null) {
  if (!d) return null;
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

const yen = (n: number) => `¥${n.toLocaleString("vi-VN")}`;

export function ItemsTab({ slug, items }: { slug: string; items: Item[] }) {
  // Tiền đã bỏ ra cho những thứ rốt cuộc không dùng. Con số này khó chịu đúng
  // theo cách có ích: nó là lý do để lần sau đọc ô kết luận trước khi mua.
  const wasted = items
    .filter((i) => i.status === ItemStatus.DROPPED)
    .reduce((s, i) => s + (i.cost ?? 0), 0);

  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <EmptyNote>
          Chưa ghi thứ gì. Ghi cả thứ đã bỏ nữa — sáu tháng sau nhìn lại sẽ biết
          mình đã thử gì rồi, khỏi mua lại thứ từng vô dụng.
        </EmptyNote>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((status) => {
            const list = items.filter((i) => i.status === status);
            return (
              <section key={status} className="min-w-0">
                <div className="mb-2 flex flex-wrap items-baseline gap-x-2 border-b border-line-soft pb-2">
                  <MicroLabel>{LABEL[status]}</MicroLabel>
                  <span className="text-[12px] tabular-nums text-ink-3">
                    {list.length}
                  </span>
                  {status === ItemStatus.DROPPED && wasted > 0 && (
                    <span className="text-[12px] text-ink-3">
                      · đã tiêu {yen(wasted)}
                    </span>
                  )}
                </div>

                {list.length === 0 ? (
                  <p className="px-1 py-2 text-[13px] text-ink-3">Trống.</p>
                ) : (
                  <ul className="space-y-2">
                    {list.map((it) => (
                      <li key={it.id}>
                        <ItemCard item={it} slug={slug} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      <Disclosure label="+ Thêm một thứ">
        <form
          action={createItem.bind(null, slug)}
          className="space-y-2 rounded-[var(--radius-lg)] border border-line p-3"
        >
          <input
            name="name"
            required
            placeholder="Tên sản phẩm / tài liệu / công cụ"
            className={inputCls}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              name="kind"
              placeholder="loại — skincare, tóc, sách…"
              aria-label="Loại"
              className={inputSmCls}
            />
            <input
              name="cost"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="giá ¥"
              aria-label="Giá bằng yên"
              className={inputSmCls}
            />
            <select
              name="status"
              defaultValue={ItemStatus.USING}
              aria-label="Trạng thái"
              className="rounded-[var(--radius-sm)] border border-line bg-bg px-3 py-2 text-[14px] outline-none focus:border-ink-3"
            >
              {COLUMNS.map((s) => (
                <option key={s} value={s}>
                  {LABEL[s]}
                </option>
              ))}
            </select>
            <SubmitButton>Thêm</SubmitButton>
          </div>
        </form>
      </Disclosure>
    </div>
  );
}

function ItemCard({ item: it, slug }: { item: Item; slug: string }) {
  const meta = [
    it.kind,
    it.cost != null ? yen(it.cost) : null,
    fmt(it.startedAt) &&
      (it.endedAt
        ? `${fmt(it.startedAt)} – ${fmt(it.endedAt)}`
        : `từ ${fmt(it.startedAt)}`),
  ].filter(Boolean);

  // Hai trạng thái CÒN LẠI — mỗi cái một nút, bấm là chuyển.
  const others = COLUMNS.filter((s) => s !== it.status);

  return (
    <div
      className={`rounded-[var(--radius-md)] border border-line p-3 transition-colors hover:border-ink-3 ${
        it.status === ItemStatus.DROPPED ? "bg-surface" : ""
      }`}
    >
      <div
        className={`text-[14px] font-medium leading-snug ${
          it.status === ItemStatus.DROPPED ? "text-ink-2" : ""
        }`}
      >
        {it.name}
      </div>

      {meta.length > 0 && (
        <div className="mt-0.5 text-[12px] text-ink-3">{meta.join(" · ")}</div>
      )}

      {/* Kết luận chỉ chiếm chỗ khi ĐÃ có nội dung. Trước đây ô nhập luôn hiện
          dù rỗng, tạo một cột hộp trắng chạy dọc trang. */}
      {it.verdict ? (
        <p className="mt-2 border-l-2 border-line pl-2 text-[13px] leading-relaxed text-ink-2">
          {it.verdict}
        </p>
      ) : (
        <Disclosure label="+ ghi kết luận" small>
          <form
            action={setItemVerdict.bind(null, it.id, slug)}
            className="flex gap-2"
          >
            <input
              name="verdict"
              placeholder="Có tác dụng không? Có dùng lại không?"
              aria-label={`Kết luận về ${it.name}`}
              className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line bg-bg px-2.5 py-1.5 text-[13px] outline-none focus:border-ink-3"
            />
            <SubmitButton variant="quiet" pendingLabel="…">
              lưu
            </SubmitButton>
          </form>
        </Disclosure>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {others.map((s) => (
          <form key={s} action={setItemStatus.bind(null, it.id, s, slug)}>
            <button
              type="submit"
              className="rounded-[var(--radius-sm)] border border-line px-2 py-1 text-[12px] text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
            >
              {MOVE[s]}
            </button>
          </form>
        ))}
      </div>

      <Disclosure label="Sửa" small>
        {/* Xóa phải là form RIÊNG, đặt cạnh chứ không lồng trong: HTML không
            cho form lồng nhau, và một nút submit nằm trong form sửa thì bấm
            vào sẽ chạy nhầm hành động sửa. */}
        <div className="space-y-2 rounded-[var(--radius-md)] border border-line p-2.5">
          <form
            action={updateItem.bind(null, it.id, slug)}
            className="space-y-2"
          >
            <input
              name="name"
              required
              defaultValue={it.name}
              placeholder="Tên"
              aria-label="Tên"
              className={inputSmCls}
            />
            <div className="flex gap-2">
              <input
                name="kind"
                defaultValue={it.kind ?? ""}
                placeholder="loại"
                aria-label="Loại"
                className={inputSmCls}
              />
              <input
                name="cost"
                type="number"
                min={0}
                inputMode="numeric"
                defaultValue={it.cost ?? ""}
                placeholder="giá ¥"
                aria-label="Giá bằng yên"
                className={inputSmCls}
              />
            </div>
            <input
              name="verdict"
              defaultValue={it.verdict ?? ""}
              placeholder="Kết luận"
              aria-label="Kết luận"
              className={inputSmCls}
            />
            <textarea
              name="note"
              rows={2}
              defaultValue={it.note ?? ""}
              placeholder="Ghi chú dài hơn (không bắt buộc)"
              aria-label="Ghi chú"
              className="w-full resize-y rounded-[var(--radius-sm)] border border-line bg-bg px-2.5 py-1.5 text-[13px] leading-relaxed outline-none focus:border-ink-3"
            />
            <div className="flex justify-end">
              <SubmitButton>Lưu</SubmitButton>
            </div>
          </form>

          <form
            action={deleteItem.bind(null, it.id, slug)}
            className="border-t border-line-soft pt-2"
          >
            <ConfirmButton
              label={`Xóa: ${it.name}`}
              confirm={`Xóa "${it.name}"? Kết luận đã ghi cũng mất theo.`}
              className="flex items-center gap-1 text-[12px] text-ink-3 hover:text-down"
            >
              <X size={12} strokeWidth={2} />
              Xóa món này
            </ConfirmButton>
          </form>
        </div>
      </Disclosure>

      {it.note && (
        <p className="mt-2 text-[12px] leading-relaxed text-ink-3">{it.note}</p>
      )}
    </div>
  );
}
