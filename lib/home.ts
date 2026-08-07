import { site } from "./site";

/**
 * Nội dung trang chủ giới thiệu — song ngữ, CHUYỂN bằng nút (không hiện lẫn lộn).
 * ⚠️ Bản tiếng Nhật do AI soạn nháp — chủ nhân (đang học N2) rà lại cho tự nhiên.
 */
export type Lang = "vi" | "ja";

export const home = {
  langLabel: { vi: "Tiếng Việt", ja: "日本語" },

  hero: {
    greeting: { vi: "Xin chào, tôi là", ja: "はじめまして、私は" },
    name: { vi: site.fullName, ja: "トゥオン・ヴァン・クオン" },
    tagline: {
      vi: site.tagline, // "Du học sinh người Việt tại Nhật."
      ja: "日本で学ぶベトナム人留学生です。",
    },
    ctaAbout: { vi: "Về tôi ↓", ja: "私について ↓" },
    ctaJourney: { vi: "Hành trình", ja: "これまでの歩み" },
  },

  about: {
    heading: { vi: "Về tôi", ja: "私について" },
    // Slogan nhẹ nhàng, có chút tự trào thay cho việc liệt kê mục tiêu.
    slogan: { vi: "Sáng lên lớp, chiều baito, tối “thỉnh thoảng” code.", ja: "昼は学校、夕方はバイト、夜は「たまに」コード。" },
    paragraphs: {
      vi: [
        "Mình là Cường — một du học sinh đúng chuẩn: sáng vác cặp lên lớp, chiều lao đi baito, tối mở laptop định code nhưng phải “thỉnh thoảng” lắm mới gõ được dòng nào. Thời gian còn lại mình dành để chụp ảnh, viết lách và quay dăm ba đoạn video vụn vặt của cuộc sống.",
        "Trang này là cuốn nhật ký mở của mình — nơi gom từng khoảnh khắc nhỏ trước khi bộ nhớ cá vàng kịp xóa mất. Không tô hồng, không giả vờ giỏi hơn thực tế; chỉ là một anh du học sinh mỗi ngày khá lên một chút (và mỗi mùa đông mập lên một chút).",
      ],
      ja: [
        "クオンです。絵に描いたような留学生で、朝は学校へ、夕方はバイトへ。夜はコードを書こうとPCを開くものの、実際に手が動くのは「たまに」だけ。残りの時間は、写真を撮ったり、文章を書いたり、ちょっとした動画を撮ったりして過ごしています。",
        "このサイトは、いわば公開中の日記帳。金魚並みの記憶力が消してしまう前に、日々の小さな瞬間を書き留める場所です。話を盛るつもりはありません。少しずつ成長している(そして冬ごとに少しずつ太っていく)、ただの留学生の記録です。",
      ],
    },
  },

  facts: [
    { label: { vi: "Sinh năm", ja: "生年" }, value: { vi: "2003", ja: "2003" } },
    {
      label: { vi: "Quê", ja: "出身" },
      value: { vi: "Quảng Trị, Việt Nam", ja: "ベトナム・クアンチ" },
    },
    {
      label: { vi: "Hiện tại", ja: "現在" },
      value: { vi: "Du học sinh tại Nhật", ja: "日本の留学生" },
    },
  ],

  skills: {
    heading: { vi: "Kỹ năng", ja: "スキル" },
    caption: { vi: "Công cụ mình đang dùng và học.", ja: "使っている・学んでいる技術。" },
    items: [
      "Laravel",
      "PHP",
      "Angular",
      "Next.js",
      "React",
      "TypeScript",
      "MySQL",
      "Tailwind CSS",
      "Node.js",
      "REST API",
      "Git",
    ],
  },

  streaks: {
    heading: { vi: "Chuỗi đang duy trì", ja: "継続中の記録" },
    caption: { vi: "Cập nhật mỗi ngày trên Life OS.", ja: "Life OSで毎日更新。" },
    unit: { vi: "ngày", ja: "日" },
    heatmapLabel: { vi: "Nhịp mỗi ngày", ja: "毎日のリズム" },
    // key phải khớp với PublicStreaks trong lib/streaks.ts
    items: [
      { key: "journal", label: { vi: "Ghi nhật ký", ja: "日記" } },
      { key: "japanese", label: { vi: "Tiếng Nhật", ja: "日本語" } },
      { key: "it", label: { vi: "Lập trình", ja: "プログラミング" } },
    ],
  },

  journey: {
    heading: { vi: "Chặng đường ở Nhật", ja: "日本での歩み" },
    // Dữ liệu timeline KHÔNG nằm ở đây — đọc thật từ Life OS (lib/journey.ts).
    // Ký ức tick "công khai" trong /os sẽ tự gom theo năm → tháng và hiện ra.
    caption: { vi: "Bấm từng năm, rồi từng tháng để xem.", ja: "年ごと・月ごとにタップして見る。" },
    empty: {
      vi: "Chưa có ký ức nào được công khai. Chúng sẽ hiện ở đây khi mình tick chia sẻ trong Life OS.",
      ja: "まだ公開された記録はありません。Life OSで共有をオンにすると、ここに表示されます。",
    },
    viewAll: { vi: "Xem tất cả hành trình", ja: "すべての歩みを見る" },
  },

  contact: {
    heading: { vi: "Kết nối", ja: "つながる" },
    line: {
      vi: "Tuyển dụng, hợp tác, hay chỉ muốn chào hỏi — cứ nhắn cho mình.",
      ja: "採用のご相談も、ちょっとしたご挨拶も、お気軽にどうぞ。",
    },
    form: {
      name: { vi: "Tên của bạn", ja: "お名前" },
      email: { vi: "Email", ja: "メールアドレス" },
      message: { vi: "Lời nhắn của bạn...", ja: "メッセージ..." },
      submit: { vi: "Gửi lời nhắn", ja: "送信する" },
      sending: { vi: "Đang gửi...", ja: "送信中..." },
      success: { vi: "Cảm ơn bạn! Mình sẽ phản hồi sớm nhất có thể.", ja: "ありがとうございます!できるだけ早く返信します。" },
      error: { vi: "Có lỗi rồi, thử lại giúp mình nhé.", ja: "エラーが発生しました。もう一度お試しください。" },
    },
  },

  more: { vi: "Khám phá thêm", ja: "もっと見る" },

  images: {
    hero: { src: "/images/avatar.jpg", alt: "Chân dung Trương Văn Cường" },
  },
} as const;
