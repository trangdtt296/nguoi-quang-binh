/** Kiểu dữ liệu dùng trong khu quản trị, khớp với phản hồi của API. */

export type ContentStatus = "draft" | "published" | "scheduled" | "archived";
export type ArticleType = "news" | "culture" | "guide" | "lesson";

export interface AdminCategory {
  id: string;
  type: string;
  name: string;
  slug: string;
}

export interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentHtml: string | null;
  coverImageUrl: string | null;
  type: ArticleType;
  categoryId: string | null;
  category: AdminCategory | null;
  authorId: string;
  author: { id: string; fullName: string } | null;
  tags: string[];
  status: ContentStatus;
  publishedAt: string | null;
  viewCount: number;
  isFeatured: boolean;
  courseId: string | null;
  lessonOrder: number | null;
  videoUrl: string | null;
  durationMinutes: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AdminDestination {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  contentHtml: string | null;
  coverImageUrl: string | null;
  categoryId: string | null;
  category: AdminCategory | null;
  region: string | null;
  address: string | null;
  /** API trả về chuỗi vì Prisma Decimal không serialize thành số. */
  latitude: string | number | null;
  longitude: string | number | null;
  bestTime: string | null;
  visitInfo: { label: string; value: string }[] | null;
  status: ContentStatus;
  publishedAt: string | null;
  viewCount: number;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AdminContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminMedia {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  type: "image" | "video" | "embed";
  fileName: string | null;
  mimeType: string | null;
  /** API trả về dạng chuỗi vì BigInt không serialize được sang JSON. */
  sizeBytes: string | null;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  folder: string | null;
  uploadedBy: { id: string; fullName: string } | null;
  createdAt: string;
}

export interface MediaListResponse {
  items: AdminMedia[];
  totalBytes: string | number;
}

/** Dữ liệu gửi lên khi tạo hoặc sửa bài viết. */
export interface ArticleInput {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content?: unknown;
  contentHtml?: string | null;
  coverImageUrl?: string | null;
  type: ArticleType;
  categoryId?: string | null;
  tags?: string[];
  status?: ContentStatus;
  publishedAt?: string | null;
  isFeatured?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
}

export const ARTICLE_TYPE_LABELS: Record<ArticleType, string> = {
  news: "Tin tức",
  culture: "Văn hóa",
  guide: "Cẩm nang",
  lesson: "Bài học",
};

/** Chuyên mục nào thuộc loại bài nào — dùng để lọc danh sách danh mục. */
export const ARTICLE_TYPE_TO_CATEGORY_TYPE: Record<ArticleType, string> = {
  news: "article",
  culture: "culture",
  guide: "guide",
  lesson: "learning",
};
