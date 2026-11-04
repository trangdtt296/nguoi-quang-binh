/**
 * Lớp lấy dữ liệu cho phần công khai.
 *
 * Gọi API thật. Mọi hàm đều trả về giá trị an toàn khi API không phản hồi
 * (danh sách rỗng, hoặc null) thay vì ném lỗi — backend chưa chạy thì
 * trang vẫn mở được và hiện trạng thái rỗng, không trắng xóa.
 *
 * Dữ liệu mẫu cũ trong src/lib/mock chỉ còn dùng cho các danh sách tĩnh
 * như khu vực và danh mục ở bộ lọc.
 */
import type {
  Album,
  Article,
  ArticleType,
  Category,
  Destination,
  EventItem,
  Food,
  LearningCourse,
  Lesson,
  Paginated,
  SiteSettings,
} from "@/types/content";

import { apiGet, type ApiMeta } from "./api";
import {
  toAlbum,
  toArticle,
  toCategoryRequired,
  toCourse,
  toDestination,
  toEvent,
  toFood,
  toLesson,
  toSettings,
} from "./adapters";

export const DEFAULT_PAGE_SIZE = 12;

/* eslint-disable @typescript-eslint/no-explicit-any */

function emptyPage<T>(limit = DEFAULT_PAGE_SIZE): Paginated<T> {
  return { items: [], page: 1, limit, total: 0, totalPages: 1 };
}

function toPaginated<T>(
  raw: any[] | undefined,
  meta: ApiMeta | undefined,
  map: (item: any) => T,
  limit: number,
): Paginated<T> {
  const items = Array.isArray(raw) ? raw.map(map) : [];
  return {
    items,
    page: meta?.page ?? 1,
    limit: meta?.limit ?? limit,
    total: meta?.total ?? items.length,
    totalPages: meta?.totalPages ?? 1,
  };
}

/** Dựng query string, bỏ qua giá trị rỗng. */
function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || value === false) continue;
    search.set(key, String(value));
  }
  const queryString = search.toString();
  return queryString ? `?${queryString}` : "";
}

/** Bỏ dấu tiếng Việt — dùng cho tìm kiếm phía giao diện. */
export function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

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
  const limit = query.limit ?? DEFAULT_PAGE_SIZE;
  const result = await apiGet<any[]>(
    `/destinations${buildQuery({ ...query, limit })}`,
  );
  if (!result) return emptyPage<Destination>(limit);
  return toPaginated(result.data, result.meta, toDestination, limit);
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  const result = await apiGet<any>(`/destinations/${slug}`);
  return result ? toDestination(result.data) : null;
}

