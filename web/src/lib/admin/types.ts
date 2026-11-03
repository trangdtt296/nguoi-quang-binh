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
