import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Khu quản trị và trang kết quả tìm kiếm không cần vào chỉ mục.
      disallow: ["/admin", "/tim-kiem"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
