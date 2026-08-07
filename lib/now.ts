import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Lang } from "@/lib/i18n";

/**
 * `/now` là nguồn duy nhất cho "3 việc đang tập trung".
 * Home đọc lại chính file này — một thông tin chỉ nhập một lần. (PLAN §7)
 *
 * Song ngữ: `now.md` (VI) và `now.ja.md` (JA, AI nháp). Thiếu file JA thì tự
 * lùi về bản VI để không vỡ trang.
 */

export type Focus = {
  area: string;
  title: string;
  detail?: string;
};

export type Now = {
  updated: string;
  focus: Focus[];
  body: string;
};

export function getNow(lang: Lang = "vi"): Now {
  const dir = path.join(process.cwd(), "content");
  const file =
    lang === "ja" && fs.existsSync(path.join(dir, "now.ja.md"))
      ? path.join(dir, "now.ja.md")
      : path.join(dir, "now.md");
  const { data, content } = matter(fs.readFileSync(file, "utf8"));

  const focus = ((data.focus ?? []) as Focus[]).slice(0, 3); // §7: cứng 3, không hơn

  return {
    updated: String(data.updated ?? ""),
    focus,
    body: content,
  };
}
