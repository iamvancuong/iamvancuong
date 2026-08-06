import { GoalOutcome, type Goal } from "@prisma/client";
import { Check, Minus, X } from "lucide-react";
import { reviewGoal, setGoalOutcome } from "@/lib/os/actions";
import { MicroLabel, SubmitButton } from "./formBits";
import { Disclosure } from "./Disclosure";

/**
 * Chấm kết quả một cam kết + ba câu tự sự.
 *
 * Đạt hay không đạt một tuần thì bản thân nó ít nghĩa. Thứ đáng giá là câu
 * **vì sao** — biết "không đạt vì tối nào cũng ăn ngoài sau ca làm" thì tuần
 * sau mới có thứ cụ thể để sửa. Nên chỉ ô đó được nhắc là nên viết.
 */

export const OUTCOME_META: Record<
  GoalOutcome,
  { label: string; short: string; cls: string; Icon: typeof Check }
> = {
  SUCCESS: { label: "Đạt", short: "đạt", cls: "text-up", Icon: Check },
  PARTIAL: { label: "Một phần", short: "một phần", cls: "text-ink-2", Icon: Minus },
  FAILED: { label: "Không đạt", short: "không đạt", cls: "text-down", Icon: X },
};

const ORDER: GoalOutcome[] = [
  GoalOutcome.SUCCESS,
  GoalOutcome.PARTIAL,
  GoalOutcome.FAILED,
];

/** Ba nút chấm nhanh — để lúc bận vẫn đóng được kỳ mà không phải viết gì. */
export function OutcomeButtons({
  goal,
  slug,
}: {
  goal: Goal;
  slug: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ORDER.map((o) => {
        const m = OUTCOME_META[o];
        const on = goal.outcome === o;
        return (
          <form key={o} action={setGoalOutcome.bind(null, goal.id, slug, o)}>
            <button
              type="submit"
              aria-pressed={on}
              className={`flex items-center gap-1 rounded-[var(--radius-md)] border px-2.5 py-1 text-[12px] transition-colors ${
                on
                  ? "border-ink bg-ink text-bg"
                  : `border-line hover:border-ink-3 ${m.cls}`
              }`}
            >
              <m.Icon size={12} strokeWidth={2.5} />
              {m.label}
            </button>
          </form>
        );
      })}
    </div>
  );
}

/** Kết quả đã chấm, hiện gọn trên một dòng. */
export function OutcomeBadge({ outcome }: { outcome: GoalOutcome }) {
  const m = OUTCOME_META[outcome];
  return (
    <span className={`inline-flex items-center gap-1 text-[12px] ${m.cls}`}>
      <m.Icon size={12} strokeWidth={2.5} />
      {m.label}
    </span>
  );
}

/** Phần tự sự đã viết — chỉ hiện những ô có nội dung. */
export function ReviewText({ goal }: { goal: Goal }) {
  const rows = [
    { label: "Chuyện gì", value: goal.reviewWhat },
    { label: "Vì sao", value: goal.reviewWhy },
    { label: "Kỳ sau", value: goal.reviewNext },
  ].filter((r) => r.value);

  if (rows.length === 0) return null;

  return (
    <dl className="mt-2 space-y-1.5 border-l-2 border-line pl-3">
      {rows.map((r) => (
        <div key={r.label}>
          <dt className="text-[12px] text-ink-3">{r.label}</dt>
          <dd className="whitespace-pre-line text-[14px] leading-relaxed text-ink-2">
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Form ba câu. Nằm trong Disclosure nên không choán chỗ khi chưa cần. */
export function ReviewForm({ goal, slug }: { goal: Goal; slug: string }) {
  const written = !!(goal.reviewWhat || goal.reviewWhy || goal.reviewNext);

  return (
    <Disclosure label={written ? "Sửa lời tự sự" : "Viết lại kỳ này"} small>
      <form
        action={reviewGoal.bind(null, goal.id, slug)}
        className="space-y-3 rounded-[var(--radius-lg)] border border-line p-3"
      >
        <fieldset>
          <legend className="mb-1.5">
            <MicroLabel>Kết quả</MicroLabel>
          </legend>
          <div className="flex flex-wrap gap-2">
            {ORDER.map((o) => {
              const m = OUTCOME_META[o];
              return (
                <label
                  key={o}
                  className="flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-md)] border border-line px-3 py-1.5 text-[13px] transition-colors hover:border-ink-3 has-checked:border-ink has-checked:bg-ink has-checked:text-bg"
                >
                  <input
                    type="radio"
                    name="outcome"
                    value={o}
                    defaultChecked={(goal.outcome ?? GoalOutcome.PARTIAL) === o}
                    className="sr-only"
                  />
                  {m.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <Field
          name="reviewWhat"
          label="Chuyện gì đã xảy ra?"
          defaultValue={goal.reviewWhat}
          placeholder="Kể lại ngắn thôi — ba ngày đầu ổn, tới thứ Năm thì…"
        />
        <Field
          name="reviewWhy"
          label="Điều gì khiến mình đạt / không đạt?"
          hint="Ô quan trọng nhất. Đạt hay không đạt thì tuần sau cũng thế; biết vì sao mới đổi được."
          defaultValue={goal.reviewWhy}
          placeholder="Vì tối nào tan ca cũng đói nên tiện đâu ăn đó…"
        />
        <Field
          name="reviewNext"
          label="Kỳ sau đổi gì?"
          defaultValue={goal.reviewNext}
          placeholder="Nấu sẵn tối Chủ nhật cho ba ngày đầu tuần."
        />

        <div className="flex justify-end">
          <SubmitButton>Lưu lời tự sự</SubmitButton>
        </div>
      </form>
    </Disclosure>
  );
}

function Field({
  name,
  label,
  hint,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue: string | null;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] text-ink-2">{label}</span>
      {hint && (
        <span className="block text-[12px] leading-relaxed text-ink-3">
          {hint}
        </span>
      )}
      <textarea
        name={name}
        rows={2}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="mt-1.5 w-full resize-y rounded-[var(--radius-sm)] border border-line bg-bg px-3 py-2 text-[15px] leading-relaxed outline-none focus:border-ink-3"
      />
    </label>
  );
}
