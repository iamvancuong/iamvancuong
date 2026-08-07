"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * `?from=` do middleware đặt nên luôn là đường dẫn nội bộ. Nhưng ai cũng gõ
 * được tham số đó vào URL, nên phải tự kiểm: `?from=https://…` hay `?from=//…`
 * sẽ đẩy bạn sang site lạ ngay sau khi đăng nhập — đúng kiểu bẫy lừa mật khẩu.
 * Chỉ nhận đường dẫn bắt đầu bằng một dấu `/`.
 */
function safeFrom(from: string | null): string {
  if (!from || !from.startsWith("/") || from.startsWith("//")) return "/os";
  return from;
}

export function LoginForm() {
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      // Tải CỨNG sang /os thay vì điều hướng client: đảm bảo server render mới
      // với cookie vừa đặt, không dính RSC cache cũ (trước khi đăng nhập) khiến
      // phải F5 mới vào được. Không tắt `busy` vì trang sắp rời đi.
      window.location.assign(safeFrom(params.get("from")));
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Không đăng nhập được.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-8 space-y-3">
      <input
        type="password"
        autoFocus
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mật khẩu"
        className="w-full rounded-[var(--radius-md)] border border-line px-3 py-2.5 text-[16px] outline-none focus:border-ink-3"
      />

      <button
        type="submit"
        disabled={busy || !password}
        className="w-full rounded-[var(--radius-md)] bg-ink py-2.5 text-[14px] font-medium text-bg transition-opacity disabled:opacity-30"
      >
        {busy ? "Đang kiểm tra…" : "Vào"}
      </button>

      {error && <p className="text-[13px] leading-relaxed text-down">{error}</p>}
    </form>
  );
}
