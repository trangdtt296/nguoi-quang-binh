/**
 * Lớp lấy dữ liệu.
 *
 * Giai đoạn 2 đọc từ dữ liệu mẫu trong src/lib/mock. Giai đoạn 5 chỉ cần
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
  Lesson,
  Paginated,
  SiteSettings,
} from "@/types/content";

import { mockArticles } from "./mock/articles";
import { mockDestinations } from "./mock/destinations";
import { mockCourses, mockLessons } from "./mock/learning";
import { mockAlbums, mockEvents, mockFoods, siteSettings } from "./mock/misc";

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

const matches = (needle: string, ...haystack: (string | undefined)[]) =>
  haystack.some((text) => text && normalize(text).includes(needle));

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
    items = items.filter((d) => matches(needle, d.name, d.summary));
  }

  if (sort === "popular") items.sort((a, b) => b.viewCount - a.viewCount);
  else if (sort === "name") items.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  else items.sort(byNewest);

  return paginate(items, page, limit);
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
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
    items = items.filter((a) => matches(needle, a.title, a.excerpt));
  }

  items.sort(byNewest);
  return paginate(items, page, limit);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return mockArticles.find((a) => a.slug === slug) ?? null;
}

/** Slug của bài theo loại — dùng cho generateStaticParams. */
export async function getArticleSlugsByType(type: ArticleType): Promise<string[]> {
  return mockArticles.filter((a) => a.type === type).map((a) => a.slug);
}

/** Bài liên quan: cùng loại, ưu tiên cùng danh mục, bỏ chính nó. */
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

/* ---------- Ẩm thực ---------- */

export async function getFoods(
  query: { category?: string; page?: number; limit?: number } = {},
): Promise<Paginated<Food>> {
  const { category, page = 1, limit = DEFAULT_PAGE_SIZE } = query;
  let items = [...mockFoods];
  if (category) items = items.filter((f) => f.category?.slug === category);
  items.sort(byNewest);
  return paginate(items, page, limit);
}

export async function getFeaturedFoods(limit = 4): Promise<Food[]> {
  return [...mockFoods].sort(byNewest).slice(0, limit);
}

export async function getFoodBySlug(slug: string): Promise<Food | null> {
  return mockFoods.find((f) => f.slug === slug) ?? null;
}

export async function getAllFoodSlugs(): Promise<string[]> {
  return mockFoods.map((f) => f.slug);
}

/* ---------- Sự kiện ---------- */

export async function getEvents(limit?: number): Promise<EventItem[]> {
  const items = [...mockEvents].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
  return limit ? items.slice(0, limit) : items;
}

/* ---------- Góc học tập ---------- */

export async function getCourses(category?: string): Promise<LearningCourse[]> {
  const items = [...mockCourses].sort(byNewest);
  return category ? items.filter((c) => c.category.slug === category) : items;
}

export async function getCourseBySlug(slug: string): Promise<LearningCourse | null> {
  return mockCourses.find((c) => c.slug === slug) ?? null;
}

export async function getAllCourseSlugs(): Promise<string[]> {
  return mockCourses.map((c) => c.slug);
}

/** Bài học của một khóa, đã sắp theo đúng thứ tự. */
export async function getLessons(courseSlug: string): Promise<Lesson[]> {
  return mockLessons
    .filter((l) => l.courseSlug === courseSlug)
    .sort((a, b) => a.lessonOrder - b.lessonOrder);
}

/**
 * Một bài học, kèm bài trước và bài sau để điều hướng.
 * Trả về null khi không tìm thấy, để trang gọi notFound().
 */
export async function getLesson(
  courseSlug: string,
  lessonSlug: string,
): Promise<{
  lesson: Lesson;
  lessons: Lesson[];
  previous: Lesson | null;
  next: Lesson | null;
} | null> {
  const lessons = await getLessons(courseSlug);
  const index = lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) return null;

  return {
    lesson: lessons[index],
    lessons,
    previous: index > 0 ? lessons[index - 1] : null,
    next: index < lessons.length - 1 ? lessons[index + 1] : null,
  };
}

export async function getAllLessonParams(): Promise<
  { courseSlug: string; lessonSlug: string }[]
> {
  return mockLessons.map((l) => ({ courseSlug: l.courseSlug, lessonSlug: l.slug }));
}

/* ---------- Thư viện ---------- */

export async function getAlbums(limit?: number): Promise<Album[]> {
  const items = [...mockAlbums].sort(byNewest);
  return limit ? items.slice(0, limit) : items;
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  return mockAlbums.find((a) => a.slug === slug) ?? null;
}

export async function getAllAlbumSlugs(): Promise<string[]> {
  return mockAlbums.map((a) => a.slug);
}

/* ---------- Tìm kiếm chung ---------- */

export interface SearchResult {
  keyword: string;
  destinations: Destination[];
  articles: Article[];
  foods: Food[];
  courses: LearningCourse[];
  total: number;
}

export async function search(keyword: string): Promise<SearchResult> {
  const needle = normalize(keyword);
  const take = 6;

  const destinations = mockDestinations
    .filter((d) => matches(needle, d.name, d.summary))
    .slice(0, take);
  const articles = mockArticles
    .filter((a) => matches(needle, a.title, a.excerpt))
    .slice(0, take);
  const foods = mockFoods
    .filter((f) => matches(needle, f.name, f.summary))
    .slice(0, take);
  const courses = mockCourses
    .filter((c) => matches(needle, c.title, c.description))
    .slice(0, take);

  return {
    keyword,
    destinations,
    articles,
    foods,
    courses,
    total:
      destinations.length + articles.length + foods.length + courses.length,
  };
}

/* ---------- Cấu hình ---------- */

export async function getSiteSettings(): Promise<SiteSettings> {
  return siteSettings;
}
