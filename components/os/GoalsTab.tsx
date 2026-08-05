import { GoalStatus, Horizon, type Goal } from "@prisma/client";
import { Check, CopyPlus, X, Undo2 } from "lucide-react";
import { ageMilestones, timeUntilAge, type AgeMilestone } from "@/lib/os/age";
import { isoUTC, todayISO } from "@/lib/os/day";
import {
  currentPeriodStart,
  isPeriod,
  periodCountdown,
  periodLabel,
  periodState,
} from "@/lib/os/period";
import {
  createGoal,
  deleteGoal,
  dropGoal,
  repeatGoal,
  setGoalCurrent,
  setGoalStatus,
  updateGoal,
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
import { HorizonPicker } from "./HorizonPicker";
import { OutcomeBadge, OutcomeButtons, ReviewForm, ReviewText } from "./GoalReview";

const HORIZON_LABEL: Record<Horizon, string> = {
  WEEK: "Tuần",
  MONTH: "Tháng",
  THIS_YEAR: "Năm nay",
  NEXT_YEAR: "Năm sau",
  AGE: "Tuổi",
  LIFE: "Cả đời",
};

export function horizonText(
  g: Pick<Goal, "horizon" | "horizonAge" | "periodStart">,
): string {
  if (isPeriod(g.horizon) && g.periodStart) {
    return periodLabel(g.horizon, isoUTC(g.periodStart));
  }
  if (g.horizon === Horizon.AGE && g.horizonAge) {
    return `${g.horizonAge} tuổi · ${timeUntilAge(g.horizonAge)}`;
  }
  return HORIZON_LABEL[g.horizon];
}

export function GoalsTab({ slug, goals }: { slug: string; goals: Goal[] }) {
  // Mốc tuổi tính ở server rồi truyền xuống: tính lại ở client sẽ lệch múi giờ.
  const milestones = ageMilestones();

  const alive = goals.filter((g) => g.status !== GoalStatus.DROPPED);
  const dropped = goals.filter((g) => g.status === GoalStatus.DROPPED);

  const periods = alive.filter((g) => isPeriod(g.horizon) && g.periodStart);
  const longTerm = alive.filter((g) => !isPeriod(g.horizon));

  const today = todayISO();
  const stateOf = (g: Goal) =>
    periodState(g.horizon, isoUTC(g.periodStart!), today);

  const current = periods.filter((g) => stateOf(g) === "current");
  const future = periods.filter((g) => stateOf(g) === "future");
  // Kỳ đã qua mà chưa chấm — đây là thứ cần đập vào mắt trước tiên
  const unreviewed = periods.filter(
    (g) => stateOf(g) === "past" && !g.outcome,
  );
  const done = periods.filter((g) => stateOf(g) === "past" && g.outcome);

  return (
    <div className="space-y-10">
      {unreviewed.length > 0 && (
        <PeriodSection
          title="Kỳ đã qua — chưa chấm"
          hint="Chấm rồi mới biết tuần sau nên đổi gì. Mất một phút."
          goals={unreviewed}
          slug={slug}
          milestones={milestones}
        />
      )}

      {current.length > 0 && (
        <PeriodSection
          title="Đang trong kỳ"
          hint="Cam kết của tuần / tháng này."
          goals={current}
          slug={slug}
          milestones={milestones}
        />
      )}

      {future.length > 0 && (
        <PeriodSection
          title="Kỳ sắp tới"
          goals={future}
          slug={slug}
          milestones={milestones}
        />
      )}

      <section>
        <h3 className="mb-3 border-b border-line-soft pb-2">
          <MicroLabel>Mốc dài hạn</MicroLabel>
        </h3>
        {longTerm.length === 0 ? (
          <EmptyNote>Chưa có mốc dài hạn nào ở đây — chưa cần thiết.</EmptyNote>
        ) : (
          <ul className="divide-y divide-line-soft">
            {longTerm.map((g) => (
              <li key={g.id} className="py-4 first:pt-0">
                <GoalRow goal={g} slug={slug} milestones={milestones} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {done.length > 0 && (
        <Disclosure label={`Kỳ đã xong (${done.length})`}>
          <ul className="divide-y divide-line-soft">
            {done.map((g) => (
              <li key={g.id} className="py-3">
                <GoalRow goal={g} slug={slug} milestones={milestones} />
              </li>
            ))}
          </ul>
        </Disclosure>
      )}

      {dropped.length > 0 && (
        <section>
          <h3 className="mb-2">
            <MicroLabel>Đã bỏ</MicroLabel>
          </h3>
          <p className="mb-3 text-[13px] leading-relaxed text-ink-3">
            Bỏ mục tiêu đúng lúc là kỹ năng, không phải thất bại. Giữ lại đây để
            sau này nhớ mình đã cân nhắc gì — và vì sao đã thôi.
          </p>
          <ul className="divide-y divide-line-soft">
            {dropped.map((g) => (
              <li key={g.id} className="py-2.5">
                <div className="flex items-center gap-3">
                  <span className="min-w-0 flex-1 text-[14px] text-ink-3 line-through">
                    {g.title}
                  </span>
                  <form
                    action={setGoalStatus.bind(null, g.id, GoalStatus.DOING, slug)}
                  >
                    <SubmitButton variant="quiet">
                      <Undo2 size={14} strokeWidth={2} aria-label="Khôi phục" />
                    </SubmitButton>
                  </form>
                  <form action={deleteGoal.bind(null, g.id, slug)}>
                    <ConfirmButton
                      label="Xóa hẳn"
                      confirm={`Xóa hẳn "${g.title}"? Không hoàn tác được.`}
                      className="p-1 text-ink-3 hover:text-down"
                    >
                      <X size={14} strokeWidth={2} />
                    </ConfirmButton>
                  </form>
                </div>
                {g.dropReason && (
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
                    Vì sao bỏ: {g.dropReason}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Disclosure label="+ Thêm mục tiêu">
        <form
          action={createGoal.bind(null, slug)}
          className="space-y-2 rounded-[var(--radius-lg)] border border-line p-3"
        >
          <GoalFields milestones={milestones} />
          <div className="flex justify-end">
            <SubmitButton>Thêm mục tiêu</SubmitButton>
          </div>
        </form>
      </Disclosure>
    </div>
  );
}

function PeriodSection({
  title,
  hint,
  goals,
  slug,
  milestones,
}: {
  title: string;
  hint?: string;
  goals: Goal[];
  slug: string;
  milestones: AgeMilestone[];
}) {
  return (
    <section>
      <h3 className="mb-1 border-b border-line-soft pb-2">
        <MicroLabel>{title}</MicroLabel>
      </h3>
      {hint && <p className="mb-3 mt-2 text-[13px] text-ink-3">{hint}</p>}
      <ul className="divide-y divide-line-soft">
        {goals.map((g) => (
          <li key={g.id} className="py-4">
            <GoalRow goal={g} slug={slug} milestones={milestones} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function GoalRow({
  goal: g,
  slug,
  milestones,
}: {
  goal: Goal;
  slug: string;
  milestones: AgeMilestone[];
}) {
  const done = g.status === GoalStatus.DONE;
  const period = isPeriod(g.horizon) && g.periodStart;
  const startISO = g.periodStart ? isoUTC(g.periodStart) : null;
  const state = period ? periodState(g.horizon, startISO!) : null;

  return (
    <div className="flex items-start gap-3">
      {/* Cam kết có kỳ thì KHÔNG dùng ô tick: nó được chấm ba mức khi hết kỳ,
          chứ không phải xong/chưa xong. Mốc dài hạn thì vẫn tick như cũ. */}
      {!period && (
        <form
          action={setGoalStatus.bind(
            null,
            g.id,
            done ? GoalStatus.DOING : GoalStatus.DONE,
            slug,
          )}
        >
          <button
            type="submit"
            aria-label={done ? "Bỏ đánh dấu xong" : "Đánh dấu đã xong"}
            className={`mt-0.5 flex size-[20px] items-center justify-center rounded-[var(--radius-sm)] border transition-colors ${
              done ? "border-ink bg-ink text-white" : "border-line hover:border-ink-3"
            }`}
          >
            {done && <Check size={13} strokeWidth={3} />}
          </button>
        </form>
      )}

      <div className="min-w-0 flex-1">
        <div
          className={`text-[15px] leading-snug ${done && !period ? "text-ink-3 line-through" : ""}`}
        >
          {g.title}
        </div>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-ink-3">
          <span>{horizonText(g)}</span>
          {period && <span>· {periodCountdown(g.horizon, startISO!)}</span>}
          {g.outcome && (
            <>
              <span>·</span>
              <OutcomeBadge outcome={g.outcome} />
            </>
          )}
        </div>

        {g.why && (
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{g.why}</p>
        )}

        {/* Cách đo — chỉ hiện khi mục tiêu này thật sự đo được bằng số.
            Mục tiêu không có ô đo vẫn hợp lệ, không phải mọi thứ đều đếm được. */}
        {g.metric && (
          <form
            action={setGoalCurrent.bind(null, g.id, slug)}
            className="mt-2 flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-line-soft bg-surface px-2.5 py-2"
          >
            <span className="text-[12px] text-ink-3">{g.metric}</span>
            <input
              name="current"
              defaultValue={g.current ?? ""}
              placeholder="đang ở đâu"
              aria-label={`${g.metric} — đang ở đâu`}
              className="w-24 rounded-[var(--radius-sm)] border border-line bg-bg px-2 py-1 text-[13px] tabular-nums outline-none focus:border-ink-3"
            />
            {g.target && (
              <span className="text-[13px] text-ink-2">
                / <strong className="font-medium">{g.target}</strong>
              </span>
            )}
            <SubmitButton variant="quiet" pendingLabel="…">
              lưu
            </SubmitButton>
          </form>
        )}

        {/* Hết kỳ rồi thì việc cần làm là chấm, không phải sửa. */}
        {period && state !== "future" && (
          <div className="mt-2.5 space-y-2">
            <OutcomeButtons goal={g} slug={slug} />
            <ReviewText goal={g} />
            <div className="flex flex-wrap items-center gap-3">
              <ReviewForm goal={g} slug={slug} />
              {state === "past" && (
                <form action={repeatGoal.bind(null, g.id, slug)}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 text-[12px] text-ink-3 transition-colors hover:text-ink"
                  >
                    <CopyPlus size={12} strokeWidth={2} />
                    làm lại kỳ sau
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        <Disclosure label="Sửa" small>
          <div className="space-y-3 rounded-[var(--radius-lg)] border border-line p-3">
            <form action={updateGoal.bind(null, g.id, slug)} className="space-y-2">
              <GoalFields goal={g} milestones={milestones} />
              <div className="flex justify-end">
                <SubmitButton>Lưu thay đổi</SubmitButton>
              </div>
            </form>

            {!done && (
              <form
                action={dropGoal.bind(null, g.id, slug)}
                className="flex flex-col gap-2 border-t border-line-soft pt-3 sm:flex-row"
              >
                <input
                  name="dropReason"
                  placeholder="Vì sao thôi không theo nữa? (nên ghi)"
                  className={inputSmCls}
                />
                <SubmitButton variant="quiet" pendingLabel="…">
                  Bỏ mục tiêu này
                </SubmitButton>
              </form>
            )}
          </div>
        </Disclosure>
      </div>

      <form action={deleteGoal.bind(null, g.id, slug)}>
        <ConfirmButton
          label={`Xóa: ${g.title}`}
          confirm={`Xóa "${g.title}"? Lời tự sự đã viết cũng mất theo.`}
          className="p-1 text-ink-3 hover:text-down"
        >
          <X size={15} strokeWidth={2} />
        </ConfirmButton>
      </form>
    </div>
  );
}

/**
 * Các ô của một mục tiêu — dùng chung cho form thêm và form sửa, nên hai bên
 * không bao giờ lệch nhau khi có thêm trường mới.
 */
function GoalFields({
  goal,
  milestones,
}: {
  goal?: Goal;
  milestones: AgeMilestone[];
}) {
  const horizon = goal?.horizon ?? Horizon.WEEK;

  // Với cam kết có kỳ, ô nhập là một NGÀY bất kỳ trong kỳ — server tự nắn về
  // thứ Hai (tuần) hoặc ngày 1 (tháng). Đỡ phải tự tra lịch xem thứ Hai nào.
  const defaultPeriod = goal?.periodStart
    ? isoUTC(goal.periodStart)
    : currentPeriodStart(isPeriod(horizon) ? horizon : Horizon.WEEK);

  return (
    <>
      <input
        name="title"
        required
        defaultValue={goal?.title ?? ""}
        placeholder="Mục tiêu là gì? — vd: tuần này chi dưới 10.000¥"
        className={inputCls}
      />
      <input
        name="why"
        defaultValue={goal?.why ?? ""}
        placeholder="Vì sao nó quan trọng với mình? (không bắt buộc)"
        className={inputSmCls}
      />

      <HorizonPicker
        milestones={milestones}
        defaultHorizon={horizon}
        defaultAge={goal?.horizonAge ?? null}
        defaultPeriod={defaultPeriod}
      />

      {/* PLAN §9 chống ảo tưởng tiến bộ: neo vào thứ đo được thật, không phải
          "Vocabulary 72%" — % của cái gì thì không ai biết. Ba ô này để trống
          được: mục tiêu không đo được bằng số vẫn là mục tiêu hợp lệ. */}
      <fieldset className="rounded-[var(--radius-md)] border border-line-soft p-2.5">
        <legend className="px-1">
          <MicroLabel>Cách đo — không bắt buộc</MicroLabel>
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            name="metric"
            defaultValue={goal?.metric ?? ""}
            placeholder="đo bằng gì"
            aria-label="Đo bằng gì"
            className={inputSmCls}
          />
          <input
            name="current"
            defaultValue={goal?.current ?? ""}
            placeholder="đang ở đâu"
            aria-label="Đang ở đâu"
            className={inputSmCls}
          />
          <input
            name="target"
            defaultValue={goal?.target ?? ""}
            placeholder="đích cần tới"
            aria-label="Đích cần tới"
            className={inputSmCls}
          />
        </div>
        <p className="mt-1.5 text-[12px] leading-relaxed text-ink-3">
          Ví dụ: <em>chi tiêu tuần</em> · <em>6.200¥</em> · <em>≤ 10.000¥</em>.
          Neo vào số đo được thật, đừng dùng phần trăm tự chấm.
        </p>
      </fieldset>
    </>
  );
}
