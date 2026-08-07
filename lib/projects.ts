/**
 * PLAN §7 — mỗi project chỉ cần: tên, mô tả, stack, vấn đề, đã build gì, link.
 * Không làm portfolio kiểu corporate.
 *
 * Thêm project mới = thêm một object vào mảng này.
 * Song ngữ: các trường `*Ja` là bản tiếng Nhật. ⚠️ JA là AI nháp — chủ nhân rà lại.
 */

export type Project = {
  slug: string;
  name: string;
  nameJa?: string;
  year: string;
  status: "đang làm" | "đang chạy" | "tạm dừng";
  summary: string;
  summaryJa: string;
  stack: string[];
  problem: string;
  problemJa: string;
  built: string[];
  builtJa: string[];
  repo?: string;
  demo?: string;
};

export const projects: Project[] = [
  {
    // ⚠️ NHÁP — đọc từ milaedu.com + bạn cung cấp. Cần bạn xác nhận:
    //   year (năm ra mắt), stack chính xác, AI provider, và vai trò/đóng góp
    //   kỹ thuật cụ thể của bạn. Stack dưới suy ra từ trang (cookie XSRF-TOKEN
    //   + assets /build/assets/ = Laravel + Vite), bạn sửa lại cho đúng.
    slug: "milaedu",
    name: "Milaedu — luyện thi Aptis",
    nameJa: "Milaedu — Aptis対策",
    year: "2025",
    status: "đang chạy",
    summary:
      "Nền tảng luyện thi Aptis online đủ 4 kỹ năng, có đề thi thử sát thật và chấm chữa Writing/Speaking chi tiết — kết hợp AI chấm tức thì với giáo viên. Hiện có hơn 500 học viên đang học.",
    summaryJa:
      "4技能すべてに対応したAptis対策のオンライン学習サイト。本番に近い模試と、AI＋講師によるWriting/Speakingの詳細な添削。現在500名以上が学習中。",
    stack: ["Laravel", "Vite", "MySQL", "AI chấm Writing"],
    problem:
      "Người tự luyện Aptis rất khó tự chấm hai kỹ năng Viết và Nói, còn các khóa có giáo viên chấm thì đắt. Cần một chỗ luyện đủ 4 kỹ năng, mô phỏng sát đề thật và chấm chữa chi tiết mà giá vẫn phải chăng.",
    problemJa:
      "Aptisを独学する人にとって、WritingとSpeakingは自分で採点するのが難しい。一方、講師添削つきの講座は高い。4技能を本番さながらに練習でき、詳しい添削も受けられて、それでいて手頃な場所が必要だった。",
    built: [
      "Đề thi thử full 4 kỹ năng (Nghe · Đọc · Viết · Nói) mô phỏng sát định dạng và áp lực thời gian như thi thật.",
      "Chấm và phản hồi Writing tức thì bằng AI, kèm gợi ý cải thiện cụ thể theo từng tiêu chí.",
      "Giáo viên chấm chữa chi tiết Writing/Speaking: ngữ pháp, từ vựng, tính mạch lạc, mức độ hoàn thành yêu cầu.",
      "Lộ trình bám mục tiêu điểm và thống kê tiến trình cho từng học viên.",
      "Cộng đồng học viên để hỏi đáp, chia sẻ tài liệu và giữ động lực.",
      "Đang vận hành thật với hơn 500 học viên đang theo học.",
    ],
    builtJa: [
      "4技能（リスニング・リーディング・ライティング・スピーキング）の模試を、本番の形式と時間感覚に近づけて実装。",
      "AIによるWritingの即時採点とフィードバック。基準ごとに具体的な改善案を提示。",
      "講師によるWriting/Speakingの詳細な添削：文法・語彙・一貫性・課題達成度。",
      "目標スコアに沿った学習ルートと、学習者ごとの進捗の可視化。",
      "質問・教材共有・モチベーション維持のための学習者コミュニティ。",
      "500名以上が実際に学習する、稼働中のサービス。",
    ],
    repo: "",
    demo: "https://milaedu.com",
  },
  {
    slug: "iamvancuong",
    name: "iamvancuong.com",
    year: "2026",
    status: "đang làm",
    summary:
      "Trang cá nhân kiêm hệ thống quản lý cuộc sống của chính tôi. Vừa là nơi viết, vừa là công cụ tôi dùng hằng ngày.",
    summaryJa:
      "自分のための個人サイト兼ライフ管理システム。書く場所であり、毎日使う道具でもある。",
    stack: ["Next.js 16", "TypeScript", "Tailwind CSS v4", "Prisma", "MySQL"],
    problem:
      "Tôi có quá nhiều mục tiêu cùng lúc và không thứ nào đi tới đâu. Tôi cần một chỗ buộc mình phải chọn ra ba việc quan trọng nhất, và một chỗ để ghi lại quá trình thay vì để nó trôi đi.",
    problemJa:
      "目標を同時に抱えすぎて、どれも前に進まなかった。いちばん大事な3つを選ばざるを得ない場所と、過程を流さずに記録する場所が必要だった。",
    built: [
      "Một codebase, hai vùng: trang công khai và Life OS riêng tư sau đăng nhập. Chung một database, phân biệt nhau bằng đúng một cột `visibility` — viết một lần, tick vào thì hiện ra ngoài.",
      "Đăng nhập tự viết bằng JWT ký và cookie httpOnly, không dùng thư viện auth. Mọi server action tự kiểm quyền, không ỷ vào middleware.",
      "Ràng buộc nằm trong server chứ không nằm trong giao diện: mục «đang tập trung» bị chặn cứng ở ba việc, sửa DOM cũng không lách được.",
      "Bảy lĩnh vực cuộc sống dùng chung một trang duy nhất — thêm lĩnh vực mới là thêm một dòng dữ liệu, không sửa dòng code nào.",
      "Ảnh tự nén sang WebP kèm thumbnail, xoay theo EXIF, và kiểm quyền từng tấm một.",
      "Hỗ trợ song ngữ Việt–Nhật ở mức từng bài: bài nào có bản tiếng Nhật thì mới sinh ra URL tiếng Nhật.",
      "Design system tự viết bằng Tailwind, không dùng thư viện component ngoài.",
    ],
    builtJa: [
      "1つのコードベースに2つの領域：公開サイトと、ログイン後のプライベートな Life OS。同じDBを共有し、`visibility` の1列だけで切り替える——一度書けば、チェックすれば表に出る。",
      "JWT署名とhttpOnly Cookieで自作した認証。認証ライブラリは不使用。各サーバーアクションが自分で権限を確認し、ミドルウェア任せにしない。",
      "制約はUIではなくサーバー側に：「集中」は3件で固定され、DOMをいじっても回避できない。",
      "7つの人生領域を1ページで共有——領域を足すのはデータ1行、コードは触らない。",
      "画像は自動でWebP＋サムネイル化し、EXIFに従って回転、1枚ごとに権限を確認。",
      "記事単位の日越バイリンガル：日本語版がある記事だけ日本語URLを生成。",
      "Tailwindで自作したデザインシステム。外部コンポーネントライブラリは不使用。",
    ],
    repo: "",
    demo: "https://iamvancuong.com",
  },
];
