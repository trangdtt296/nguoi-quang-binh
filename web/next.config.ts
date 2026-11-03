import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tắt huy hiệu dev của Next.js: nó nằm góc dưới bên trái, đúng chỗ
  // sidebar quản trị. Huy hiệu này vốn chỉ hiện lúc chạy dev, không bao
  // giờ xuất hiện trên bản đã deploy.
  devIndicators: false,
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
