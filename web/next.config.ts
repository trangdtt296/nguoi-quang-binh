import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Ảnh do CMS tải lên, phục vụ qua Cloudinary
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Ảnh mẫu dùng trong giai đoạn phát triển
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
