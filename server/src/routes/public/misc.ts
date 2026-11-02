import { Router } from "express";
import { z } from "zod";
import type { CategoryType } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError, buildMeta, readPaging, sendData, serialize } from "../../utils/api";
import { notDeleted, publicWhere, searchOn } from "../../utils/public-filters";
import { validate } from "../../middleware/validate";
import { contactLimiter, viewLimiter } from "../../middleware/rate-limit";

export const miscRouter = Router();

/* ---------- Ẩm thực ---------- */

miscRouter.get("/foods", async (req, res, next) => {
  try {
    const { page, limit, skip } = readPaging(req.query);
    const { category, q } = req.query as Record<string, string>;

    const where = {
      ...publicWhere(),
      ...(category ? { category: { slug: category } } : {}),
      ...(searchOn(["name", "summary"], q) ?? {}),
    };

    const [items, total] = await Promise.all([
      prisma.food.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          summary: true,
          coverImageUrl: true,
          season: true,
          publishedAt: true,
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.food.count({ where }),
    ]);

    sendData(res, serialize(items), buildMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
});

miscRouter.get("/foods/:slug", async (req, res, next) => {
  try {
    const item = await prisma.food.findFirst({
      where: { slug: req.params.slug, ...publicWhere() },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    if (!item) throw ApiError.notFound("Không tìm thấy món này");
    sendData(res, serialize({ ...item, content: undefined }));
  } catch (error) {
    next(error);
  }
});

/* ---------- Sự kiện ---------- */

miscRouter.get("/events", async (req, res, next) => {
  try {
    const { page, limit, skip } = readPaging(req.query);
    const upcoming = (req.query.upcoming as string) === "true";

    const where = {
      ...publicWhere(),
      ...(upcoming ? { startAt: { gte: new Date() } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.event.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          summary: true,
          coverImageUrl: true,
          locationText: true,
          startAt: true,
          endAt: true,
          isRecurring: true,
          destination: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { startAt: upcoming ? "asc" : "desc" },
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    sendData(res, serialize(items), buildMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
});

miscRouter.get("/events/:slug", async (req, res, next) => {
  try {
    const item = await prisma.event.findFirst({
      where: { slug: req.params.slug, ...publicWhere() },
      include: { destination: { select: { id: true, name: true, slug: true } } },
    });
    if (!item) throw ApiError.notFound("Không tìm thấy sự kiện này");
    sendData(res, serialize({ ...item, content: undefined }));
  } catch (error) {
    next(error);
  }
});

/* ---------- Album ---------- */

miscRouter.get("/albums", async (req, res, next) => {
  try {
    const { page, limit, skip } = readPaging(req.query);
    const where = publicWhere();

    const [items, total] = await Promise.all([
      prisma.album.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImageUrl: true,
          publishedAt: true,
          _count: { select: { items: true } },
        },
        orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.album.count({ where }),
    ]);

    sendData(res, serialize(items), buildMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
});

miscRouter.get("/albums/:slug", async (req, res, next) => {
  try {
    const album = await prisma.album.findFirst({
      where: { slug: req.params.slug, ...publicWhere() },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          select: {
            media: {
              select: {
                id: true,
                url: true,
                thumbnailUrl: true,
                type: true,
                altText: true,
                caption: true,
                width: true,
                height: true,
              },
            },
          },
        },
      },
    });

    if (!album) throw ApiError.notFound("Không tìm thấy album này");

    sendData(
      res,
      serialize({ ...album, items: album.items.map((row) => row.media) }),
    );
  } catch (error) {
    next(error);
  }
});

/* ---------- Danh mục, banner, cấu hình ---------- */

miscRouter.get("/categories", async (req, res, next) => {
  try {
    const type = req.query.type as CategoryType | undefined;
    const items = await prisma.category.findMany({
      where: { ...notDeleted, isActive: true, ...(type ? { type } : {}) },
      select: { id: true, type: true, name: true, slug: true, description: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    sendData(res, serialize(items));
  } catch (error) {
    next(error);
  }
});

miscRouter.get("/banners", async (req, res, next) => {
  try {
    const position = req.query.position as string | undefined;
    const now = new Date();

    const items = await prisma.banner.findMany({
      where: {
        ...notDeleted,
        isActive: true,
        ...(position ? { position: position as never } : {}),
        AND: [
          { OR: [{ startAt: null }, { startAt: { lte: now } }] },
          { OR: [{ endAt: null }, { endAt: { gte: now } }] },
        ],
      },
      orderBy: { sortOrder: "asc" },
    });

    sendData(res, serialize(items));
  } catch (error) {
    next(error);
  }
});

miscRouter.get("/settings", async (_req, res, next) => {
  try {
    const rows = await prisma.setting.findMany();
    // Trả về dạng object phẳng cho frontend dùng trực tiếp.
    const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    sendData(res, serialize(settings));
  } catch (error) {
    next(error);
  }
});

/* ---------- Tìm kiếm chung ---------- */

miscRouter.get("/search", async (req, res, next) => {
  try {
    const q = (req.query.q as string | undefined)?.trim();
    if (!q || q.length < 2) {
      throw ApiError.badRequest("Từ khóa tìm kiếm phải có ít nhất 2 ký tự");
    }

    const take = 5;
    const [destinations, articles, foods, courses] = await Promise.all([
      prisma.destination.findMany({
        where: { ...publicWhere(), ...searchOn(["name", "summary"], q) },
        select: { id: true, name: true, slug: true, summary: true, coverImageUrl: true },
        take,
      }),
      prisma.article.findMany({
        where: { ...publicWhere(), ...searchOn(["title", "excerpt"], q) },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          type: true,
          coverImageUrl: true,
        },
        take,
      }),
      prisma.food.findMany({
        where: { ...publicWhere(), ...searchOn(["name", "summary"], q) },
        select: { id: true, name: true, slug: true, summary: true, coverImageUrl: true },
        take,
      }),
      prisma.learningCourse.findMany({
        where: { ...publicWhere(), ...searchOn(["title", "description"], q) },
        select: { id: true, title: true, slug: true, description: true },
        take,
      }),
    ]);

    sendData(
      res,
      serialize({
        keyword: q,
        destinations,
        articles,
        foods,
        courses,
        total:
          destinations.length + articles.length + foods.length + courses.length,
      }),
    );
  } catch (error) {
    next(error);
  }
});

/* ---------- Form liên hệ ---------- */

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Họ tên quá ngắn").max(150),
  email: z.string().trim().email("Email không hợp lệ").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Nội dung cần ít nhất 10 ký tự").max(5000),
});

/**
 * Lưu tin nhắn vào database cho admin đọc trong CMS, không gửi email —
 * Render gói free chặn cổng SMTP 25/465/587 (xem docs/02-kien-truc.md).
 */
miscRouter.post("/contact", contactLimiter, validate(contactSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof contactSchema>;

    await prisma.contactMessage.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone || null,
        subject: body.subject || null,
        message: body.message,
        ipAddress: req.ip ?? null,
      },
    });

    sendData(res, { received: true }, undefined, 201);
  } catch (error) {
    next(error);
  }
});

/* ---------- Ghi nhận lượt xem ---------- */

const VIEWABLE = ["article", "destination", "food", "event", "album"] as const;
type Viewable = (typeof VIEWABLE)[number];

/**
 * Tăng lượt xem. Ghi hai nơi: cột viewCount của bản ghi (hiển thị nhanh) và
 * bảng page_views gộp theo ngày (vẽ biểu đồ cho Dashboard).
 */
miscRouter.post("/views/:type/:id", viewLimiter, async (req, res, next) => {
  try {
    const type = req.params.type as Viewable;
    if (!VIEWABLE.includes(type)) throw ApiError.badRequest("Loại nội dung không hợp lệ");

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await prisma.pageView.upsert({
      where: {
        contentType_contentId_viewedDate: {
          contentType: type,
          contentId: req.params.id,
          viewedDate: today,
        },
      },
      create: {
        contentType: type,
        contentId: req.params.id,
        viewedDate: today,
        viewCount: 1,
      },
      update: { viewCount: { increment: 1 } },
    });

    // Chỉ các bảng có cột viewCount mới cộng dồn; event và album thì không.
    const where = { id: req.params.id };
    const bump = { viewCount: { increment: 1 } };
    if (type === "article") await prisma.article.updateMany({ where, data: bump });
    else if (type === "destination")
      await prisma.destination.updateMany({ where, data: bump });
    else if (type === "food") await prisma.food.updateMany({ where, data: bump });

    sendData(res, { counted: true });
  } catch (error) {
    next(error);
  }
});
