import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * `/now` là nguồn duy nhất cho "3 việc đang tập trung".
 * Home đọc lại chính file này — một thông tin chỉ nhập một lần. (PLAN §7)
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

export function getNow(): Now {
  const file = path.join(process.cwd(), "content", "now.md");
  const { data, content } = matter(fs.readFileSync(file, "utf8"));

  const focus = ((data.focus ?? []) as Focus[]).slice(0, 3); // §7: cứng 3, không hơn

  return {
    updated: String(data.updated ?? ""),
    focus,
    body: content,
  };
}
