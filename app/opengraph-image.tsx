import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

/**
 * Ảnh OG mặc định cho cả site — thứ hiện ra khi ai đó dán link vào Messenger,
 * Zalo, X, Slack.
 *
 * Vẽ bằng `ImageResponse` chứ không phải một file PNG tĩnh: tên và tagline lấy
 * thẳng từ `lib/site.ts`, nên đổi tagline ở đó là ảnh đổi theo, không phải mở
 * Figma sửa lại ảnh rồi export.
 *
 * Cố ý KHÔNG dùng font tùy chỉnh: nạp file font vào edge runtime cho một tấm
 * ảnh mà tiếng Việt vẫn hiện đúng bằng font hệ thống là đổi lấy phức tạp không
 * đáng. Bố cục cũng cố tình giống trang chủ — trắng, viền mảnh, không gradient.
 */
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#a3a3a3" }}>
          {site.domain}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 78,
              fontWeight: 600,
              color: "#171717",
              letterSpacing: "-0.03em",
            }}
          >
            {site.fullName}
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 38,
              color: "#525252",
              lineHeight: 1.35,
            }}
          >
            {site.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            borderTop: "2px solid #e5e5e5",
            paddingTop: 28,
            fontSize: 26,
            color: "#737373",
          }}
        >
          Nhật ký · Tiếng Nhật · Lập trình · Sống ở Nhật
        </div>
      </div>
    ),
    size,
  );
}
