/**
 * Cấu hình chung của site. Sửa ở đây, không hard-code rải rác trong page.
 */
export const site = {
  name: "Cường",
  fullName: "Trương Văn Cường",
  /** Dùng để tính tuổi và các mốc mục tiêu (25 tuổi, 30 tuổi...) trong /os */
  birthDate: "2003-07-06",
  hometown: "Quảng Trị",
  domain: "iamvancuong.com",
  url: "https://iamvancuong.com",
  tagline: "Người Việt đang xây sự nghiệp IT ở Nhật.",
  description:
    "Tôi học tiếng Nhật, học lập trình, và ghi lại toàn bộ quá trình — kể cả những đoạn chưa đẹp.",
  locale: "vi_VN",

  /** Điền dần khi có. Để chuỗi rỗng thì link tự ẩn. */
  social: {
    github: "",
    email: "",
    instagram: "",
    youtube: "",
  },
} as const;

export const nav = [
  { href: "/now", label: "Now" },
  { href: "/blog", label: "Viết" },
  { href: "/journey", label: "Hành trình" },
  { href: "/photos", label: "Ảnh" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
] as const;
