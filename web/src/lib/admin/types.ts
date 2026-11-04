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

export interface AdminFood {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  contentHtml: string | null;
  coverImageUrl: string | null;
  categoryId: string | null;
  category: AdminCategory | null;
  season: string | null;
  originStory: string | null;
  whereToEat: { name: string; address: string }[] | null;
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

export interface AdminEvent {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  contentHtml: string | null;
  coverImageUrl: string | null;
  categoryId: string | null;
  category: AdminCategory | null;
  destinationId: string | null;
  destination: { id: string; name: string; slug: string } | null;
  locationText: string | null;
  startAt: string;
  endAt: string | null;
  isRecurring: boolean;
  status: ContentStatus;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AdminCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  categoryId: string | null;
  category: AdminCategory | null;
  lessonCount: number;
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

/** Bài học trong khóa học — thực chất là một Article type = "lesson". */
export interface AdminLesson {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentHtml: string | null;
  lessonOrder: number | null;
  videoUrl: string | null;
  durationMinutes: number | null;
  status: ContentStatus;
  publishedAt: string | null;
}

export interface AdminAlbum {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  categoryId: string | null;
  status: ContentStatus;
  publishedAt: string | null;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type BannerPosition = "home_hero" | "home_middle" | "sidebar";

export interface AdminBanner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  linkUrl: string | null;
  position: BannerPosition;
  sortOrder: number;
  isActive: boolean;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export const BANNER_POSITION_LABELS: Record<BannerPosition, string> = {
  home_hero: "Đầu trang chủ",
  home_middle: "Giữa trang chủ",
  sidebar: "Cột bên",
};

/** Một dòng trong bảng settings. `value` là JSON nên kiểu là unknown. */
export interface AdminSetting {
  key: string;
  value: unknown;
  group: string;
  updatedAt: string;
}

export type UserRole = "editor" | "admin" | "super_admin";

export interface AdminAccount {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  editor: "Cộng tác viên",
  admin: "Quản trị viên",
  super_admin: "Quản trị cấp cao",
};

export const USER_ROLE_HINTS: Record<UserRole, string> = {
  editor: "Viết và sửa nội dung của chính mình, chỉ lưu được bản nháp.",
  admin: "Duyệt, xuất bản và xóa mọi nội dung. Xem được tin nhắn liên hệ.",
  super_admin: "Toàn quyền, thêm được tài khoản và sửa cấu hình website.",
};

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
