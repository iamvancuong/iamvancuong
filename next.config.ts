import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Mặc định 1MB — up một tấm ảnh điện thoại là vượt ngay.
      bodySizeLimit: "30mb",
    },
  },
};

export default nextConfig;