export async function getFeaturedDestinations(limit = 6): Promise<Destination[]> {
  const featured = await getDestinations({ limit, sort: "newest" });
  // API đã sắp xếp theo ngày; đẩy bài nổi bật lên trước.
  return [...featured.items].sort(
    (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
  );
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
  const limit = query.limit ?? DEFAULT_PAGE_SIZE;
  const result = await apiGet<any[]>(`/articles${buildQuery({ ...query, limit })}`);
  if (!result) return emptyPage<Article>(limit);
  return toPaginated(result.data, result.meta, toArticle, limit);
}

/** Trang chi tiết bài viết: trả về cả bài liên quan để khỏi gọi hai lần. */
export async function getArticleWithRelated(
  slug: string,
): Promise<{ article: Article; related: Article[] } | null> {
  const result = await apiGet<any>(`/articles/${slug}`);
  if (!result) return null;

  return {
    article: toArticle(result.data),
    related: Array.isArray(result.data.related)
      ? result.data.related.map(toArticle)
      : [],
  };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const found = await getArticleWithRelated(slug);
  return found?.article ?? null;
}

/* ---------- Ẩm thực ---------- */

export async function getFoods(
  query: { category?: string; q?: string; page?: number; limit?: number } = {},
): Promise<Paginated<Food>> {
  const limit = query.limit ?? DEFAULT_PAGE_SIZE;
  const result = await apiGet<any[]>(`/foods${buildQuery({ ...query, limit })}`);
  if (!result) return emptyPage<Food>(limit);
  return toPaginated(result.data, result.meta, toFood, limit);
}

export async function getFeaturedFoods(limit = 4): Promise<Food[]> {
  const result = await getFoods({ limit });
  return result.items;
}

export async function getFoodBySlug(slug: string): Promise<Food | null> {
  const result = await apiGet<any>(`/foods/${slug}`);
  return result ? toFood(result.data) : null;
}

/* ---------- Danh mục ---------- */

/**
 * Danh mục của một loại nội dung, lấy từ API.
 *
 * Trước đây danh sách này nằm cứng trong code nên thêm danh mục trong CMS
 * thì ngoài web không thấy. Lấy từ API để hai bên luôn khớp. API chỉ trả về
 * danh mục đang bật, nên tắt một danh mục là nó biến khỏi bộ lọc.
 *
 * Gọi hỏng thì trả về mảng rỗng: bộ lọc thiếu một ô vẫn hơn là cả trang
 * không mở được.
 */
export async function getCategories(type: string): Promise<Category[]> {
  const result = await apiGet<any[]>(`/categories${buildQuery({ type })}`);
  if (!result) return [];
  return Array.isArray(result.data) ? result.data.map(toCategoryRequired) : [];
}

/* ---------- Sự kiện ---------- */

/**
 * Danh sách sự kiện.
 *
 * `upcoming` để API lọc những sự kiện chưa diễn ra và sắp theo thứ tự tăng
 * dần; không truyền thì lấy hết, mới nhất trước.
 */
export async function getEvents(
  query: { upcoming?: boolean; page?: number; limit?: number } = {},
): Promise<Paginated<EventItem>> {
  const limit = query.limit ?? DEFAULT_PAGE_SIZE;
  const result = await apiGet<any[]>(`/events${buildQuery({ ...query, limit })}`);
  if (!result) return emptyPage<EventItem>(limit);
  return toPaginated(result.data, result.meta, toEvent, limit);
}

/** Sự kiện sắp diễn ra, cho khối trên trang chủ. */
export async function getUpcomingEvents(limit = 4): Promise<EventItem[]> {
  const result = await getEvents({ upcoming: true, limit });
  return result.items;
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  const result = await apiGet<any>(`/events/${slug}`);
  return result ? toEvent(result.data) : null;
}

/* ---------- Góc học tập ---------- */

export async function getCourses(category?: string): Promise<LearningCourse[]> {
  const result = await apiGet<any[]>(`/courses${buildQuery({ category, limit: 50 })}`);
  if (!result) return [];
  return Array.isArray(result.data) ? result.data.map(toCourse) : [];
}

/** Chi tiết khóa học kèm danh sách bài, API trả về trong một lần gọi. */
export async function getCourseWithLessons(
  courseSlug: string,
): Promise<{ course: LearningCourse; lessons: Lesson[] } | null> {
  const result = await apiGet<any>(`/courses/${courseSlug}`);
  if (!result) return null;

  return {
    course: toCourse(result.data),
    lessons: Array.isArray(result.data.lessons)
      ? result.data.lessons.map((lesson: any) => toLesson(lesson, courseSlug))
      : [],
  };
}

export async function getCourseBySlug(slug: string): Promise<LearningCourse | null> {
  const found = await getCourseWithLessons(slug);
  return found?.course ?? null;
}

export async function getLessons(courseSlug: string): Promise<Lesson[]> {
  const found = await getCourseWithLessons(courseSlug);
  return found?.lessons ?? [];
}

/** Một bài học, kèm bài trước và bài sau để điều hướng. */
export async function getLesson(
  courseSlug: string,
  lessonSlug: string,
): Promise<{
  lesson: Lesson;
  lessons: Lesson[];
  previous: Lesson | null;
  next: Lesson | null;
} | null> {
  const result = await apiGet<any>(`/courses/${courseSlug}/${lessonSlug}`);
  if (!result) return null;

  const lessons = Array.isArray(result.data.lessons)
    ? result.data.lessons.map((lesson: any) => toLesson(lesson, courseSlug))
    : [];

  return {
    lesson: toLesson(result.data.lesson, courseSlug),
    lessons,
    previous: result.data.previous ? toLesson(result.data.previous, courseSlug) : null,
    next: result.data.next ? toLesson(result.data.next, courseSlug) : null,
  };
}

/* ---------- Thư viện ---------- */

export async function getAlbums(limit = 24): Promise<Album[]> {
  const result = await apiGet<any[]>(`/albums${buildQuery({ limit })}`);
  if (!result) return [];
  return Array.isArray(result.data) ? result.data.map(toAlbum) : [];
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  const result = await apiGet<any>(`/albums/${slug}`);
  return result ? toAlbum(result.data) : null;
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
  const empty: SearchResult = {
    keyword,
    destinations: [],
    articles: [],
    foods: [],
    courses: [],
    total: 0,
  };

  const result = await apiGet<any>(`/search${buildQuery({ q: keyword })}`);
  if (!result) return empty;

  const data = result.data;
  return {
    keyword,
    destinations: (data.destinations ?? []).map(toDestination),
    articles: (data.articles ?? []).map(toArticle),
    foods: (data.foods ?? []).map(toFood),
    courses: (data.courses ?? []).map(toCourse),
    total: Number(data.total) || 0,
  };
}

/* ---------- Cấu hình ---------- */

export async function getSiteSettings(): Promise<SiteSettings> {
  const result = await apiGet<any>("/settings");
  return toSettings(result?.data ?? {});
}
