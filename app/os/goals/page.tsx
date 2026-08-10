import Link from "next/link";
import type { Metadata } from "next";
import { GoalStatus, Horizon } from "@prisma/client";
import { db } from "@/lib/db";
import { ageNow, dateAtAge, fmtDateVN, timeUntilAge } from "@/lib/os/age";
import { EmptyNote } from "@/components/os/formBits";

export const metadata: Metadata = { title: "Con người muốn hướng tới" };

/**
 * Đây KHÔNG phải một lĩnh vực. Đây là cách nhìn xuyên qua tất cả lĩnh vực.
 *
 * Mục tiêu 25 tuổi gồm tiếng Nhật, công việc, tình yêu, tiền — không nằm gọn
 * ở đâu cả. Nên trang này gom hết lại rồi xếp theo mốc thời gian. Ghi một lần
 * ở lĩnh vực, hiện ra ở cả hai chỗ. (OS-DESIGN §2)
 */
export default async function GoalsPage() {
  const goals = await db.goal.findMany({
    where: {
      status: { not: GoalStatus.DROPPED },
      // Cam kết tuần/tháng KHÔNG phải mốc dài hạn — chúng sống ở Dashboard + Lịch.
      // Trước đây lọt vào đây rồi rơi vào nhánh `else` → hiện nhầm thành "Cả đời".
      horizon: { notIn: [Horizon.WEEK, Horizon.MONTH] },
    },
    include: { area: { select: { name: true, slug: true } } },
    orderBy: [{ horizonAge: "asc" }, { order: "asc" }],
  });

  const age = ageNow();

  // Gom theo mốc, sắp xếp: năm nay → năm sau → các mốc tuổi tăng dần → cả đời
  const buckets = new Map<
    string,
    { label: string; sub: string; sort: number; goals: typeof goals }
  >();

  for (const g of goals) {
    let key: string, label: string, sub: string, sort: number;

    if (g.horizon === Horizon.AGE && g.horizonAge) {
      key = `age-${g.horizonAge}`;
      label = `${g.horizonAge} tuổi`;
      sub = `${fmtDateVN(dateAtAge(g.horizonAge))} · ${timeUntilAge(g.horizonAge)}`;
      sort = 10 + g.horizonAge;
    } else if (g.horizon === Horizon.THIS_YEAR) {
      key = "this-year";
      label = "Năm nay";
      sub = String(new Date().getFullYear());
      sort = 0;
    } else if (g.horizon === Horizon.NEXT_YEAR) {
      key = "next-year";
      label = "Năm sau";
      sub = String(new Date().getFullYear() + 1);
      sort = 1;
    } else {
      key = "life";
      label = "Cả đời";
      sub = "không có hạn";
      sort = 999;
    }

    if (!buckets.has(key)) buckets.set(key, { label, sub, sort, goals: [] });
    buckets.get(key)!.goals.push(g);
  }

  const groups = [...buckets.values()].sort((a, b) => a.sort - b.sort);

  return (
    <div className="max-w-[760px] space-y-10">
      <header className="border-b border-line pb-5">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">
          Con người muốn hướng tới
        </h1>
        <p className="mt-1.5 text-[15px] text-ink-2">
          Hôm nay bạn {age.years} tuổi {age.months} tháng. Mọi mục tiêu từ tất cả
          lĩnh vực, xếp theo mốc thời gian.
        </p>
      </header>

      {groups.length === 0 ? (
        <EmptyNote>
          Chưa có mục tiêu nào. Thêm ở trang từng lĩnh vực — chúng sẽ tự hiện ra
          đây.
        </EmptyNote>
      ) : (
        groups.map((g) => (
          <section key={g.label}>
            <div className="mb-4 flex items-baseline gap-3">
              <h2 className="text-[18px] font-semibold tracking-[-0.01em]">
                {g.label}
              </h2>
              <span className="text-[13px] text-ink-3">{g.sub}</span>
            </div>

            <ul className="divide-y divide-line-soft border-t border-line-soft">
              {g.goals.map((goal) => (
                <li key={goal.id} className="flex items-start gap-3 py-3">
                  <span
                    className={`mt-[7px] size-1.5 shrink-0 rounded-full ${
                      goal.status === GoalStatus.DONE ? "bg-up" : "bg-ink-3"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-[15px] leading-snug ${
                        goal.status === GoalStatus.DONE
                          ? "text-ink-3 line-through"
                          : ""
                      }`}
                    >
                      {goal.title}
                    </div>
                    {goal.why && (
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
                        {goal.why}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/os/a/${goal.area.slug}`}
                    className="shrink-0 text-[12px] text-ink-3 transition-colors hover:text-ink"
                  >
                    {goal.area.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
