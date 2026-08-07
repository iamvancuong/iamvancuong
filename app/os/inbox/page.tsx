import type { Metadata } from "next";
import { db } from "@/lib/db";
import { InboxList, type InboxMessage } from "@/components/os/InboxList";

export const metadata: Metadata = { title: "Hộp thư" };

function fmt(d: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(d);
}

export default async function InboxPage() {
  const rows = await db.contactMessage.findMany({
    orderBy: [{ read: "asc" }, { createdAt: "desc" }],
  });

  const messages: InboxMessage[] = rows.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    message: m.message,
    read: m.read,
    when: fmt(m.createdAt),
  }));

  const unread = rows.filter((m) => !m.read).length;

  return (
    <div className="max-w-[680px] space-y-8">
      <header className="border-b border-line pb-5">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Hộp thư liên hệ</h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">
          Tin nhắn gửi từ form liên hệ ở trang chủ.
          {unread > 0 ? ` Có ${unread} tin chưa đọc.` : " Đã đọc hết."}
        </p>
      </header>

      <InboxList messages={messages} />
    </div>
  );
}
