"use client";

import { Mail, MailOpen, Trash2 } from "lucide-react";
import { toggleContactRead, deleteContactMessage } from "@/lib/os/contactActions";

export type InboxMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  when: string; // đã format sẵn ở server
};

export function InboxList({ messages }: { messages: InboxMessage[] }) {
  if (messages.length === 0) {
    return (
      <p className="rounded-[var(--radius-lg)] border border-line bg-surface px-4 py-8 text-center text-[14px] text-ink-3">
        Chưa có tin nhắn nào. Khi có người gửi qua form liên hệ ở trang chủ, tin sẽ hiện ở đây.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {messages.map((m) => (
        <li
          key={m.id}
          className={`rounded-[var(--radius-lg)] border p-4 ${
            m.read ? "border-line bg-bg" : "border-ink/15 bg-surface"
          }`}
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {!m.read && (
              <span className="size-2 shrink-0 rounded-full bg-accent" aria-label="Chưa đọc" />
            )}
            <span className="text-[15px] font-semibold text-ink">{m.name}</span>
            <a
              href={`mailto:${m.email}`}
              className="text-[13px] text-accent underline underline-offset-2"
            >
              {m.email}
            </a>
            <span className="ml-auto text-[12px] tabular-nums text-ink-3">{m.when}</span>
          </div>

          <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink-2">
            {m.message}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <form action={toggleContactRead}>
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="read" value={m.read ? "0" : "1"} />
              <button
                type="submit"
                className="flex items-center gap-1.5 text-[13px] text-ink-2 transition-colors hover:text-ink"
              >
                {m.read ? (
                  <>
                    <Mail size={14} strokeWidth={1.75} /> Đánh dấu chưa đọc
                  </>
                ) : (
                  <>
                    <MailOpen size={14} strokeWidth={1.75} /> Đánh dấu đã đọc
                  </>
                )}
              </button>
            </form>

            <form
              action={deleteContactMessage}
              onSubmit={(e) => {
                if (!confirm(`Xóa tin nhắn của ${m.name}?`)) e.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={m.id} />
              <button
                type="submit"
                className="flex items-center gap-1.5 text-[13px] text-ink-3 transition-colors hover:text-down"
              >
                <Trash2 size={14} strokeWidth={1.75} /> Xóa
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
