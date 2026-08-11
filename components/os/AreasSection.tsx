import { ChevronDown, ChevronUp, Eye, EyeOff, Timer } from "lucide-react";
import type { Area } from "@prisma/client";
import {
  createArea,
  deleteArea,
  reorderArea,
  toggleAreaActive,
  toggleAreaStudy,
  updateArea,
} from "@/lib/os/areaActions";
import {
  ConfirmButton,
  MicroLabel,
  SubmitButton,
  inputCls,
  inputSmCls,
} from "./formBits";
import { Disclosure } from "./Disclosure";

/**
 * Quản lý Lĩnh vực.
 *
 * Đặt ở /os/data chứ không phải một mục riêng trên thanh bên: thêm hay tắt một
 * lĩnh vực là việc làm vài lần một năm, mà thanh bên đang giữ đúng vòng lặp
 * hằng ngày. Thêm mục thứ tám vào đó là đổi một thứ dùng mỗi ngày để phục vụ
 * một thứ dùng mỗi nửa năm.
 */

/** Số bản ghi treo vào một lĩnh vực, tách theo cái sẽ mất và cái sẽ ở lại. */
export type AreaCounts = {
  /** Xóa lĩnh vực là mất theo (onDelete: Cascade) */
  cascade: { goals: number; principles: number; items: number; metrics: number };
  /** Vẫn còn, chỉ mất nhãn lĩnh vực (onDelete: SetNull) */
  orphan: { memories: number; photos: number; focusItems: number };
};

export type AreaWithCounts = Area & { counts: AreaCounts };

const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);

/**
 * Câu hỏi lại trước khi xóa — phải nói RÕ hai loại hậu quả, vì chúng khác hẳn
 * nhau và người bấm không có cách nào tự biết cái nào rơi vào loại nào.
 */
function confirmText(a: AreaWithCounts): string {
  const lost = sum(a.counts.cascade);
  const kept = sum(a.counts.orphan);

  const parts = [`Xóa hẳn lĩnh vực "${a.name}"?`];

  if (lost > 0) {
    const { goals, principles, items, metrics } = a.counts.cascade;
    const detail = [
      goals && `${goals} mục tiêu`,
      principles && `${principles} nguyên tắc`,
      items && `${items} món đang dùng`,
      metrics && `${metrics} số đo (kèm mọi lần ghi)`,
    ]
      .filter(Boolean)
      .join(" · ");
    parts.push(`MẤT THEO: ${detail}.`);
  }

  if (kept > 0) {
    const { memories, photos, focusItems } = a.counts.orphan;
    const detail = [
      memories && `${memories} ký ức`,
      photos && `${photos} ảnh`,
      focusItems && `${focusItems} việc trong Focus`,
    ]
      .filter(Boolean)
      .join(" · ");
    parts.push(`GIỮ LẠI nhưng mất nhãn lĩnh vực: ${detail}.`);
  }

  parts.push("Không hoàn tác được. Muốn tạm gác thì bấm Ẩn thay vì xóa.");
  return parts.join("\n\n");
}

