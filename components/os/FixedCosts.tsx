import { CostCycle, type FixedCost } from "@prisma/client";
import { RotateCcw } from "lucide-react";
import { isoUTC, todayISO } from "@/lib/os/day";
import { costActiveIn, fmtYen, perMonth } from "@/lib/os/money";
import {
  createFixedCost,
  deleteFixedCost,
  resumeFixedCost,
  stopFixedCost,
  updateFixedCost,
} from "@/lib/os/moneyActions";
import {
  ConfirmButton,
  EmptyNote,
  MicroLabel,
  SubmitButton,
  inputCls,
  inputSmCls,
} from "./formBits";
import { Disclosure } from "./Disclosure";

const CYCLE_LABEL: Record<CostCycle, string> = {
  MONTH: "mỗi tháng",
  YEAR: "mỗi năm",
};

/**
 * Chi phí cố định — cái sàn mỗi tháng.
 *
 * Việc thường làm ở đây không phải thêm hay xóa mà là **dừng**: hủy một gói,
 * hết hạn một hợp đồng. Nên «Dừng từ hôm nay» là nút hiện sẵn, còn xóa hẳn
 * nằm sau ngăn kéo — xóa làm mọi tháng cũ bỗng rẻ đi và lịch sử thành nói dối.
 */
export function FixedCosts({
  costs,
  thisMonth,
}: {
  costs: FixedCost[];
  /** "YYYY-MM-01" của tháng hiện tại, để biết khoản nào còn hiệu lực. */
  thisMonth: string;
}) {
  const today = todayISO();
  const active = costs.filter((c) => costActiveIn(c, thisMonth));
  const stopped = costs.filter((c) => !costActiveIn(c, thisMonth));

  return (
    <section>
      <h2 className="mb-1">
        <MicroLabel>Chi phí cố định</MicroLabel>
      </h2>
      <p className="mb-3 text-[13px] leading-relaxed text-ink-3">
        Tiền nhà · điện thoại · bảo hiểm · vé tàu tháng. Để riêng khỏi ô «Chi
        tiêu» hằng ngày vì đây không phải quyết định mỗi ngày — trộn chung thì
        phần bạn thật sự chọn được sẽ bị chôn dưới tiền nhà.
      </p>

      {active.length === 0 && stopped.length === 0 ? (
        <EmptyNote>
          Chưa khai khoản cố định nào. Chỉ cần vài dòng: tiền nhà, điện thoại,
          bảo hiểm — đủ để biết sàn mỗi tháng của mình là bao nhiêu.
        </EmptyNote>
      ) : (
        <ul className="divide-y divide-line-soft rounded-[var(--radius-lg)] border border-line">
          {[...active, ...stopped].map((c) => {
            const off = !costActiveIn(c, thisMonth);
            return (
              <li key={c.id} className="p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <div className="min-w-0">
                    <span
                      className={`text-[15px] font-medium ${off ? "text-ink-3 line-through" : ""}`}
                    >
                      {c.name}
                    </span>
                    <div className="mt-0.5 text-[12px] text-ink-3">
                      {[
                        CYCLE_LABEL[c.cycle],
                        c.cycle === CostCycle.YEAR
                          ? `≈ ${fmtYen(perMonth(c))}¥/tháng`
                          : null,
                        c.startedAt ? `từ ${isoUTC(c.startedAt)}` : null,
                        c.endedAt ? `dừng ${isoUTC(c.endedAt)}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                    {c.note && (
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
                        {c.note}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[16px] font-semibold tabular-nums ${off ? "text-ink-3" : ""}`}
                    >
                      {fmtYen(c.amount)}¥
                    </span>
                    {off ? (
                      <form action={resumeFixedCost.bind(null, c.id)}>
                        <button
                          type="submit"
                          aria-label={`Mở lại ${c.name}`}
                          title="Đang trả lại khoản này"
                          className="p-1 text-ink-3 transition-colors hover:text-ink"
                        >
                          <RotateCcw size={14} strokeWidth={1.75} />
                        </button>
                      </form>
                    ) : (
                      <form action={stopFixedCost.bind(null, c.id)}>
                        <input type="hidden" name="endedAt" value={today} />
                        <SubmitButton variant="quiet" pendingLabel="…">
                          dừng từ hôm nay
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </div>

                <Disclosure label="Sửa" small>
                  <div className="space-y-3 rounded-[var(--radius-lg)] border border-line p-3">
                    <form
                      action={updateFixedCost.bind(null, c.id)}
                      className="space-y-2"
                    >
                      <CostFields cost={c} />
                      <div className="flex justify-end">
                        <SubmitButton>Lưu</SubmitButton>
                      </div>
                    </form>
                    <form
                      action={deleteFixedCost.bind(null, c.id)}
                      className="border-t border-line-soft pt-3"
                    >
                      <ConfirmButton
                        label={`Xóa hẳn ${c.name}`}
                        confirm={`Xóa hẳn "${c.name}"? Mọi tháng đã qua sẽ tính lại như thể chưa từng có khoản này — tổng chi của chúng bỗng rẻ đi. Nếu chỉ là ngừng trả thì bấm «dừng từ hôm nay» chứ đừng xóa.`}
                        className="text-[12px] text-ink-3 hover:text-down"
                      >
                        Xóa hẳn (chỉ khi nhập nhầm)
                      </ConfirmButton>
                    </form>
                  </div>
                </Disclosure>
              </li>
            );
          })}
        </ul>
      )}

      <Disclosure label="+ Thêm khoản cố định">
        <form
          action={createFixedCost}
          className="space-y-2 rounded-[var(--radius-lg)] border border-line p-3"
        >
          <CostFields />
          <div className="flex justify-end">
            <SubmitButton>Thêm khoản</SubmitButton>
          </div>
        </form>
      </Disclosure>
    </section>
  );
}

/** Dùng chung cho form thêm và form sửa — hai bên không lệch nhau được. */
function CostFields({ cost }: { cost?: FixedCost }) {
  return (
    <>
      <input
        name="name"
        required
        defaultValue={cost?.name ?? ""}
        placeholder="Khoản gì? — vd: Tiền nhà"
        className={inputCls}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="amount"
          required
          inputMode="numeric"
          defaultValue={cost?.amount ?? ""}
          placeholder="số tiền ¥"
          aria-label="Số tiền"
          className={inputSmCls}
        />
        <select
          name="cycle"
          defaultValue={cost?.cycle ?? CostCycle.MONTH}
          aria-label="Chu kỳ"
          className="rounded-[var(--radius-sm)] border border-line bg-bg px-3 py-2 text-[14px] outline-none focus:border-ink-3"
        >
          <option value={CostCycle.MONTH}>mỗi tháng</option>
          <option value={CostCycle.YEAR}>mỗi năm</option>
        </select>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="date"
          name="startedAt"
          defaultValue={cost?.startedAt ? isoUTC(cost.startedAt) : ""}
          aria-label="Bắt đầu trả từ"
          className={inputSmCls}
        />
        <input
          type="date"
          name="endedAt"
          defaultValue={cost?.endedAt ? isoUTC(cost.endedAt) : ""}
          aria-label="Dừng trả từ"
          className={inputSmCls}
        />
      </div>
      <input
        name="note"
        defaultValue={cost?.note ?? ""}
        placeholder="ghi chú — hợp đồng tới bao giờ, gói nào… (không bắt buộc)"
        aria-label="Ghi chú"
        className={inputSmCls}
      />
      <p className="text-[12px] leading-relaxed text-ink-3">
        Hai ô ngày để trống cũng được. Có chúng thì tháng năm ngoái vẫn tính
        đúng theo hợp đồng hồi đó, thay vì lấy giá hiện tại áp ngược cho cả
        quá khứ.
      </p>
    </>
  );
}
