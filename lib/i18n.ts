import type { Lang } from "@/lib/home";

/**
 * i18n dùng chung cho TOÀN BỘ trang công khai.
 *
 * `home.ts` chỉ lo nội dung trang chủ; file này gom mọi chuỗi GIAO DIỆN (chrome)
 * còn lại: tiêu đề trang, phụ đề, nhãn nút, thông báo trống, aria… Mỗi chuỗi là
 * `{ vi, ja }`, dùng trong client qua `useLang()`.
 *
 * ⚠️ Bản tiếng Nhật do AI soạn nháp — chủ nhân (đang học N2) rà lại cho tự nhiên.
 *
 * KHÔNG để ở đây: nội dung tự viết (about/now/projects — nằm ở file riêng) và
 * dữ liệu người dùng (ký ức, caption, tag — giữ nguyên ngôn ngữ gốc, không dịch).
 */
export type { Lang };

export const LANG_COOKIE = "lang";
export const DEFAULT_LANG: Lang = "vi";

export function isLang(v: unknown): v is Lang {
  return v === "vi" || v === "ja";
}

/** Nhãn "Tháng M, Y" ↔ "Y年M月" cho mục lịch ở /photos. */
export function monthLabel(year: number, month: number, lang: Lang): string {
  return lang === "ja" ? `${year}年${month}月` : `Tháng ${month}, ${year}`;
}

type Str = { vi: string; ja: string };

export const t = {
  now: {
    title: { vi: "Dạo này", ja: "いま" },
    updated: { vi: "Cập nhật lần cuối", ja: "最終更新" },
  },
  about: {
    title: { vi: "Giới thiệu", ja: "自己紹介" },
  },
  projects: {
    title: { vi: "Dự án", ja: "プロジェクト" },
    subtitle: {
      vi: "Những thứ tôi thật sự đã làm, không phải danh sách công nghệ tôi từng đọc qua.",
      ja: "実際に作ったもの。触れたことのある技術の一覧ではありません。",
    },
    problem: { vi: "Vấn đề", ja: "課題" },
    built: { vi: "Tôi đã làm gì", ja: "やったこと" },
    source: { vi: "Mã nguồn", ja: "ソースコード" },
    demo: { vi: "Xem thử", ja: "見てみる" },
    projectsSub: { vi: "Dự án cá nhân", ja: "個人プロジェクト" },
    experience: { vi: "Kinh nghiệm làm việc", ja: "職務経歴" },
    status: {
      "đang làm": { vi: "đang làm", ja: "制作中" },
      "đang chạy": { vi: "đang chạy", ja: "稼働中" },
      "tạm dừng": { vi: "tạm dừng", ja: "休止中" },
    } as Record<string, Str>,
  },
  blog: {
    title: { vi: "Viết", ja: "ブログ" },
    /** Lời mời bấm ở cuối mỗi thẻ bài. */
    read: { vi: "Đọc bài", ja: "読む" },
    subtitle: {
      vi: "Tiếng Nhật, lập trình, và cuộc sống ở đây.",
      ja: "日本語、プログラミング、そしてここでの暮らし。",
    },
    all: { vi: "Tất cả", ja: "すべて" },
    empty: { vi: "Chưa có bài nào trong mục này.", ja: "この分類の記事はまだありません。" },
    privateNote: {
      // {n} được thay ở nơi dùng
      vi: "Bạn đang đăng nhập nên thấy cả {n} bài riêng tư/chưa xuất bản.",
      ja: "ログイン中のため、非公開・未公開の記事 {n} 件も表示されています。",
    },
    manage: { vi: "Quản lý bài viết", ja: "記事を管理" },
    private: { vi: "riêng tư", ja: "非公開" },
  },
  journey: {
    title: { vi: "Hành trình", ja: "歩み" },
    // {hometown} thay ở nơi dùng
    subtitle: {
      vi: "Những gì tôi đã đi qua, từ {hometown} tới Nhật. Không phải tất cả — chỉ những thứ tôi muốn giữ lại và kể ra.",
      ja: "{hometown}から日本まで、これまで歩んできた道のり。すべてではなく、残しておきたいことだけ。",
    },
    emptyLead: { vi: "Chưa có gì ở đây.", ja: "まだ何もありません。" },
    readPosts: { vi: "Đọc bài viết", ja: "記事を読む" },
    emptyTail: { vi: "trong lúc chờ.", ja: "その間にどうぞ。" },
  },
  photos: {
    title: { vi: "Ảnh", ja: "写真" },
    subtitle: { vi: "Cuộc sống ở Nhật, ghi lại bằng ảnh.", ja: "日本での暮らしを、写真で。" },
    empty: { vi: "Chưa có ảnh nào được chia sẻ.", ja: "公開された写真はまだありません。" },
    seeJourney: { vi: "Xem hành trình", ja: "歩みを見る" },
    unknownTime: { vi: "Không rõ thời gian", ja: "時期不明" },
    alt: { vi: "Ảnh", ja: "写真" },
  },
  lightbox: {
    view: { vi: "Xem ảnh", ja: "写真を見る" },
    close: { vi: "Đóng", ja: "閉じる" },
    prev: { vi: "Ảnh trước", ja: "前の写真" },
    next: { vi: "Ảnh sau", ja: "次の写真" },
  },
  os: {
    enter: { vi: "Vào Life OS", ja: "Life OSへ" },
    private: { vi: "Khu vực riêng tư", ja: "プライベート領域" },
  },
  theme: {
    system: { vi: "Theo hệ thống", ja: "システムに合わせる" },
    light: { vi: "Giao diện sáng", ja: "ライトモード" },
    dark: { vi: "Giao diện tối", ja: "ダークモード" },
    hint: { vi: "bấm để đổi", ja: "タップで切り替え" },
  },
  postView: {
    privateNote: {
      vi: "Bài này đang riêng tư, chỉ bạn xem được.",
      ja: "この記事は非公開です。あなただけが見られます。",
    },
    editPublish: { vi: "Sửa hoặc xuất bản", ja: "編集または公開" },
  },
  menu: { vi: "Menu", ja: "メニュー" },

  cv: {
    title: { vi: "Hồ sơ / CV", ja: "履歴書・職務経歴書" },
    subtitle: {
      vi: "Hồ sơ ứng tuyển của mình. Bấm nút để tải bản PDF.",
      ja: "応募用の職務経歴書です。ボタンからPDFを保存できます。",
    },
    download: { vi: "Tải PDF", ja: "PDFを保存" },
    summary: { vi: "Tóm tắt", ja: "職務要約" },
    experience: { vi: "Kinh nghiệm làm việc", ja: "職務経歴" },
    skills: { vi: "Kỹ năng", ja: "スキル" },
    education: { vi: "Học vấn", ja: "学歴" },
    languages: { vi: "Ngôn ngữ", ja: "語学" },
    birth: { vi: "Ngày sinh", ja: "生年月日" },
    phone: { vi: "Điện thoại", ja: "電話" },
    email: { vi: "Email", ja: "メール" },
    address: { vi: "Địa chỉ", ja: "住所" },
    nationality: { vi: "Quốc tịch", ja: "国籍" },
  },
} as const;
