/**
 * Lớp lấy dữ liệu.
 *
 * Giai đoạn 2 đọc từ dữ liệu mẫu trong src/lib/mock. Giai đoạn 3 chỉ cần
 * thay phần thân của các hàm dưới đây bằng lời gọi API thật — chữ ký hàm và
 * kiểu trả về giữ nguyên, nên không phải sửa bất kỳ component nào.
 *
 * Mọi hàm đều async để sau này đổi sang fetch không phải đổi cách gọi.
 */
import type {
  Album,
  Article,
  ArticleType,
  Destination,
  EventItem,
  Food,
  LearningCourse,
  Paginated,
  SiteSettings,
} from "@/types/content";

import { mockArticles } from "./mock/articles";
import { mockDestinations } from "./mock/destinations";
import {
  mockAlbums,
  mockCourses,
  mockEvents,
  mockFoods,
  siteSettings,
} from "./mock/misc";

export const DEFAULT_PAGE_SIZE = 12;

function paginate<T>(items: T[], page: number, limit: number): Paginated<T> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Math.min(Math.max(Math.floor(limit) || DEFAULT_PAGE_SIZE, 1), 50);
  const start = (safePage - 1) * safeLimit;
  return {
    items: items.slice(start, start + safeLimit),
    page: safePage,
    limit: safeLimit,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / safeLimit)),
  };
}

/** Bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu. */
export function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

const byNewest = <T extends { publishedAt: string }>(a: T, b: T) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

/* ---------- Điểm đến ---------- */

export interface DestinationQuery {
  category?: string;
  region?: string;
  q?: string;
  sort?: "newest" | "popular" | "name";
  page?: number;
  limit?: number;
}

export async function getDestinations(
  query: DestinationQuery = {},
): Promise<Paginated<Destination>> {
  const { category, region, q, sort = "newest", page = 1, limit = DEFAULT_PAGE_SIZE } =
    query;

  let items = [...mockDestinations];

  if (category) items = items.filter((d) => d.category?.slug === category);
  if (region) items = items.filter((d) => d.region === region);
  if (q) {
    const needle = normalize(q);
    items = items.filter(
      (d) =>
        normalize(d.name).includes(needle) || normalize(d.summary).includes(needle),
    );
  }

  if (sort === "popular") items.sort((a, b) => b.viewCount - a.viewCount);
  else if (sort === "name") items.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  else items.sort(byNewest);

  return paginate(items, page, limit);
}

export async function getDestinationBySlug(
  slug: string,
): Promise<Destination | null> {
  return mockDestinations.find((d) => d.slug === slug) ?? null;
}

export async function getFeaturedDestinations(limit = 6): Promise<Destination[]> {
  const featured = mockDestinations.filter((d) => d.isFeatured);
  const rest = mockDestinations.filter((d) => !d.isFeatured);
  return [...featured, ...rest].slice(0, limit);
}

export async function getAllDestinationSlugs(): Promise<string[]> {
  return mockDestinations.map((d) => d.slug);
}

/* ---------- Bài viết ---------- */

export interface ArticleQuery {
  type?: ArticleType;
  category?: string;
  q?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export async function getArticles(
  query: ArticleQuery = {},
): Promise<Paginated<Article>> {
  const { type, category, q, featured, page = 1, limit = DEFAULT_PAGE_SIZE } = query;

  let items = [...mockArticles];
  if (type) items = items.filter((a) => a.type === type);
  if (category) items = items.filter((a) => a.category?.slug === category);
  if (featured !== undefined) items = items.filter((a) => a.isFeatured === featured);
  if (q) {
    const needle = normalize(q);
    items = items.filter(
      (a) =>
        normalize(a.title).includes(needle) || normalize(a.excerpt).includes(needle),
    );
  }

  items.sort(byNewest);
  return paginate(items, page, limit);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return mockArticles.find((a) => a.slug === slug) ?? null;
}

/** Bài liên quan: cùng loại, cùng danh mục nếu có, bỏ chính nó. */
export async function getRelatedArticles(
  current: Article,
  limit = 3,
): Promise<Article[]> {
  const sameCategory = mockArticles.filter(
    (a) =>
      a.id !== current.id &&
      a.type === current.type &&
      a.category?.slug === current.category?.slug,
  );
  const sameType = mockArticles.filter(
    (a) => a.id !== current.id && a.type === current.type,
  );
  const seen = new Set<string>();
  return [...sameCategory, ...sameType]
    .filter((a) => (seen.has(a.id) ? false : seen.add(a.id)))
    .slice(0, limit);
}

/* ---------- Các loại nội dung khác ---------- */

export async function getFoods(limit?: number): Promise<Food[]> {
  const items = [...mockFoods].sort(byNewest);
  return limit ? items.slice(0, limit) : items;
}

export async function getEvents(limit?: number): Promise<EventItem[]> {
  const items = [...mockEvents].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
  return limit ? items.slice(0, limit) : items;
}

export async function getCourses(category?: string): Promise<LearningCourse[]> {
  const items = [...mockCourses].sort(byNewest);
  return category ? items.filter((c) => c.category.slug === category) : items;
}

export async function getAlbums(limit?: number): Promise<Album[]> {
  const items = [...mockAlbums].sort(byNewest);
  return limit ? items.slice(0, limit) : items;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return siteSettings;
}
