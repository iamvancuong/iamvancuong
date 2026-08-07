import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { renderMarkdown } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "Hướng dẫn sử dụng",
};

/**
 * Trang hướng dẫn đọc THẲNG từ `docs/HUONG-DAN.md` — một nguồn sự thật duy nhất.
 * Sửa file markdown đó là trang này đổi theo, khỏi giữ hai bản lệch nhau.
 * Nằm trong `/os` nên chỉ chủ nhân xem được (middleware chặn) và không index.
 */
export default async function GuidePage() {
  const md = fs.readFileSync(
    path.join(process.cwd(), "docs", "HUONG-DAN.md"),
    "utf8",
  );
  const html = await renderMarkdown(md);

  return (
    <div className="max-w-[68ch]">
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
