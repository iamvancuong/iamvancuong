import { experiences } from "./projects";

/**
 * Dữ liệu CV (履歴書/職務経歴書 kiểu Nhật). Bản ghi dễ đọc ở `content/cv.md`.
 * Kinh nghiệm dùng chung `experiences` trong `lib/projects.ts`.
 * ⚠️ Bản JA là AI nháp — chủ nhân rà lại.
 */
export { experiences };

export const cv = {
  name: { vi: "Trương Văn Cường", ja: "トゥオン・ヴァン・クオン" },
  kana: "トゥオン・ヴァン・クオン",
  title: { vi: "Lập trình viên Fullstack", ja: "フルスタックエンジニア" },
  birthDate: "29/11/2003",
  nationality: { vi: "Việt Nam", ja: "ベトナム" },
  email: "vancuongit2021@gmail.com",
  phone: "090-6897-5994",
  address: "〒454-0826 愛知県名古屋市中川区小本本町2丁目63",

  summary: {
    vi: "Lập trình viên Fullstack với khoảng 3 năm kinh nghiệm, chuyên Laravel và Angular. Mạnh về kiến trúc sạch (Service-Repository, Queue/Event), tối ưu hiệu năng (Redis, caching) và tích hợp cloud (AWS S3/CloudFront). Từng dẫn dắt phát triển và bảo trì các hệ thống HRM phục vụ hơn 150 người dùng.",
    ja: "Laravel・Angularを中心に約3年の経験を持つフルスタックエンジニアです。クリーンな設計（Service-Repository、Queue/Event）、性能最適化（Redis・キャッシュ）、クラウド連携（AWS S3/CloudFront）を得意とし、150名以上が利用するHRMシステムの開発・保守をリードしてきました。",
  },

  skills: [
    {
      label: { vi: "Backend", ja: "バックエンド" },
      items: ["Laravel (Architecture, Service-Repository, Queue, Event)", "RESTful API"],
    },
    {
      label: { vi: "Frontend", ja: "フロントエンド" },
      items: ["Angular", "jQuery", "Ajax", "Blade Template", "Bootstrap"],
    },
    {
      label: { vi: "Database", ja: "データベース" },
      items: ["MySQL", "Redis (cache, queue)"],
    },
    {
      label: { vi: "Cloud & DevOps", ja: "クラウド・DevOps" },
      items: ["AWS S3", "CloudFront", "Docker", "CI/CD"],
    },
    {
      label: { vi: "Chất lượng code", ja: "コード品質" },
      items: ["Code Review", "Refactor", "Documentation", "Mentoring"],
    },
  ],

  education: [
    {
      school: { vi: "Đại học Mỏ - Địa chất", ja: "ハノイ鉱山地質大学" },
      major: { vi: "Công nghệ Thông tin", ja: "情報技術" },
      period: "10/2021 – 01/2026",
      note: "GPA 3.15",
    },
  ],

  languages: [
    { label: { vi: "Tiếng Việt", ja: "ベトナム語" }, level: { vi: "Bản ngữ", ja: "母語" } },
    { label: { vi: "Tiếng Nhật", ja: "日本語" }, level: { vi: "Đang học · mục tiêu N3", ja: "学習中・N3目標" } },
  ],
} as const;
