import { cvPdf, cvFileName } from "@/lib/cv-pdf";
import { isLang } from "@/lib/i18n";

/**
 * File CV để tải về: `/api/cv/vi` và `/api/cv/ja`.
 *
 * `runtime = "nodejs"` là BẮT BUỘC, không phải mặc định cho vui: bộ dựng PDF
 * đọc font từ đĩa bằng `node:fs`. Chạy ở edge là lỗi lúc build chứ không phải
 * lúc chạy — nhưng lỗi đó khó đọc, nên ghi rõ ra đây.
 */
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: RouteContext<"/api/cv/[lang]">,
) {
  const { lang } = await params;
  if (!isLang(lang)) return new Response("Not found", { status: 404 });

  const bytes = await cvPdf(lang);

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      /**
       * `attachment` — bấm là TẢI, không mở tab xem trước.
       *
       * Đây chính là điều phân biệt nút này với nút cũ: người tuyển dụng bấm
       * "tải CV" thì trong thư mục Downloads của họ phải có một file, ngay,
       * không qua hộp thoại nào.
       *
       * `filename*=UTF-8''` là dạng RFC 5987. Tên file hiện tại không dấu nên
       * `filename=` thường cũng đủ, nhưng để sẵn cả hai thì đổi tên file có
       * dấu sau này không phải nhớ quay lại sửa chỗ này.
       */
      "Content-Disposition": `attachment; filename="${cvFileName(lang)}"; filename*=UTF-8''${encodeURIComponent(cvFileName(lang))}`,
      // Nội dung chỉ đổi khi deploy bản mới, nhưng đây là hồ sơ xin việc —
      // thà dựng lại thường xuyên còn hơn để một CDN giữ bản cũ cả năm.
      "Cache-Control": "public, max-age=3600",
    },
  });
}
