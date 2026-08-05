import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * PLAN §12 — chặn /os khỏi công cụ tìm kiếm.
 *
 * Đây là lớp ngoài cùng, không phải lớp bảo vệ: quyền thật nằm ở middleware
 * và ở assertOwner() trong từng server action. Dòng này chỉ để cấu trúc đời
 * tư khỏi xuất hiện trên Google.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/os",
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
