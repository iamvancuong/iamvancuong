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
  // Chỉ để cấp thành phố cho trang CÔNG KHAI — địa chỉ đầy đủ & SĐT gửi riêng
  // khi ứng tuyển, không phơi trên web (repo GitHub cũng công khai).
  address: { vi: "Nagoya, Aichi", ja: "愛知県名古屋市" },

  summary: {
    vi: "Lập trình viên Fullstack với khoảng 3 năm kinh nghiệm, chuyên Laravel và Angular. Mạnh về kiến trúc sạch (Service-Repository, Queue/Event), tối ưu hiệu năng (Redis, caching) và tích hợp cloud (AWS S3/CloudFront). Từng dẫn dắt phát triển và bảo trì các hệ thống HRM phục vụ hơn 150 người dùng.",
    /**
     * 体言止め、KHÔNG dùng です・ます.
     *
     * 職務経歴書 của Nhật viết ở thể kết bằng danh từ hoặc である体 — です・ます
     * là giọng của thư xin việc (送付状) và của trang web, không phải của hồ sơ
     * năng lực. Sai thể văn ở đây không làm ai hiểu sai nội dung, nhưng nó là
     * thứ người sàng hồ sơ nhận ra trong ba giây đầu.
     *
     * Các gạch đầu dòng trong `lib/projects.ts` vốn đã ở thể này rồi; sửa dòng
     * tóm tắt là để cả file nói cùng một giọng.
     */
    ja: "Laravel・Angularを中心に約3年の開発経験を持つフルスタックエンジニア。クリーンな設計（Service-Repository、Queue/Event）、性能最適化（Redis・キャッシュ）、クラウド連携（AWS S3/CloudFront）を強みとし、150名以上が利用するHRMシステムの開発・保守をリードした実績を持つ。",
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
    {
    label: { vi: "Tiếng Nhật", ja: "日本語" },
    // 「N3目標」 đọc ra là một danh từ ghép cụt; hồ sơ Nhật ghi rõ "đang nhắm
    // tới kỳ thi nào" bằng một mệnh đề.
    level: { vi: "Đang học · mục tiêu N3", ja: "学習中（N3取得を目標）" },
  },
    { label: { vi: "Tiếng Anh", ja: "英語" }, level: { vi: "Aptis B2", ja: "Aptis B2" } },
  ],
} as const;
