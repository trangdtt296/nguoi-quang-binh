import type { MetadataRoute } from "next";
import {
  getAlbums,
  getArticles,
  getCourses,
  getDestinations,
  getFoods,
  getAllLessonParams,
} from "@/lib/queries";
import { articleHref } from "@/lib/routes";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

/**
 * Sitemap sinh từ dữ liệu, không viết tay.
 *
 * Backend cũng có sitemap riêng, nhưng nó nằm ở tên miền khác. Công cụ tìm
 * kiếm đọc sitemap ở chính tên miền của website, nên bản này mới là bản có
 * tác dụng.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [destinations, news, culture, guides, foods, courses, lessons, albums] =
    await Promise.all([
      getDestinations({ limit: 50 }),
      getArticles({ type: "news", limit: 50 }),
      getArticles({ type: "culture", limit: 50 }),
      getArticles({ type: "guide", limit: 50 }),
      getFoods({ limit: 50 }),
      getCourses(),
      getAllLessonParams(),
      getAlbums(),
    ]);

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

  const entries: MetadataRoute.Sitemap = [
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
    ...lessons.map((item) => ({
      url: `${siteUrl}/goc-hoc-tap/${item.courseSlug}/${item.lessonSlug}`,
      priority: 0.5,
    })),
    ...albums.map((item) => ({
      url: `${siteUrl}/thu-vien/${item.slug}`,
      lastModified: new Date(item.publishedAt),
      priority: 0.5,
    })),
  ];

  return entries;
}
