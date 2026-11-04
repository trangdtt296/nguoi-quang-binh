/**
 * Kiểu dữ liệu dùng chung cho toàn frontend.
 *
 * Các kiểu này mô tả đúng hình dạng dữ liệu mà API ở Giai đoạn 3 sẽ trả về
 * (xem docs/02-kien-truc.md và docs/04-database.md). Nhờ vậy khi nối API
 * thật, chỉ phải thay phần lấy dữ liệu trong src/lib/queries.ts, không phải
 * sửa component.
 */

export type ContentStatus = "draft" | "published" | "scheduled" | "archived";

export type ArticleType = "news" | "culture" | "guide" | "lesson";

export type CategoryType =
  | "article"
  | "destination"
  | "food"
  | "event"
  | "culture"
  | "guide"
  | "learning";

export interface Category {
  id: string;
  type: CategoryType;
  name: string;
  slug: string;
  description?: string;
}

/** Ảnh: trong giai đoạn này chỉ cần url + alt; CMS sẽ bổ sung các trường khác. */
export interface MediaItem {
  id: string;
  url: string;
  altText: string;
  caption?: string;
}

export interface SeoMeta {
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
}

export interface Article extends SeoMeta {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  /** HTML đã render sẵn từ nội dung TipTap. */
  contentHtml: string;
  coverImageUrl?: string;
  type: ArticleType;
  category?: Category;
  authorName: string;
  tags: string[];
  publishedAt: string;
  viewCount: number;
  isFeatured: boolean;
}

export interface Destination extends SeoMeta {
  id: string;
  name: string;
  slug: string;
  summary: string;
  contentHtml: string;
  coverImageUrl?: string;
  category?: Category;
  /** Khu vực, dùng làm trục lọc thứ hai. */
  region: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  bestTime?: string;
  visitInfo?: { label: string; value: string }[];
  gallery: MediaItem[];
  publishedAt: string;
  viewCount: number;
  isFeatured: boolean;
}

export interface Food extends SeoMeta {
  id: string;
  name: string;
  slug: string;
  summary: string;
  contentHtml: string;
  coverImageUrl?: string;
  category?: Category;
  season?: string;
  originStory?: string;
  publishedAt: string;
}

export interface EventItem extends SeoMeta {
  id: string;
  name: string;
  slug: string;
  summary: string;
  contentHtml: string;
  coverImageUrl?: string;
  locationText?: string;
  startAt: string;
  endAt?: string;
  isRecurring: boolean;
  /** Điểm đến được gắn kèm, nếu sự kiện diễn ra ở một nơi có trong hệ thống. */
  destination?: { name: string; slug: string };
  publishedAt: string;
}

export interface LearningCourse extends SeoMeta {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl?: string;
  /** Lĩnh vực — trục phân loại duy nhất, không có trình độ. */
  category: Category;
  lessonCount: number;
  hasVideo: boolean;
  publishedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  courseSlug: string;
  lessonOrder: number;
  videoUrl?: string;
  durationMinutes?: number;
  publishedAt: string;
}

export interface Album extends SeoMeta {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl?: string;
  items: MediaItem[];
  publishedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  position: "home_hero" | "home_middle" | "sidebar";
}

export interface SiteSettings {
  siteName: string;
  slogan: string;
  aboutShort: string;
  hotline?: string;
  email?: string;
  address?: string;
  facebookPageUrl: string;
  footerText: string;
}

/** Khuôn phân trang, khớp với `meta` trong phản hồi API. */
export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
