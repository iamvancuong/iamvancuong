import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Mặc định 1MB — up một tấm ảnh điện thoại là vượt ngay.
      bodySizeLimit: "30mb",
    },
  },

  /**
   * `/cv` và `/about` đã gộp vào `/projects` (xem `components/profile/`).
   *
   * `permanent: true` = 308. Cố ý, không phải mặc định: hai địa chỉ này đã
   * nằm trong sitemap và có thể đã được đánh chỉ mục, mà 308 là tín hiệu duy
   * nhất nói cho công cụ tìm kiếm biết «trang này chuyển hẳn sang đó, dồn
   * điểm sang đó luôn». Dùng 307 thì hai địa chỉ cũ vẫn được coi là đích
   * riêng và tiếp tục cạnh tranh với chính trang mới.
   *
   * ⚠️ Trình duyệt nhớ 308 rất lâu. Muốn tách lại ba trang thì phải đổi
   * đường dẫn, không thể chỉ gỡ dòng này ra.
   */
  async redirects() {
    return [
      { source: "/cv", destination: "/projects", permanent: true },
      { source: "/about", destination: "/projects", permanent: true },
    ];
  },
};

export default nextConfig;