export function AreasSection({ areas }: { areas: AreaWithCounts[] }) {
  return (
    <section>
      <h2 className="mb-1">
        <MicroLabel>Lĩnh vực</MicroLabel>
      </h2>
      <p className="mb-3 text-[13px] leading-relaxed text-ink-3">
        Thanh bên sinh thẳng từ bảng này — thêm một dòng ở đây là nó tự hiện,
        không sửa dòng code nào. <strong className="font-medium">Ẩn</strong> chỉ
        bỏ khỏi thanh bên: dữ liệu còn nguyên và trang vẫn mở được bằng địa chỉ
        trực tiếp.
      </p>

      <ul className="divide-y divide-line-soft rounded-[var(--radius-lg)] border border-line">
        {areas.map((a, i) => (
          <li key={a.id} className="p-3">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span
                    className={`text-[15px] font-medium ${a.active ? "" : "text-ink-3"}`}
                  >
                    {a.name}
                  </span>
                  <code className="text-[12px] text-ink-3">/{a.slug}</code>
                  {!a.active && (
                    <span className="text-[12px] text-ink-3">· đang ẩn</span>
                  )}
                </div>

                {a.tagline && (
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">
                    {a.tagline}
                  </p>
                )}

                <p className="mt-1 text-[12px] tabular-nums text-ink-3">
                  {sum(a.counts.cascade) + sum(a.counts.orphan)} bản ghi
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <form action={reorderArea.bind(null, a.id, "up")}>
                  <MoveButton dir="up" disabled={i === 0} name={a.name} />
                </form>
                <form action={reorderArea.bind(null, a.id, "down")}>
                  <MoveButton
                    dir="down"
                    disabled={i === areas.length - 1}
                    name={a.name}
                  />
                </form>
                {/* Bật bấm giờ pomodoro cho lĩnh vực này. Tắt hết theo mặc
                    định — chỉ lĩnh vực được tick mới thấy hàng ô pomodoro và
                    cụm ô đợt học. Đây là chỗ DUY NHẤT quyết định điều đó;
                    không slug nào bị hard-code trong code. */}
                <form action={toggleAreaStudy.bind(null, a.id)}>
                  <button
                    type="submit"
                    aria-pressed={a.tracksStudy}
                    aria-label={
                      a.tracksStudy
                        ? `Tắt bấm giờ cho ${a.name}`
                        : `Bật bấm giờ cho ${a.name}`
                    }
                    title={
                      a.tracksStudy
                        ? "Đang bấm giờ — bấm để tắt"
                        : "Bật pomodoro + đợt học cho lĩnh vực này"
                    }
                    className={`p-1 transition-colors ${
                      a.tracksStudy ? "text-ink" : "text-ink-3 hover:text-ink"
                    }`}
                  >
                    <Timer size={15} strokeWidth={1.75} />
                  </button>
                </form>
                <form action={toggleAreaActive.bind(null, a.id)}>
                  <button
                    type="submit"
                    aria-label={a.active ? `Ẩn ${a.name}` : `Hiện ${a.name}`}
                    title={a.active ? "Ẩn khỏi thanh bên" : "Hiện lại"}
                    className="p-1 text-ink-3 transition-colors hover:text-ink"
                  >
                    {a.active ? (
                      <Eye size={15} strokeWidth={1.75} />
                    ) : (
                      <EyeOff size={15} strokeWidth={1.75} />
                    )}
                  </button>
                </form>
              </div>
            </div>

            <Disclosure label="Sửa" small>
              <div className="space-y-3 rounded-[var(--radius-lg)] border border-line p-3">
                <form
                  action={updateArea.bind(null, a.id)}
                  className="space-y-2"
                >
                  <AreaFields area={a} />
                  <div className="flex justify-end">
                    <SubmitButton>Lưu</SubmitButton>
                  </div>
                </form>

                <form
                  action={deleteArea.bind(null, a.id)}
                  className="border-t border-line-soft pt-3"
                >
                  <ConfirmButton
                    label={`Xóa lĩnh vực ${a.name}`}
                    confirm={confirmText(a)}
                    className="text-[12px] text-ink-3 hover:text-down"
                  >
                    Xóa lĩnh vực này
                  </ConfirmButton>
                </form>
              </div>
            </Disclosure>
          </li>
        ))}
      </ul>

      <Disclosure label="+ Thêm lĩnh vực">
        <form
          action={createArea}
          className="space-y-2 rounded-[var(--radius-lg)] border border-line p-3"
        >
          <AreaFields />
          <p className="text-[12px] leading-relaxed text-ink-3">
            Địa chỉ trang sinh tự động từ tên và{" "}
            <strong className="font-medium">không đổi được về sau</strong> — nó
            là đường dẫn thật, đổi là làm chết mọi link đã lưu. Tên hiển thị thì
            sửa lúc nào cũng được.
          </p>
          <div className="flex justify-end">
            <SubmitButton>Thêm lĩnh vực</SubmitButton>
          </div>
        </form>
      </Disclosure>
    </section>
  );
}

function MoveButton({
  dir,
  disabled,
  name,
}: {
  dir: "up" | "down";
  disabled: boolean;
  name: string;
}) {
  const Icon = dir === "up" ? ChevronUp : ChevronDown;
  return (
    <button
      type="submit"
      disabled={disabled}
      aria-label={`Chuyển ${name} ${dir === "up" ? "lên trên" : "xuống dưới"}`}
      className="p-1 text-ink-3 transition-colors hover:text-ink disabled:opacity-25 disabled:hover:text-ink-3"
    >
      <Icon size={15} strokeWidth={2} />
    </button>
  );
}

/**
 * Dùng chung cho form thêm và form sửa — hai bên không lệch nhau được.
 *
 * Ô «câu hỏi» không phải trang trí: mỗi lĩnh vực trả lời đúng một câu hỏi, và
 * viết được câu đó ra là phép thử xem lĩnh vực này có đáng tồn tại không.
 */
function AreaFields({ area }: { area?: Area }) {
  return (
    <>
      <input
        name="name"
        required
        defaultValue={area?.name ?? ""}
        placeholder="Tên lĩnh vực — vd: Trường học"
        className={inputCls}
      />
      <input
        name="tagline"
        defaultValue={area?.tagline ?? ""}
        placeholder="Câu hỏi mà lĩnh vực này trả lời — vd: Tôi có đang theo kịp trên lớp không?"
        aria-label="Câu hỏi của lĩnh vực"
        className={inputSmCls}
      />
      <input
        name="icon"
        defaultValue={area?.icon ?? ""}
        placeholder="icon — tên trong lucide, vd: GraduationCap (để trống thì dùng chấm tròn)"
        aria-label="Icon"
        className={inputSmCls}
      />
    </>
  );
}
