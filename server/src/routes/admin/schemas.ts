import { z } from "zod";

/** Các trường SEO dùng chung cho mọi loại nội dung. */
const seo = {
  seoTitle: z.string().trim().max(255).optional().nullable(),
  seoDescription: z.string().trim().max(320).optional().nullable(),
  ogImageUrl: z.string().trim().url().optional().nullable(),
};

const status = z.enum(["draft", "published", "scheduled", "archived"]);
const optionalUrl = z.string().trim().url().optional().nullable();
const optionalId = z.string().uuid().optional().nullable();

/** Ngày giờ nhận dạng chuỗi ISO rồi chuyển sang Date cho Prisma. */
const dateField = z
  .string()
  .datetime({ message: "Thời gian phải ở định dạng ISO" })
  .transform((value) => new Date(value));

/* ---------- Bài viết ---------- */

export const articleCreateSchema = z.object({
  title: z.string().trim().min(3, "Tiêu đề quá ngắn").max(255),
  slug: z.string().trim().max(280).optional(),
  excerpt: z.string().trim().max(500).optional().nullable(),
  content: z.unknown().default({}),
  contentHtml: z.string().optional().nullable(),
  coverImageUrl: optionalUrl,
  type: z.enum(["news", "culture", "guide", "lesson"]),
  categoryId: optionalId,
  tags: z.array(z.string().trim().max(50)).max(20).default([]),
  status: status.default("draft"),
  publishedAt: dateField.optional().nullable(),
  isFeatured: z.boolean().default(false),
  // Chỉ dùng khi type = lesson
  courseId: optionalId,
  lessonOrder: z.number().int().positive().optional().nullable(),
  videoUrl: optionalUrl,
  durationMinutes: z.number().int().positive().max(600).optional().nullable(),
  ...seo,
});

export const articleUpdateSchema = articleCreateSchema.partial();

/* ---------- Điểm đến ---------- */

export const destinationCreateSchema = z.object({
  name: z.string().trim().min(2).max(255),
  slug: z.string().trim().max(280).optional(),
  summary: z.string().trim().max(500).optional().nullable(),
  content: z.unknown().optional(),
  contentHtml: z.string().optional().nullable(),
  coverImageUrl: optionalUrl,
  categoryId: optionalId,
  region: z.string().trim().max(120).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  bestTime: z.string().trim().max(200).optional().nullable(),
  visitInfo: z
    .array(z.object({ label: z.string().trim().max(100), value: z.string().trim().max(500) }))
    .max(12)
    .optional()
    .nullable(),
  status: status.default("draft"),
  publishedAt: dateField.optional().nullable(),
  isFeatured: z.boolean().default(false),
  ...seo,
});

export const destinationUpdateSchema = destinationCreateSchema.partial();

/* ---------- Ẩm thực ---------- */

export const foodCreateSchema = z.object({
  name: z.string().trim().min(2).max(255),
  slug: z.string().trim().max(280).optional(),
  summary: z.string().trim().max(500).optional().nullable(),
  content: z.unknown().optional(),
  contentHtml: z.string().optional().nullable(),
  coverImageUrl: optionalUrl,
  categoryId: optionalId,
  season: z.string().trim().max(120).optional().nullable(),
  originStory: z.string().trim().max(5000).optional().nullable(),
  whereToEat: z
    .array(z.object({ name: z.string().trim().max(200), address: z.string().trim().max(500) }))
    .max(20)
    .optional()
    .nullable(),
  status: status.default("draft"),
  publishedAt: dateField.optional().nullable(),
  isFeatured: z.boolean().default(false),
  ...seo,
});

export const foodUpdateSchema = foodCreateSchema.partial();

/* ---------- Sự kiện ---------- */

export const eventCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(255),
    slug: z.string().trim().max(280).optional(),
    summary: z.string().trim().max(500).optional().nullable(),
    content: z.unknown().optional(),
    contentHtml: z.string().optional().nullable(),
    coverImageUrl: optionalUrl,
    categoryId: optionalId,
    destinationId: optionalId,
    locationText: z.string().trim().max(255).optional().nullable(),
    startAt: dateField,
    endAt: dateField.optional().nullable(),
    isRecurring: z.boolean().default(false),
    status: status.default("draft"),
    publishedAt: dateField.optional().nullable(),
    ...seo,
  })
  .refine((data) => !data.endAt || data.endAt >= data.startAt, {
    message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    path: ["endAt"],
  });

export const eventUpdateSchema = eventCreateSchema.innerType().partial();

/* ---------- Khóa học ---------- */

export const courseCreateSchema = z.object({
  title: z.string().trim().min(3).max(255),
  slug: z.string().trim().max(280).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  coverImageUrl: optionalUrl,
  categoryId: optionalId,
  status: status.default("draft"),
  publishedAt: dateField.optional().nullable(),
  isFeatured: z.boolean().default(false),
  ...seo,
});

export const courseUpdateSchema = courseCreateSchema.partial();

/* ---------- Album ---------- */

export const albumCreateSchema = z.object({
  title: z.string().trim().min(2).max(255),
  slug: z.string().trim().max(280).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  coverImageUrl: optionalUrl,
  categoryId: optionalId,
  status: status.default("draft"),
  publishedAt: dateField.optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  ...seo,
});

export const albumUpdateSchema = albumCreateSchema.partial();

/* ---------- Danh mục ---------- */

export const categoryCreateSchema = z.object({
  type: z.enum(["article", "destination", "food", "event", "culture", "guide", "learning"]),
  name: z.string().trim().min(1).max(150),
  slug: z.string().trim().max(180).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  parentId: optionalId,
  coverImageUrl: optionalUrl,
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

/* ---------- Banner ---------- */

export const bannerCreateSchema = z.object({
  title: z.string().trim().min(1).max(255),
  subtitle: z.string().trim().max(500).optional().nullable(),
  imageUrl: optionalUrl,
  mobileImageUrl: optionalUrl,
  linkUrl: optionalUrl,
  position: z.enum(["home_hero", "home_middle", "sidebar"]).default("home_hero"),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  startAt: dateField.optional().nullable(),
  endAt: dateField.optional().nullable(),
});

export const bannerUpdateSchema = bannerCreateSchema.partial();

/* ---------- Tài khoản ---------- */

export const userCreateSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(10, "Mật khẩu phải dài ít nhất 10 ký tự").max(128),
  fullName: z.string().trim().min(2).max(150),
  role: z.enum(["editor", "admin", "super_admin"]).default("editor"),
  isActive: z.boolean().default(true),
});

export const userUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(150).optional(),
  role: z.enum(["editor", "admin", "super_admin"]).optional(),
  isActive: z.boolean().optional(),
  avatarUrl: optionalUrl,
  password: z.string().min(10).max(128).optional(),
});
