"use client";

import { useState, type FormEvent } from "react";
import { SendHorizontal } from "lucide-react";
import { home, type Lang } from "@/lib/home";

type State = "idle" | "sending" | "ok" | "error";

export function ContactForm({ lang }: { lang: Lang }) {
  const jl = lang === "ja" ? "ja" : undefined;
  const t = home.contact.form;
  const [state, setState] = useState<State>("idle");
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setState("sending");
    setErr("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          message: fd.get("message"),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErr(data.error || t.error[lang]);
        setState("error");
        return;
      }
      form.reset();
      setState("ok");
    } catch {
      setErr(t.error[lang]);
      setState("error");
    }
  }

  if (state === "ok") {
    return (
      <div className="mt-8 overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface">
        <TerminalBar />
        <p lang={jl} className="px-5 py-8 text-[16px] text-ink">
          {t.success[lang]}
        </p>
      </div>
    );
  }

  /**
   * Ô nhập KHÔNG viền, chỉ có đường kẻ ngăn giữa các dòng.
   *
   * Ba ô viền bo tròn xếp dọc đọc ra là "biểu mẫu" — thứ ai cũng ngại điền.
   * Bỏ viền và đặt tất cả trong một khung terminal thì nó đọc ra là một CỬA SỔ
   * đang chờ gõ, và cửa sổ thì không có cảm giác phải khai báo gì cả.
   */
  const field =
    "w-full border-0 bg-transparent px-5 py-3 text-[15px] text-ink placeholder:text-ink-3 focus:outline-none";

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface text-left"
    >
      <TerminalBar />

      <div className="tag border-b border-line-soft px-5 py-3 leading-relaxed">
        DIRECT_TERMINAL v1.0 — kết nối trực tiếp
        <br />
        Không form. Gõ lời nhắn, để lại tên và email nếu muốn được trả lời.
      </div>

      <div className="divide-y divide-line-soft">
        <input name="name" maxLength={100} placeholder={t.name[lang]} lang={jl} className={field} />
        <input name="email" type="email" maxLength={200} placeholder={t.email[lang]} className={field} />
        <textarea
          name="message"
          required
          rows={5}
          maxLength={4000}
          placeholder={t.message[lang]}
          lang={jl}
          className={`${field} resize-y`}
        />
      </div>

      {state === "error" && (
        <p lang={jl} className="border-t border-line-soft px-5 py-2.5 text-[13px] text-down">
          {err}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-line-soft px-5 py-3">
        <span className="tag">{t.message[lang]}</span>
        <button
          type="submit"
          disabled={state === "sending"}
          lang={jl}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-2 text-[14px] font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <SendHorizontal size={14} strokeWidth={2} />
          {state === "sending" ? t.sending[lang] : t.submit[lang]}
        </button>
      </div>
    </form>
  );
}

/**
 * Thanh tiêu đề cửa sổ: ba chấm bên trái, dấu nhắc lệnh bên phải.
 *
 * Ba chấm là quy ước ai cũng đọc được ngay — nó nói "đây là một cửa sổ" mà
 * không cần một chữ nào. Dùng ở CẢ hai trạng thái (form và lời cảm ơn) để
 * khung không đổi hình khi gửi xong.
 */
function TerminalBar() {
  return (
    <div className="flex items-center gap-2 border-b border-line-soft bg-surface-2/60 px-4 py-2.5">
      <span className="size-2.5 rounded-full bg-ink-3/35" />
      <span className="size-2.5 rounded-full bg-ink-3/35" />
      <span className="size-2.5 rounded-full bg-accent/70" />
      <span className="tag ml-2">cuong@archive:~$</span>
    </div>
  );
}
