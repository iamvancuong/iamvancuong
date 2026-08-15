"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Eye, Pencil } from "lucide-react";
import type { DailyLog } from "@prisma/client";
import { saveDailyLog } from "@/lib/os/dayActions";
import { fmtH } from "@/lib/os/day";
import { jpTotal } from "@/lib/os/japanese";
import { renderMarkdown } from "@/lib/markdown";

/**
 * Không có nút Lưu.
 *
 * Ô tick lưu ngay khi bấm; ô chữ và ô số lưu khi rời khỏi ô. Cả form gửi
 * cùng lúc nên chỉ cần một server action, không phải một action cho mỗi
 * trường.
 */
export function DailyLogForm({
  iso,
  log,
}: {
  iso: string;
  log: DailyLog | null;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [saving, startSaving] = useTransition();
  const [preview, setPreview] = useState(false);

  const submit = () => ref.current?.requestSubmit();

  return (
    <form
      ref={ref}
      action={(fd) => startSaving(() => void saveDailyLog(iso, fd))}
      className="space-y-10"
    >
      <section>
        <Label>
          Số liệu
          <SaveHint saving={saving} />
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Đi ngủ lúc">
            <input
              type="time"
              name="sleepAt"
              defaultValue={log?.sleepAt ?? ""}
              onBlur={submit}
              className={inputCls}
            />
          </Field>
          <Field label="Chi tiêu hôm nay" suffix="¥">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              name="spend"
              defaultValue={log?.spend ?? ""}
              onBlur={submit}
              className={inputCls}
            />
          </Field>
          {/* ⚠️ Số hiệp KHÔNG nhập ở đây — nó là hàng ô pomodoro ở đầu trang.
              Có hai đường ghi vào cùng một con số là hai con số trôi khỏi nhau.
              Ô dưới là phút LẺ, không phải tổng: tổng = hiệp × 50 + ô này.
              Podcast trên tàu, nói chuyện, xem phim — học thật nhưng không
              thành hiệp. */}
          <Field label="Tiếng Nhật, phút lẻ" suffix="phút">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              name="jpMin"
              defaultValue={log?.jpMin || ""}
              onBlur={submit}
              className={inputCls}
            />
          </Field>
          <Field label="IT" suffix="phút">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              name="itMin"
              defaultValue={log?.itMin || ""}
              onBlur={submit}
              className={inputCls}
            />
          </Field>
          {/* Tách khỏi «IT»: học IT đẩy mục tiêu việc làm đi, còn xây cái web
              này thì không. Đây là cảm biến của cảnh báo ở Hôm nay. */}
          <Field label="Xây web này" suffix="phút">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              name="webMin"
              defaultValue={log?.webMin || ""}
              onBlur={submit}
              className={inputCls}
            />
          </Field>
        </div>

        {jpTotal(log) > 0 && (
          <p className="mt-2 text-[12px] tabular-nums text-ink-3">
            Tổng tiếng Nhật hôm đó:{" "}
            <strong className="font-medium text-ink-2">{fmtH(jpTotal(log))}</strong>
            {log && log.jpPomo > 0 && ` (${log.jpPomo} hiệp`}
            {log && log.jpPomo > 0 && log.jpMin > 0 && ` + ${log.jpMin}p lẻ`}
            {log && log.jpPomo > 0 && ")"}
          </p>
        )}
      </section>

      <section>
        <Label>Ba việc nền tảng</Label>
        <div className="rounded-[var(--radius-lg)] border border-line p-2">
          <Check name="kSleep" label="Ngủ trước 00:00" defaultChecked={!!log?.kSleep} onToggle={submit} />
          <Check name="kJapanese" label="Tiếng Nhật ≥ 60 phút" defaultChecked={!!log?.kJapanese} onToggle={submit} />
          <Check name="kEat" label="Ăn đủ 3 bữa" defaultChecked={!!log?.kEat} onToggle={submit} />
          <div className="my-1 border-t border-line-soft" />
          <Check name="workout" label="Tập luyện" defaultChecked={!!log?.workout} onToggle={submit} />
        </div>
      </section>

      <section>
        <Label>
          Nhật ký
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className={`ml-auto flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1 text-[12px] normal-case tracking-normal transition-colors ${
              preview
                ? "bg-surface-2 text-ink"
                : "text-ink-3 hover:bg-surface hover:text-ink"
            }`}
          >
            {preview ? <Pencil size={13} /> : <Eye size={13} />}
            {preview ? "Viết tiếp" : "Xem thử"}
          </button>
        </Label>

        {/*
          Ô nhập KHÔNG bị tháo khi xem thử, chỉ bị ẩn bằng CSS.

          Tháo ra thì <textarea> mất khỏi form, nên lần lưu kế tiếp gửi thiếu
          trường — và vì form này lưu lúc rời ô chứ không có nút Lưu, hậu quả
          là ba ô chữ bị ghi đè thành rỗng mà không có gì báo. Ẩn bằng `hidden`
          thì trường vẫn nằm trong form và vẫn được gửi.
        */}
        <div className={preview ? "hidden" : "space-y-4"}>
          <Journal name="journalWhat" label="Hôm nay có gì?" defaultValue={log?.journalWhat ?? ""} onBlur={submit} />
          <Journal name="journalLearn" label="Học được gì?" defaultValue={log?.journalLearn ?? ""} onBlur={submit} />
          <Journal name="journalChange" label="Mai đổi gì?" defaultValue={log?.journalChange ?? ""} onBlur={submit} />
        </div>

        {preview && <JournalPreview form={ref.current} />}

        <div className="mt-4 rounded-[var(--radius-lg)] border border-line p-2">
          <Check
            name="publishable"
            label="Đáng viết thành bài blog"
            hint="Đánh dấu để cuối tuần lọc ra"
            defaultChecked={!!log?.publishable}
            onToggle={submit}
          />
        </div>
      </section>
    </form>
  );
}

/**
 * Xem thử nhật ký ở đúng hình hài một bài blog.
 *
 * Dùng CHÍNH `renderMarkdown` mà trang blog thật dùng — remark chạy được cả
 * trên trình duyệt — nên thứ thấy ở đây bằng đúng thứ sẽ lên trang, không có
 * chuyện lệch vì hai bộ render. Class `.prose` cũng là class của trang bài.
 *
 * Đọc thẳng từ DOM của form chứ không giữ state song song: ba ô là
 * uncontrolled (`defaultValue`), nên state song song sẽ lệch ngay lần gõ đầu.
 */
function JournalPreview({ form }: { form: HTMLFormElement | null }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (!form) return;
    const get = (n: string) =>
      (form.elements.namedItem(n) as HTMLTextAreaElement | null)?.value ?? "";

    const md = [
      ["Hôm nay có gì?", get("journalWhat")],
      ["Học được gì?", get("journalLearn")],
      ["Mai đổi gì?", get("journalChange")],
    ]
      .filter(([, body]) => body.trim())
      .map(([h, body]) => `## ${h}\n\n${body}`)
      .join("\n\n");

    if (!md) {
      setHtml("");
      return;
    }
    let alive = true;
    renderMarkdown(md).then((out) => {
      if (alive) setHtml(out);
    });
    return () => {
      alive = false;
    };
  }, [form]);

  if (!html) {
    return (
      <p className="rounded-[var(--radius-lg)] border border-dashed border-line px-4 py-6 text-center text-[14px] text-ink-3">
        Chưa viết gì để xem thử.
      </p>
    );
  }

  return (
    <article
      className="prose rounded-[var(--radius-lg)] border border-line px-5 py-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const inputCls =
  "mt-1 w-full rounded-[var(--radius-sm)] border border-line bg-bg px-2.5 py-2 text-[16px] tabular-nums outline-none focus:border-ink-3";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex min-h-[26px] items-center gap-2 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
      {children}
    </h2>
  );
}

