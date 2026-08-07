"use client";

import { useState, type FormEvent } from "react";
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
      <p
        lang={jl}
        className="mx-auto mt-8 max-w-[520px] rounded-3xl border border-line bg-surface px-6 py-8 text-[16px] text-ink"
      >
        {t.success[lang]}
      </p>
    );
  }

  const field =
    "w-full rounded-2xl border border-line bg-bg px-4 py-3 text-[15px] text-ink placeholder:text-ink-3 transition-colors focus:border-ink focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 grid max-w-[520px] gap-3 text-left">
      <input name="name" maxLength={100} placeholder={t.name[lang]} lang={jl} className={field} />
      <input name="email" type="email" maxLength={200} placeholder={t.email[lang]} className={field} />
      <textarea name="message" required rows={4} maxLength={4000} placeholder={t.message[lang]} lang={jl} className={`${field} resize-y`} />
      {state === "error" && (
        <p lang={jl} className="text-[13px] text-down">
          {err}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        lang={jl}
        className="mt-1 inline-flex items-center justify-center rounded-full bg-ink px-7 py-3 text-[15px] font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {state === "sending" ? t.sending[lang] : t.submit[lang]}
      </button>
    </form>
  );
}
