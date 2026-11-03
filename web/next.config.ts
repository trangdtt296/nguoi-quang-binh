import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Huy hiệu dev của Next.js mặc định nằm góc dưới bên trái, đúng chỗ
  // sidebar quản trị. Dời sang phải cho khỏi che menu.
  devIndicators: {
    position: "bottom-right",
  },
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