function SaveHint({ saving }: { saving: boolean }) {
  return (
    <span className="normal-case tracking-normal text-ink-3">
      {saving ? "đang lưu…" : ""}
    </span>
  );
}

function Field({
  label,
  suffix,
  children,
}: {
  label: string;
  suffix?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] text-ink-3">{label}</span>
      <span className="flex items-baseline gap-1.5">
        {children}
        {suffix && <span className="shrink-0 text-[13px] text-ink-3">{suffix}</span>}
      </span>
    </label>
  );
}

function Check({
  name,
  label,
  hint,
  defaultChecked,
  onToggle,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2 py-2.5 transition-colors hover:bg-surface">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        onChange={onToggle}
        className="size-[22px] shrink-0 accent-[var(--color-ink)]"
      />
      <span className="min-w-0">
        <span className="block text-[15px] leading-snug">{label}</span>
        {hint && <span className="block text-[12px] text-ink-3">{hint}</span>}
      </span>
    </label>
  );
}

/**
 * Ô nhật ký — cao gấp ba bản cũ, và tự cao thêm theo nội dung.
 *
 * `rows={2}` cũ là hai dòng: viết tới dòng thứ ba là ô bắt đầu cuộn trong
 * chính nó, che mất phần vừa gõ. Với một ô mà mục đích là *viết dài*, cuộn nội
 * bộ là thứ khiến người ta viết ngắn lại — chỉ vì không nhìn thấy những gì
 * mình đã viết.
 *
 * Tự cao thêm: đặt `height = auto` rồi gán bằng `scrollHeight`. Phải reset về
 * `auto` trước, nếu không ô chỉ phình ra được mà không co lại khi xóa bớt chữ.
 */
function Journal({
  name,
  label,
  defaultValue,
  onBlur,
}: {
  name: string;
  label: string;
  defaultValue: string;
  onBlur: () => void;
}) {
  const grow = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <label className="block">
      <span className="block text-[13px] text-ink-2">{label}</span>
      <textarea
        name={name}
        rows={6}
        defaultValue={defaultValue}
        onBlur={onBlur}
        onInput={(e) => grow(e.currentTarget)}
        // Chiều cao đúng ngay từ lần vẽ đầu, kể cả khi ngày đó đã viết dài sẵn.
        ref={(el) => {
          if (el) grow(el);
        }}
        className="mt-1.5 w-full resize-y overflow-hidden rounded-[var(--radius-sm)] border border-line bg-bg px-3 py-2.5 text-[15px] leading-relaxed outline-none focus:border-ink-3"
      />
    </label>
  );
}
