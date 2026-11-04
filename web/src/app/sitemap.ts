import type { MetadataRoute } from "next";
import {
  getAlbums,
  getArticles,
  getCourses,
  getDestinations,
  getFoods,
} from "@/lib/queries";
import { articleHref } from "@/lib/routes";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

const staticPaths = [
  "/",
  "/gioi-thieu",
  "/diem-den",
  "/van-hoa",
  "/am-thuc",
  "/tin-tuc",
  "/cam-nang",
  "/goc-hoc-tap",
  "/thu-vien",
  "/lien-he",
];

/**
 * Sitemap sinh từ dữ liệu thật.
 *
 * Sitemap được dựng lúc build, mà lúc đó API có thể chưa sẵn sàng. Các hàm
 * lấy dữ liệu đều trả về rỗng khi gọi hỏng, nên trường hợp xấu nhất là
 * sitemap chỉ còn các trang cố định — vẫn hợp lệ, không làm hỏng build.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [destinations, news, culture, guides, foods, courses, albums] =
    await Promise.all([
      getDestinations({ limit: 50 }),
      getArticles({ type: "news", limit: 50 }),
      getArticles({ type: "culture", limit: 50 }),
      getArticles({ type: "guide", limit: 50 }),
      getFoods({ limit: 50 }),
      getCourses(),
      getAlbums(),
    ]);

  return [
    ...staticPaths.map((path) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...destinations.items.map((item) => ({
      url: `${siteUrl}/diem-den/${item.slug}`,
      lastModified: new Date(item.publishedAt),
      priority: 0.7,
    })),
    ...[...news.items, ...culture.items, ...guides.items].map((item) => ({
      url: `${siteUrl}${articleHref(item)}`,
      lastModified: new Date(item.publishedAt),
      priority: 0.6,
    })),
    ...foods.items.map((item) => ({
      url: `${siteUrl}/am-thuc/${item.slug}`,
      lastModified: new Date(item.publishedAt),
      priority: 0.6,
    })),
    ...courses.map((item) => ({
      url: `${siteUrl}/goc-hoc-tap/${item.slug}`,
      lastModified: new Date(item.publishedAt),
      priority: 0.6,
    })),
    ...albums.map((item) => ({
      url: `${siteUrl}/thu-vien/${item.slug}`,
      lastModified: new Date(item.publishedAt),
      priority: 0.5,
    })),
  ];
}
