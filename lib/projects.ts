/**
 * PLAN §7 — mỗi project chỉ cần: tên, mô tả, stack, vấn đề, đã build gì,
 * link. Không làm portfolio kiểu corporate.
 *
 * Thêm project mới = thêm một object vào mảng này.
 */

export type Project = {
  slug: string;
  name: string;
  year: string;
  status: "đang làm" | "đang chạy" | "tạm dừng";
  summary: string;
  stack: string[];
  problem: string;
  built: string[];
  repo?: string;
  demo?: string;
};

export const projects: Project[] = [
  {
    slug: "iamvancuong",
    name: "iamvancuong.com",
    year: "2026",
    status: "đang làm",
    summary:
      "Trang cá nhân kiêm hệ thống quản lý cuộc sống của chính tôi. Vừa là nơi viết, vừa là công cụ tôi dùng hằng ngày.",
    stack: ["Next.js 16", "TypeScript", "Tailwind CSS v4", "Prisma", "MySQL"],
    problem:
      "Tôi có quá nhiều mục tiêu cùng lúc và không thứ nào đi tới đâu. Tôi cần một chỗ buộc mình phải chọn ra ba việc quan trọng nhất, và một chỗ để ghi lại quá trình thay vì để nó trôi đi.",
    built: [
      "Một codebase, hai vùng: trang công khai và Life OS riêng tư sau đăng nhập. Chung một database, phân biệt nhau bằng đúng một cột `visibility` — viết một lần, tick vào thì hiện ra ngoài.",
      "Đăng nhập tự viết bằng JWT ký và cookie httpOnly, không dùng thư viện auth. Mọi server action tự kiểm quyền, không ỷ vào middleware.",
      "Ràng buộc nằm trong server chứ không nằm trong giao diện: mục «đang tập trung» bị chặn cứng ở ba việc, sửa DOM cũng không lách được.",
      "Bảy lĩnh vực cuộc sống dùng chung một trang duy nhất — thêm lĩnh vực mới là thêm một dòng dữ liệu, không sửa dòng code nào.",
      "Ảnh tự nén sang WebP kèm thumbnail, xoay theo EXIF, và kiểm quyền từng tấm một.",
      "Hỗ trợ song ngữ Việt–Nhật ở mức từng bài: bài nào có bản tiếng Nhật thì mới sinh ra URL tiếng Nhật.",
      "Design system tự viết bằng Tailwind, không dùng thư viện component ngoài.",
    ],
    repo: "",
    demo: "https://iamvancuong.com",
  },
];
