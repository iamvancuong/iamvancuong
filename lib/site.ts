/**
 * Cấu hình chung của site. Sửa ở đây, không hard-code rải rác trong page.
 */
export const site = {
  name: "Cường",
  fullName: "Trương Văn Cường",
  /** Dùng để tính tuổi và các mốc mục tiêu (25 tuổi, 30 tuổi...) trong /os */
  birthDate: "2003-11-29",
  hometown: "Quảng Trị",
  domain: "iamvancuong.com",
  url: "https://iamvancuong.com",
  tagline: "Du học sinh người Việt tại Nhật.",
  taglineJa: "日本で学ぶベトナム人留学生です。",
  description:
    "Tôi học tiếng Nhật, học lập trình, và ghi lại toàn bộ quá trình — kể cả những đoạn chưa đẹp.",
  descriptionJa:
    "日本語とプログラミングを学びながら、その過程を——うまくいかない部分も含めて——ここに記録しています。",
  locale: "vi_VN",

  /**
   * Điền dần khi có. Để chuỗi rỗng thì link tự ẩn khỏi footer.
   *
   * Thứ tự khai ở đây CHÍNH LÀ thứ tự hiện trong footer — xếp theo mức liên
   * quan tới mục tiêu việc IT ở Nhật, không xếp theo bảng chữ cái.
   */
  social: {
    github: "https://github.com/iamvancuong",
    linkedin: "https://www.linkedin.com/in/iamvancuong",
    /** Người tuyển dụng sẽ gõ địa chỉ này. Đổi được lúc nào cũng được — chỗ
     *  duy nhất nó xuất hiện là footer, sinh ra từ đúng dòng này. */
    email: "vancuongit2021@gmail.com",
    instagram: "https://www.instagram.com/iamvancuong",
    youtube: "https://www.youtube.com/@iamvancuong",
    tiktok: "https://www.tiktok.com/@iamvancuong",
    facebook: "https://www.facebook.com/iamvancuong",
  },
} as const;

// Nhãn song ngữ. ⚠️ Bản JA là AI nháp — chủ nhân rà lại.
export const nav = [
  { href: "/now", label: { vi: "Dạo này", ja: "いま" } },
  { href: "/blog", label: { vi: "Viết", ja: "ブログ" } },
  { href: "/journey", label: { vi: "Hành trình", ja: "歩み" } },
  { href: "/photos", label: { vi: "Ảnh", ja: "写真" } },
  { href: "/projects", label: { vi: "Dự án", ja: "プロジェクト" } },
  { href: "/cv", label: { vi: "CV", ja: "履歴書" } },
  { href: "/about", label: { vi: "Giới thiệu", ja: "自己紹介" } },
] as const;
