import { PrincipleKind, type Principle } from "@prisma/client";
import { X } from "lucide-react";
import {
  createPrinciple,
  deletePrinciple,
  updatePrinciple,
} from "@/lib/os/actions";
import {
  ConfirmButton,
  EmptyNote,
  SubmitButton,
  inputCls,
  inputSmCls,
} from "./formBits";
import { Disclosure } from "./Disclosure";

/**
 * Nguyên tắc KHÔNG phải to-do — không tick hằng ngày.
 * Đây là thứ để đọc lại lúc đang phân vân. (OS-DESIGN §3)
 */
export function PrinciplesTab({
  slug,
  principles,
}: {
  slug: string;
  principles: Principle[];
}) {
  const dos = principles.filter((p) => p.kind === PrincipleKind.DO);
  const donts = principles.filter((p) => p.kind === PrincipleKind.DONT);

  return (
    <div className="space-y-8">
      {principles.length === 0 ? (
        <EmptyNote>
          Chưa có nguyên tắc nào ở đây. Chỉ viết khi bạn thật sự rút ra được
          điều gì — nguyên tắc chép từ sách về thì không có tác dụng.
        </EmptyNote>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          <Column title="Nên" items={dos} slug={slug} />
          <Column title="Không nên" items={donts} slug={slug} />
        </div>
      )}

      <Disclosure label="+ Thêm nguyên tắc">
        <form
          action={createPrinciple.bind(null, slug)}
          className="space-y-2 rounded-[var(--radius-lg)] border border-line p-3"
        >
          <PrincipleFields />
          <div className="flex justify-end">
            <SubmitButton>Thêm</SubmitButton>
          </div>
        </form>
      </Disclosure>
    </div>
  );
}

function Column({
  title,
  items,
  slug,
}: {
  title: string;
  items: Principle[];
  slug: string;
}) {
  return (
    <section>
      <h3 className="mb-3 border-b border-line-soft pb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-[14px] text-ink-3">Trống.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((p) => (
            <li key={p.id} className="group flex items-start gap-2">
              <span className="mt-[9px] size-1 shrink-0 rounded-full bg-ink-3" />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] leading-snug">{p.text}</div>
                {p.why && (
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
                    {p.why}
                  </p>
                )}

                <Disclosure label="Sửa" small>
                  <form
                    action={updatePrinciple.bind(null, p.id, slug)}
                    className="space-y-2 rounded-[var(--radius-lg)] border border-line p-3"
                  >
                    <PrincipleFields principle={p} />
                    <div className="flex justify-end">
                      <SubmitButton>Lưu</SubmitButton>
                    </div>
                  </form>
                </Disclosure>
              </div>

              <form action={deletePrinciple.bind(null, p.id, slug)}>
                <ConfirmButton
                  label={`Xóa: ${p.text}`}
                  confirm={`Xóa nguyên tắc "${p.text}"?`}
                  className="p-1 text-transparent group-hover:text-ink-3 hover:!text-down"
                >
                  <X size={14} strokeWidth={2} />
                </ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Dùng chung cho form thêm và form sửa — hai bên không lệch nhau được. */
function PrincipleFields({ principle }: { principle?: Principle }) {
  return (
    <>
      <input
        name="text"
        required
        defaultValue={principle?.text ?? ""}
        placeholder="Nguyên tắc là gì?"
        className={inputCls}
      />
      <input
        name="why"
        defaultValue={principle?.why ?? ""}
        placeholder="Vì sao? (viết ra thì sau này đọc lại mới thấy có lý)"
        className={inputSmCls}
      />
      <select
        name="kind"
        defaultValue={principle?.kind ?? PrincipleKind.DO}
        aria-label="Nên hay không nên"
        className="rounded-[var(--radius-sm)] border border-line bg-bg px-3 py-2 text-[14px] outline-none focus:border-ink-3"
      >
        <option value={PrincipleKind.DO}>Nên</option>
        <option value={PrincipleKind.DONT}>Không nên</option>
      </select>
    </>
  );
}
