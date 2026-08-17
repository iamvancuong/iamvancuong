import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ProfileView } from "@/components/profile/ProfileView";
import { renderMarkdown } from "@/lib/markdown";
import { projects } from "@/lib/projects";

/**
 * Trang «Hồ sơ» — gộp /projects + /cv + /about (xem lý do ở `ProfileView`).
 *
 * Địa chỉ GIỮ NGUYÊN là `/projects`: nó đã nằm trong sitemap, trong link ở
 * trang chủ, và có thể đã được đánh chỉ mục. Đổi URL để cho khớp một cái nhãn
 * mới là trả một giá thật (mọi link cũ đi qua một bước nhảy) cho một lợi ích
 * chỉ có mình mình thấy. `/cv` và `/about` chuyển hướng 308 sang đây —
 * xem `next.config.ts`.
 */
export const metadata: Metadata = {
  title: "Hồ sơ",
  description:
    "Kinh nghiệm, dự án và giới thiệu — Trương Văn Cường, Lập trình viên Fullstack. Tải CV bản tiếng Việt hoặc tiếng Nhật.",
  alternates: { canonical: "/projects" },
};

function read(file: string) {
  return fs.readFileSync(path.join(process.cwd(), "content", file), "utf8");
}

export default async function ProfilePage() {
  const [aboutVi, aboutJa] = await Promise.all([
    renderMarkdown(read("about.md")),
    renderMarkdown(read("about.ja.md")),
  ]);

  // Khung RỘNG, không phải khung đọc 720px: trang này gần như toàn thẻ hai
  // cột. Riêng phần «Ngoài CV» tự kẹp lại 720px vì nó là thứ để đọc.
  return (
    <Container>
      <ProfileView projects={projects} aboutVi={aboutVi} aboutJa={aboutJa} />
    </Container>
  );
}
