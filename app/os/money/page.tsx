import type { Metadata } from "next";
import { db } from "@/lib/db";
import { todayISO } from "@/lib/os/day";
import {
  costActiveIn,
  fmtYen,
  monthLabelVN,
  monthMoney,
  perMonth,
  recentMonths,
} from "@/lib/os/money";
import { MonthTable } from "@/components/os/MonthTable";
import { FixedCosts } from "@/components/os/FixedCosts";

export const metadata: Metadata = { title: "Tiền" };

/**
 * Tổng kết tiền theo tháng.
 *
 * Trang riêng chứ KHÔNG phải tab thứ sáu của lĩnh vực Tiền: `/os/a/[slug]` là
 * một file dùng chung cho cả bảy lĩnh vực, và thêm một tab chỉ có nghĩa với
 * đúng một lĩnh vực là phá mất tính chất đó (OS-DESIGN §1). Lĩnh vực Tiền vẫn
 * giữ mục tiêu · nguyên tắc · số đo như sáu lĩnh vực kia.
 */
export default async function MoneyPage() {
  const months = recentMonths(12);
  const today = todayISO();

  // Lấy 13 tháng gần nhất một lượt rồi gộp trong bộ nhớ — 12 truy vấn theo
  // tháng cho một trang một người dùng là phí, mà dữ liệu thì bé.
  const oldest = months[months.length - 1];

  const [logs, costs, budgets] = await Promise.all([
    db.dailyLog.findMany({
      where: { date: { gte: new Date(`${oldest}T00:00:00.000Z`) } },
      orderBy: { date: "asc" },
    }),
    db.fixedCost.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    db.monthBudget.findMany(),
  ]);

  const rows = months.map((m) => monthMoney(m, logs, costs, budgets, today));

  const thisMonth = rows[0];
  const activeNow = costs.filter((c) => costActiveIn(c, months[0]));
  const floor = activeNow.reduce((s, c) => s + perMonth(c), 0);

  return (
    <div className="max-w-[820px] space-y-10">
      <header className="border-b border-line pb-5">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Tiền</h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">
          Chi hằng ngày cộng từ ô «Chi tiêu» trong nhật ký. Chi cố định lấy từ
          danh sách bên dưới. Chỉ thu nhập là con số bạn phải tự khai — hệ thống
          không có cách nào biết.
        </p>
      </header>

      <section>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-4">
          <Tile label="Sàn cố định / tháng" value={`${fmtYen(floor)}¥`} />
          <Tile
            label={`${monthLabelVN(months[0])} — đã tiêu`}
            value={`${fmtYen(thisMonth.total)}¥`}
            hint={`${fmtYen(thisMonth.daily)} chi tiêu + ${fmtYen(thisMonth.fixed)} cố định`}
          />
          <Tile
            label="Thu nhập tháng này"
            value={thisMonth.income == null ? "—" : `${fmtYen(thisMonth.income)}¥`}
            hint={thisMonth.income == null ? "chưa khai" : undefined}
          />
          <Tile
            label="Tỷ lệ tiết kiệm"
            value={
              thisMonth.savedRate == null
                ? "—"
                : `${Math.round(thisMonth.savedRate * 100)}%`
            }
            hint={
              thisMonth.saved == null
                ? "cần thu nhập"
                : `${fmtYen(thisMonth.saved)}¥ còn lại`
            }
          />
        </div>

        {/* Nối thẳng vào số đo đã có, thay vì đẻ ra một con số thứ hai cùng ý
            nghĩa ở chỗ khác. */}
        <p className="mt-3 text-[13px] leading-relaxed text-ink-3">
          Sàn cố định × 3 ={" "}
          <strong className="font-medium text-ink-2">
            {fmtYen(floor * 3)}¥
          </strong>{" "}
          — đây là đích của số đo «Quỹ khẩn cấp» ở lĩnh vực Tiền, vốn ghi là
          “= 3 tháng chi phí” mà chưa biết chi phí là bao nhiêu.
        </p>
      </section>

      <MonthTable rows={rows} />

      <FixedCosts costs={costs} thisMonth={months[0]} />
    </div>
  );
}

function Tile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-bg p-4">
      <div className="text-[12px] leading-snug text-ink-3">{label}</div>
      <div className="mt-1.5 text-[18px] font-semibold tabular-nums leading-none">
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-[11px] tabular-nums text-ink-3">{hint}</div>
      )}
    </div>
  );
}

