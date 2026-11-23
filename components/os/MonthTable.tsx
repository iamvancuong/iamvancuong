import { fmtYen, monthLabelVN, type MonthMoney } from "@/lib/os/money";
import { MicroLabel } from "./formBits";

/**
 * Mười hai tháng gần nhất, mới nhất trên cùng.
 *
 * Cột thu nhập CHỈ ĐỌC: nó là tiền baito của tháng (lib/os/baito.ts), không
 * nhập tay — một nguồn duy nhất, nên không có hai con số trôi khỏi nhau.
 */
export function MonthTable({ rows }: { rows: MonthMoney[] }) {
  return (
    <section>
      <h2 className="mb-1">
        <MicroLabel>Mười hai tháng gần nhất</MicroLabel>
      </h2>
      <p className="mb-3 text-[13px] leading-relaxed text-ink-3">
        Tháng nào chưa ghi ngày nào thì chi tiêu hằng ngày bằng 0 — đó là chưa
        ghi, không phải không tiêu. Cột «ngày» nói con số đáng tin tới đâu.
      </p>

      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line">
        <table className="w-full min-w-[640px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-[0.06em] text-ink-3">
              <th className="px-3 py-2 font-medium">Tháng</th>
              <th className="px-3 py-2 text-right font-medium">Chi tiêu</th>
              <th className="px-3 py-2 text-right font-medium">Cố định</th>
              <th className="px-3 py-2 text-right font-medium">Tổng</th>
              <th className="px-3 py-2 text-right font-medium">Thu nhập</th>
              <th className="px-3 py-2 text-right font-medium">Còn lại</th>
              <th className="px-3 py-2 text-right font-medium">Tỷ lệ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {rows.map((r) => (
              <tr key={r.month} className={r.partial ? "bg-surface" : ""}>
                <td className="whitespace-nowrap px-3 py-2">
                  {monthLabelVN(r.month)}
                  {r.partial && (
                    <span className="ml-1.5 text-[11px] text-ink-3">
                      đang chạy
                    </span>
                  )}
                  <div className="text-[11px] tabular-nums text-ink-3">
                    {r.daysWithSpend} ngày đã ghi
                  </div>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {fmtYen(r.daily)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-ink-3">
                  {fmtYen(r.fixed)}
                </td>
                <td className="px-3 py-2 text-right font-medium tabular-nums">
                  {fmtYen(r.total)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {r.income == null ? (
                    <span className="text-ink-3">—</span>
                  ) : (
                    fmtYen(r.income)
                  )}
                </td>
                <td
                  className={`px-3 py-2 text-right tabular-nums ${
                    r.saved != null && r.saved < 0 ? "text-down" : ""
                  }`}
                >
                  {r.saved == null ? "—" : fmtYen(r.saved)}
                </td>
                <td
                  className={`px-3 py-2 text-right font-medium tabular-nums ${
                    r.savedRate == null
                      ? "text-ink-3"
                      : r.savedRate >= 0.2
                        ? "text-up"
                        : r.savedRate < 0
                          ? "text-down"
                          : ""
                  }`}
                >
                  {r.savedRate == null
                    ? "—"
                    : `${Math.round(r.savedRate * 100)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
