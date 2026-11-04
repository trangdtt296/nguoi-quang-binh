/**
 * Chuyển dữ liệu API sang kiểu dùng trong giao diện.
 *
 * API trả về đúng hình dạng của database (ví dụ `author` là một object,
 * `latitude` là chuỗi vì Prisma Decimal không serialize thành số). Giao
 * diện muốn thứ gọn hơn. Gom việc chuyển đổi vào một chỗ để khi API đổi
 * thì chỉ sửa ở đây.
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
  MediaItem,
  SiteSettings,
} from "@/types/content";

/* eslint-disable @typescript-eslint/no-explicit-any */

const str = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const num = (value: unknown): number | undefined => {
  if (value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

function toCategory(raw: any): Category | undefined {
  if (!raw) return undefined;
  return {
    id: str(raw.id),
    type: raw.type ?? "article",
    name: str(raw.name),
    slug: str(raw.slug),
    description: raw.description ?? undefined,
  };
}

function toMedia(raw: any): MediaItem {
  return {
    id: str(raw?.id),
    url: str(raw?.url),
    altText: str(raw?.altText, "Ảnh minh họa"),
    caption: raw?.caption ?? undefined,
  };
}

export function toArticle(raw: any): Article {
  return {
    id: str(raw.id),
    title: str(raw.title),
    slug: str(raw.slug),
    excerpt: str(raw.excerpt),
    contentHtml: str(raw.contentHtml),
    coverImageUrl: raw.coverImageUrl ?? undefined,
    type: (raw.type ?? "news") as ArticleType,
    category: toCategory(raw.category),
    authorName: str(raw.author?.fullName, "Ban biên tập"),
    tags: Array.isArray(raw.tags) ? raw.tags.map((tag: unknown) => str(tag)) : [],
    publishedAt: str(raw.publishedAt, raw.createdAt ?? new Date().toISOString()),
    viewCount: num(raw.viewCount) ?? 0,
    isFeatured: Boolean(raw.isFeatured),
    seoTitle: raw.seoTitle ?? undefined,
    seoDescription: raw.seoDescription ?? undefined,
    ogImageUrl: raw.ogImageUrl ?? undefined,
  };
}

export function toDestination(raw: any): Destination {
  return {
    id: str(raw.id),
    name: str(raw.name),
    slug: str(raw.slug),
    summary: str(raw.summary),
    contentHtml: str(raw.contentHtml),
    coverImageUrl: raw.coverImageUrl ?? undefined,
    category: toCategory(raw.category),
    region: str(raw.region),
    address: raw.address ?? undefined,
    latitude: num(raw.latitude),
    longitude: num(raw.longitude),
    bestTime: raw.bestTime ?? undefined,
    visitInfo: Array.isArray(raw.visitInfo) ? raw.visitInfo : undefined,
    gallery: Array.isArray(raw.gallery) ? raw.gallery.map(toMedia) : [],
    publishedAt: str(raw.publishedAt, raw.createdAt ?? new Date().toISOString()),
    viewCount: num(raw.viewCount) ?? 0,
    isFeatured: Boolean(raw.isFeatured),
    seoTitle: raw.seoTitle ?? undefined,
    seoDescription: raw.seoDescription ?? undefined,
    ogImageUrl: raw.ogImageUrl ?? undefined,
  };
}

export function toFood(raw: any): Food {
  return {
    id: str(raw.id),
    name: str(raw.name),
    slug: str(raw.slug),
    summary: str(raw.summary),
    contentHtml: str(raw.contentHtml),
    coverImageUrl: raw.coverImageUrl ?? undefined,
    category: toCategory(raw.category),
    season: raw.season ?? undefined,
    originStory: raw.originStory ?? undefined,
    publishedAt: str(raw.publishedAt, raw.createdAt ?? new Date().toISOString()),
    seoTitle: raw.seoTitle ?? undefined,
    seoDescription: raw.seoDescription ?? undefined,
    ogImageUrl: raw.ogImageUrl ?? undefined,
  };
}

export function toEvent(raw: any): EventItem {
  return {
    id: str(raw.id),
    name: str(raw.name),
    slug: str(raw.slug),
    summary: str(raw.summary),
    contentHtml: str(raw.contentHtml),
    coverImageUrl: raw.coverImageUrl ?? undefined,
    locationText: raw.locationText ?? undefined,
    startAt: str(raw.startAt),
    endAt: raw.endAt ?? undefined,
    isRecurring: Boolean(raw.isRecurring),
    destination: raw.destination
      ? { name: str(raw.destination.name), slug: str(raw.destination.slug) }
      : undefined,
    publishedAt: str(raw.publishedAt, raw.createdAt ?? new Date().toISOString()),
    seoTitle: raw.seoTitle ?? undefined,
    seoDescription: raw.seoDescription ?? undefined,
    ogImageUrl: raw.ogImageUrl ?? undefined,
  };
}

export function toCourse(raw: any): LearningCourse {
  const category = toCategory(raw.category);
  return {
    id: str(raw.id),
    title: str(raw.title),
    slug: str(raw.slug),
    description: str(raw.description),
    coverImageUrl: raw.coverImageUrl ?? undefined,
    category: category ?? {
      id: "",
      type: "learning",
      name: "Khác",
      slug: "khac",
    },
    lessonCount: num(raw.lessonCount) ?? 0,
    hasVideo: Boolean(raw.hasVideo),
    publishedAt: str(raw.publishedAt, raw.createdAt ?? new Date().toISOString()),
    seoTitle: raw.seoTitle ?? undefined,
    seoDescription: raw.seoDescription ?? undefined,
    ogImageUrl: raw.ogImageUrl ?? undefined,
  };
}

export function toLesson(raw: any, courseSlug: string): Lesson {
  return {
    id: str(raw.id),
    title: str(raw.title),
    slug: str(raw.slug),
    excerpt: str(raw.excerpt),
    contentHtml: str(raw.contentHtml),
    courseSlug,
    lessonOrder: num(raw.lessonOrder) ?? 0,
    videoUrl: raw.videoUrl ?? undefined,
    durationMinutes: num(raw.durationMinutes),
    publishedAt: str(raw.publishedAt, raw.createdAt ?? new Date().toISOString()),
  };
}

export function toAlbum(raw: any): Album {
  return {
    id: str(raw.id),
    title: str(raw.title),
    slug: str(raw.slug),
    description: str(raw.description),
    coverImageUrl: raw.coverImageUrl ?? undefined,
    items: Array.isArray(raw.items) ? raw.items.map(toMedia) : [],
    publishedAt: str(raw.publishedAt, raw.createdAt ?? new Date().toISOString()),
    seoTitle: raw.seoTitle ?? undefined,
    seoDescription: raw.seoDescription ?? undefined,
    ogImageUrl: raw.ogImageUrl ?? undefined,
  };
}

/** Cấu hình website: API trả về object phẳng key → value. */
export function toSettings(raw: any): SiteSettings {
  const pick = (key: string, fallback = "") => str(raw?.[key], fallback);

  return {
    siteName: pick("site_name", "Người Quảng Bình"),
    slogan: pick("slogan", "Vẻ đẹp quê hương trong từng câu chuyện"),
    aboutShort: pick(
      "about_short",
      "Trang thông tin cộng đồng, phi lợi nhuận, giới thiệu và lan tỏa hình ảnh quê hương Quảng Bình.",
    ),
    hotline: raw?.hotline || undefined,
    email: raw?.email || undefined,
    address: raw?.address || undefined,
    facebookPageUrl: pick(
      "facebook_page_url",
      "https://www.facebook.com/nguoi.quang.binh.chat.phac.gian.di/",
    ),
    footerText: pick(
      "footer_text",
      "© 2026 Người Quảng Bình. Nội dung phi lợi nhuận, phục vụ quảng bá quê hương.",
    ),
  };
}
