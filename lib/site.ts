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
    facebook: "https://www.facebook.com/iamvancuong",
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
