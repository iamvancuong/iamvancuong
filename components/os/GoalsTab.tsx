import { GoalStatus, Horizon, type Goal } from "@prisma/client";
import { Check, CopyPlus, X, Undo2 } from "lucide-react";
import { ageMilestones, timeUntilAge, type AgeMilestone } from "@/lib/os/age";
import { fmtDateVN, fmtH, isoUTC, todayISO } from "@/lib/os/day";
import { goalPace, type JpLog } from "@/lib/os/japanese";
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
import { POMO_MIN, POMO_SLOTS } from "@/lib/os/constants";

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

export function GoalsTab({
  slug,
  goals,
  logs = [],
  tracksStudy = false,
}: {
  slug: string;
  goals: Goal[];
  /** Nhật ký để tính nhịp của từng chặng. Rỗng cũng chạy được. */
  logs?: JpLog[];
  /**
   * Lĩnh vực này có bấm giờ pomodoro không (`Area.tracksStudy`).
   *
   * Tắt = form mục tiêu KHÔNG có cụm ô đợt học. Sáu lĩnh vực còn lại không
   * thấy gì thêm — đúng yêu cầu "để nó không bị loạn". Bật thêm lĩnh vực nào
   * thì tick một ô ở /os/data, không sửa dòng code nào.
   */
  tracksStudy?: boolean;
}) {
  // Mốc tuổi tính ở server rồi truyền xuống: tính lại ở client sẽ lệch múi giờ.
  const milestones = ageMilestones();

  /**
   * ⚠️ MỤC TIÊU CON không được đứng ngang hàng trong danh sách.
   *
   * `area.goals` trả về CẢ con lẫn cha (con cũng thuộc lĩnh vực đó), nên nếu
   * không lọc thì "N5–N4" nằm cạnh "JLPT N3" như hai mục tiêu rời — mất hẳn
   * quan hệ lồng nhau, và cùng một số giờ bị đọc thành hai mục tiêu khác nhau.
   * Con được vẽ BÊN TRONG dòng của cha (xem `StudyChildren`).
   */
  const childrenOf = new Map<string, Goal[]>();
  for (const g of goals) {
    if (!g.parentId) continue;
    if (!childrenOf.has(g.parentId)) childrenOf.set(g.parentId, []);
    childrenOf.get(g.parentId)!.push(g);
  }
  const top = goals.filter((g) => !g.parentId);

  const alive = top.filter((g) => g.status !== GoalStatus.DROPPED);
  const dropped = top.filter((g) => g.status === GoalStatus.DROPPED);

  const periods = alive.filter((g) => isPeriod(g.horizon) && g.periodStart);

  /**
   * Xếp theo NGÀY cho dễ đọc: đợt học theo ngày bắt đầu, mục tiêu không có
   * ngày thì rơi xuống cuối (giữ thứ tự `order` cũ giữa chúng với nhau).
   * Trước đây xếp theo [status, order] nên hai đợt nối tiếp nhau hiện lộn xộn.
   */
  const kidsOf = (g: Goal) =>
    (childrenOf.get(g.id) ?? []).sort((a, b) =>
      (a.studyStart ? isoUTC(a.studyStart) : "9999").localeCompare(
        b.studyStart ? isoUTC(b.studyStart) : "9999",
      ),
    );

  const dateKey = (g: Goal) =>
    g.studyStart ? isoUTC(g.studyStart) : "9999-99-99";
  const longTerm = alive
    .filter((g) => !isPeriod(g.horizon))
    .sort((a, b) => dateKey(a).localeCompare(dateKey(b)));

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
          tracksStudy={tracksStudy}
          kidsOf={kidsOf}
          logs={logs}
        />
      )}

      {current.length > 0 && (
        <PeriodSection
          title="Đang trong kỳ"
          hint="Cam kết của tuần / tháng này."
          goals={current}
          slug={slug}
          milestones={milestones}
          tracksStudy={tracksStudy}
          kidsOf={kidsOf}
          logs={logs}
        />
      )}

      {future.length > 0 && (
        <PeriodSection
          title="Kỳ sắp tới"
          goals={future}
          slug={slug}
          milestones={milestones}
          tracksStudy={tracksStudy}
          kidsOf={kidsOf}
          logs={logs}
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
                <GoalRow
              goal={g}
              slug={slug}
              milestones={milestones}
              tracksStudy={tracksStudy}
              kids={kidsOf?.(g) ?? []}
              logs={logs}
            />
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
                <GoalRow
                  goal={g}
                  slug={slug}
                  milestones={milestones}
                  tracksStudy={tracksStudy}
                  kids={kidsOf(g)}
                  logs={logs}
                />
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
          action={createGoal.bind(null, slug, null)}
          className="space-y-2 rounded-[var(--radius-lg)] border border-line p-3"
        >
          <GoalFields milestones={milestones} tracksStudy={tracksStudy} />
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
  tracksStudy = false,
  kidsOf,
  logs = [],
}: {
  title: string;
  hint?: string;
  goals: Goal[];
  slug: string;
  milestones: AgeMilestone[];
  tracksStudy?: boolean;
  kidsOf?: (g: Goal) => Goal[];
  logs?: JpLog[];
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
            <GoalRow
                  goal={g}
                  slug={slug}
                  milestones={milestones}
                  tracksStudy={tracksStudy}
                  kids={kidsOf?.(g) ?? []}
                  logs={logs}
                />
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
  tracksStudy = false,
  kids = [],
  logs = [],
}: {
  goal: Goal;
  slug: string;
  milestones: AgeMilestone[];
  tracksStudy?: boolean;
  /** Mục tiêu con, đã xếp theo ngày bắt đầu. */
  kids?: Goal[];
  logs?: JpLog[];
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
              /* `ink-3` chứ không `line` — xem chú thích ở TodayPanel */
              done ? "border-ink bg-ink text-bg" : "border-ink-3 hover:border-ink"
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

        {g.detail && (
          <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-ink-3">
            {g.detail}
          </p>
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

        {/* Mục tiêu con — chặng và mảng kỹ năng nằm TRONG mục tiêu này. */}
        {tracksStudy && g.targetHours != null && (
          <StudyChildren parent={g} kids={kids} slug={slug} logs={logs} />
        )}

        <Disclosure label="Sửa" small>
          <div className="space-y-3 rounded-[var(--radius-lg)] border border-line p-3">
            <form action={updateGoal.bind(null, g.id, slug)} className="space-y-2">
              <GoalFields goal={g} milestones={milestones} tracksStudy={tracksStudy} />
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
  tracksStudy = false,
}: {
  goal?: Goal;
  milestones: AgeMilestone[];
  tracksStudy?: boolean;
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
      {/* `detail` có cột từ đầu nhưng chưa từng có ô nhập. Để textarea chứ
          không phải input vì đây là chỗ ghi kế hoạch nhiều dòng — `why` đã
          nhận phần một câu rồi. */}
      <textarea
        name="detail"
        rows={2}
        defaultValue={goal?.detail ?? ""}
        placeholder="Định làm thế nào? Chia nhỏ ra sao? (không bắt buộc)"
        aria-label="Chi tiết"
        className="w-full resize-y rounded-[var(--radius-sm)] border border-line bg-bg px-3 py-2 text-[14px] leading-relaxed outline-none focus:border-ink-3"
      />

      <HorizonPicker
        milestones={milestones}
        defaultHorizon={horizon}
        defaultAge={goal?.horizonAge ?? null}
        defaultPeriod={defaultPeriod}
      />

      {/*
        Đợt học có bấm giờ — CHỈ hiện ở lĩnh vực đã bật `tracksStudy`.

        Để trống cả cụm là mục tiêu bình thường: `targetHours` ra null và không
        chỗ nào coi nó là đợt học. Không có cột "loại" nào cả — một mục tiêu
        thành đợt học đúng lúc nó được cho một tổng số giờ.
      */}
      {tracksStudy && (
        <fieldset className="rounded-[var(--radius-md)] border border-line-soft p-2.5">
          <legend className="px-1">
            <MicroLabel>Bấm giờ — không bắt buộc</MicroLabel>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="block text-[12px] text-ink-3">
                Tổng số giờ cần, tính từ 0
              </span>
              <input
                type="number"
                name="targetHours"
                min={0}
                max={5000}
                placeholder="800"
                defaultValue={goal?.targetHours ?? ""}
                className={`mt-1 ${inputSmCls}`}
              />
            </label>
            <label className="block">
              <span className="block text-[12px] text-ink-3">
                Trong đó đã học trước đây
              </span>
              <input
                type="number"
                name="priorHours"
                min={0}
                max={2000}
                placeholder="500"
                defaultValue={goal?.priorHours ?? ""}
                className={`mt-1 ${inputSmCls}`}
              />
            </label>
            <label className="block">
              <span className="block text-[12px] text-ink-3">Bắt đầu</span>
              <input
                type="date"
                name="studyStart"
                defaultValue={goal?.studyStart ? isoUTC(goal.studyStart) : ""}
                className={`mt-1 ${inputSmCls}`}
              />
            </label>
            <label className="block">
              <span className="block text-[12px] text-ink-3">Ngày đích</span>
              <input
                type="date"
                name="studyEnd"
                defaultValue={goal?.studyEnd ? isoUTC(goal.studyEnd) : ""}
                className={`mt-1 ${inputSmCls}`}
              />
            </label>
            <label className="block">
              <span className="block text-[12px] text-ink-3">
                Hiệp mỗi ngày ({POMO_MIN}p/hiệp)
              </span>
              <input
                type="number"
                name="dailyPomo"
                min={1}
                max={POMO_SLOTS}
                placeholder="7"
                defaultValue={goal?.dailyPomo ?? ""}
                className={`mt-1 ${inputSmCls}`}
              />
            </label>
            <label className="block">
              <span className="block text-[12px] text-ink-3">
                Icon (cho mục tiêu con)
              </span>
              <input
                name="icon"
                maxLength={8}
                placeholder="🎧"
                defaultValue={goal?.icon ?? ""}
                className={`mt-1 ${inputSmCls}`}
              />
            </label>
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-ink-3">
            <strong className="font-medium text-ink-2">Tổng tính từ 0.</strong>{" "}
            &laquo;N3 = 800h&raquo; nghĩa là N5+N4+N3 cộng lại 800 — nếu đang ở
            N4 thì điền <em>đã học trước đây</em> 500, hệ thống hiểu còn 300h.
          </p>
        </fieldset>
      )}

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

/**
 * Các chặng / mảng nằm trong một mục tiêu có bấm giờ.
 *
 * ⚠️ Cảnh báo quan trọng nhất ở đây: giờ học của một chặng chỉ được CHA cộng
 * vào khi khoảng ngày của chặng nằm TRONG khoảng ngày của cha
 * (`goalPace` cộng mọi phút tiếng Nhật rơi vào khoảng của cha, bất kể hiệp đó
 * gắn vào con nào). Đặt cha "3 tháng học N3" bắt đầu SAU khi chặng N4 kết thúc
 * là 280 giờ của N4 im lặng biến mất khỏi tổng — con số vẫn trông hợp lý, chỉ
 * là thiếu. Nên chỗ này nói thẳng ra.
 */
function StudyChildren({
  parent,
  kids,
  slug,
  logs,
}: {
  parent: Goal;
  kids: Goal[];
  slug: string;
  logs: JpLog[];
}) {
  const today = todayISO();
  // Nhịp cha đã đặt — mốc để nói "đủ mỗi ngày vẫn không kịp".
  const tooFast = (need: number) =>
    parent.dailyPomo != null && need > parent.dailyPomo;

  const pStart = parent.studyStart ? isoUTC(parent.studyStart) : null;
  const pEnd = parent.studyEnd ? isoUTC(parent.studyEnd) : null;

  return (
    <div className="mt-2.5 border-l border-line-soft pl-3">
      {/* Nói thẳng quan hệ, đừng bắt suy từ thụt lề. */}
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">
        Thuộc «{parent.title}»
        {parent.targetHours != null && ` · tổng ${parent.targetHours}h`}
        {kids.length > 0 &&
          ` · đã chia ${kids.reduce((n, k) => n + (k.targetHours ?? 0), 0)}h`}
      </p>
      <ul className="space-y-1.5">
      {kids.map((k) => {
        const s = k.studyStart ? isoUTC(k.studyStart) : null;
        const e = k.studyEnd ? isoUTC(k.studyEnd) : null;

        // Chỉ chặng (có khai ngày) mới có nhịp. Mảng kỹ năng thì không.
        const pace = k.targetHours
          ? goalPace(
              {
                studyStart: k.studyStart,
                studyEnd: k.studyEnd,
                targetHours: k.targetHours,
                priorHours: k.priorHours,
                dailyPomo: parent.dailyPomo,
              },
              logs,
              today,
            )
          : null;

        const state =
          s && e
            ? today < s
              ? "chưa tới"
              : today > e
                ? "đã xong"
                : "đang chạy"
            : null;

        // Ngoài khoảng của cha = giờ của chặng này KHÔNG vào tổng của cha.
        const outside =
          !!s && !!e && !!pStart && !!pEnd && (s < pStart || e > pEnd);

        return (
          <li key={k.id} className="text-[13px]">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className={state === "đang chạy" ? "font-medium" : ""}>
                {k.icon && <span className="mr-1">{k.icon}</span>}
                {k.title}
              </span>
              {k.targetHours != null && (
                <span className="tabular-nums text-ink-3">
                  {k.targetHours}h
                </span>
              )}
              {s && e && (
                <span className="tabular-nums text-ink-3">
                  · {fmtDateVN(s)} → {fmtDateVN(e)}
                </span>
              )}
              {state && (
                <span
                  className={`text-[11px] ${
                    state === "đang chạy" ? "text-ink" : "text-ink-3"
                  }`}
                >
                  · {state}
                </span>
              )}
            </div>
            {/*
              Nhịp của CHẶNG — cố ý gọn hơn hẳn khối của cha: một dòng số, không
              lặp lại cả đoạn văn. Câu dài chỉ xuất hiện khi có chuyện thật sự
              cần nói, tức là nhịp đã đặt không đủ để kịp.

              Chặng dùng chung cách tính với cha: mọi phút rơi vào khoảng ngày
              của nó đều tính. Mảng kỹ năng (không khai ngày) thì không có nhịp
              — nó chạy suốt đợt, "còn mấy ngày" không có nghĩa.
            */}
            {pace && pace.state === "running" && (
              <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[12px] tabular-nums text-ink-3">
                <span>
                  {fmtH(pace.doneMin)} / {fmtH(pace.totalMin)} · {pace.percent}%
                </span>
                <span>· còn {pace.daysLeft} ngày</span>
                {pace.pomoPerDayLeft != null && pace.pomoPerDayLeft > 0 && (
                  <span
                    className={
                      tooFast(pace.pomoPerDayLeft) ? "font-medium text-accent" : ""
                    }
                  >
                    · cần {pace.pomoPerDayLeft} hiệp/ngày
                  </span>
                )}
              </div>
            )}
            {pace?.state === "running" &&
              pace.pomoPerDayLeft != null &&
              tooFast(pace.pomoPerDayLeft) && (
                <p className="mt-0.5 text-[12px] leading-relaxed text-accent">
                  Nhịp đang đặt là {parent.dailyPomo} — chặng này đủ mỗi ngày
                  vẫn không kịp. Nâng nhịp, lùi ngày đích, hoặc bớt giờ.
                </p>
              )}

            {outside && (
              <p className="mt-0.5 text-[12px] leading-relaxed text-accent">
                Khoảng ngày này nằm NGOÀI khoảng của «{parent.title}» — giờ học
                ở đây sẽ không được cộng vào tổng của mục tiêu cha. Kéo ngày của
                cha cho bao trùm cả chặng này.
              </p>
            )}

            {/* Sửa / xóa NGAY TẠI CHỖ. Con bị lọc khỏi danh sách chính nên
                không đi qua GoalRow — không có khối này thì tạo xong là chịu. */}
            <div className="mt-1 flex items-center gap-3">
              <Disclosure label="sửa" small>
                <form
                  action={updateGoal.bind(null, k.id, slug)}
                  className="mt-1 grid gap-2 rounded-[var(--radius-md)] border border-line p-2.5 sm:grid-cols-4"
                >
                  <input
                    name="icon"
                    maxLength={8}
                    defaultValue={k.icon ?? ""}
                    placeholder="🎧"
                    aria-label="Icon"
                    className={inputSmCls}
                  />
                  <input
                    name="title"
                    required
                    maxLength={200}
                    defaultValue={k.title}
                    aria-label="Tên"
                    className={`sm:col-span-2 ${inputSmCls}`}
                  />
                  <input
                    type="number"
                    name="targetHours"
                    min={0}
                    max={2000}
                    defaultValue={k.targetHours ?? ""}
                    placeholder="giờ"
                    aria-label="Ngân sách giờ"
                    className={inputSmCls}
                  />
                  <input
                    type="date"
                    name="studyStart"
                    defaultValue={s ?? ""}
                    aria-label="Bắt đầu"
                    className={`sm:col-span-2 ${inputSmCls}`}
                  />
                  <input
                    type="date"
                    name="studyEnd"
                    defaultValue={e ?? ""}
                    aria-label="Ngày đích"
                    className={`sm:col-span-2 ${inputSmCls}`}
                  />
                  <div className="flex justify-end sm:col-span-4">
                    <SubmitButton>Lưu</SubmitButton>
                  </div>
                </form>
              </Disclosure>

              <form action={deleteGoal.bind(null, k.id, slug)}>
                <ConfirmButton
                  confirm={`Xóa «${k.title}»? Giờ đã học KHÔNG mất — các hiệp của nó rơi về «chưa gắn» và vẫn nằm trong tổng của mục tiêu cha.`}
                  label={`Xóa ${k.title}`}
                  className="text-[12px] text-ink-3 hover:text-down"
                >
                  xóa
                </ConfirmButton>
              </form>
            </div>
          </li>
        );
      })}

      <li>
        <Disclosure label="+ Thêm mục tiêu con" small>
          {/*
            Form GỌN, không dùng GoalFields: một chặng chỉ cần tên · icon ·
            ngân sách giờ · khoảng ngày. Bày cả mốc tuổi và cách đo ở đây là
            hỏi những câu không thuộc về một chặng.

            `parentId` bind sẵn — cha là dòng đang mở, không phải chọn từ một ô
            select. Không có cách nào gắn nhầm cha.
          */}
          <form
            action={createGoal.bind(null, slug, parent.id)}
            className="space-y-2 rounded-[var(--radius-md)] border border-line p-2.5"
          >
            <div className="grid gap-2 sm:grid-cols-4">
              <input
                name="icon"
                maxLength={8}
                placeholder="🎧"
                aria-label="Icon"
                className={inputSmCls}
              />
              <input
                name="title"
                required
                maxLength={200}
                placeholder="Tên chặng / mảng"
                aria-label="Tên"
                className={`sm:col-span-2 ${inputSmCls}`}
              />
              <input
                type="number"
                name="targetHours"
                min={0}
                max={2000}
                placeholder="giờ"
                aria-label="Ngân sách giờ"
                className={inputSmCls}
              />
              <label className="block sm:col-span-2">
                <span className="block text-[11px] text-ink-3">
                  Bắt đầu — để trống nếu là mảng kỹ năng
                </span>
                <input
                  type="date"
                  name="studyStart"
                  defaultValue={
                    parent.studyStart ? isoUTC(parent.studyStart) : ""
                  }
                  className={`mt-1 ${inputSmCls}`}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="block text-[11px] text-ink-3">Ngày đích</span>
                <input
                  type="date"
                  name="studyEnd"
                  defaultValue={parent.studyEnd ? isoUTC(parent.studyEnd) : ""}
                  className={`mt-1 ${inputSmCls}`}
                />
              </label>
            </div>
            <p className="text-[12px] leading-relaxed text-ink-3">
              Có ngày = một <strong className="font-medium text-ink-2">chặng</strong>{" "}
              (N5–N4 rồi tới N3). Không ngày = một{" "}
              <strong className="font-medium text-ink-2">mảng kỹ năng</strong>{" "}
              chạy suốt đợt (từ vựng · nghe · đọc).
            </p>
            <div className="flex justify-end">
              <SubmitButton>Thêm</SubmitButton>
            </div>
          </form>
        </Disclosure>
      </li>
      </ul>
    </div>
  );
}
