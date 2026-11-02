import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { ApiError, buildMeta, readPaging, sendData, serialize } from "../../utils/api";
import { requireAuth } from "../../middleware/auth";
import { requireAdmin, requireSuperAdmin } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import { crudRouter } from "./crud";
import { mediaRouter } from "./media";
import * as s from "./schemas";

export const adminRouter = Router();

/* ---------- CRUD các bảng nội dung ---------- */

adminRouter.use(
  "/articles",
  crudRouter({
    model: "article",
    slugFrom: "title",
    searchFields: ["title", "excerpt"],
    createSchema: s.articleCreateSchema,
    updateSchema: s.articleUpdateSchema,
    hasStatus: true,
    hasAuthor: true,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, fullName: true } },
    },
  }),
);

adminRouter.use(
  "/destinations",
  crudRouter({
    model: "destination",
    slugFrom: "name",
    searchFields: ["name", "summary"],
    createSchema: s.destinationCreateSchema,
    updateSchema: s.destinationUpdateSchema,
    hasStatus: true,
    include: { category: { select: { id: true, name: true, slug: true } } },
  }),
);

adminRouter.use(
  "/foods",
  crudRouter({
    model: "food",
    slugFrom: "name",
    searchFields: ["name", "summary"],
    createSchema: s.foodCreateSchema,
    updateSchema: s.foodUpdateSchema,
    hasStatus: true,
    include: { category: { select: { id: true, name: true, slug: true } } },
  }),
);

adminRouter.use(
  "/events",
  crudRouter({
    model: "event",
    slugFrom: "name",
    searchFields: ["name", "summary"],
    createSchema: s.eventCreateSchema,
    updateSchema: s.eventUpdateSchema,
    hasStatus: true,
    include: { destination: { select: { id: true, name: true, slug: true } } },
  }),
);

adminRouter.use(
  "/courses",
  crudRouter({
    model: "learningCourse",
    slugFrom: "title",
    searchFields: ["title", "description"],
    createSchema: s.courseCreateSchema,
    updateSchema: s.courseUpdateSchema,
    hasStatus: true,
    include: { category: { select: { id: true, name: true, slug: true } } },
  }),
);

adminRouter.use(
  "/albums",
  crudRouter({
    model: "album",
    slugFrom: "title",
    searchFields: ["title", "description"],
    createSchema: s.albumCreateSchema,
    updateSchema: s.albumUpdateSchema,
    hasStatus: true,
  }),
);

adminRouter.use(
  "/categories",
  crudRouter({
    model: "category",
    slugFrom: "name",
    searchFields: ["name", "description"],
    createSchema: s.categoryCreateSchema,
    updateSchema: s.categoryUpdateSchema,
  }),
);

adminRouter.use(
  "/banners",
  crudRouter({
    model: "banner",
    searchFields: ["title", "subtitle"],
    createSchema: s.bannerCreateSchema,
    updateSchema: s.bannerUpdateSchema,
  }),
);

adminRouter.use("/media", mediaRouter);

/* ---------- Sắp xếp lại thứ tự bài trong khóa học ---------- */

const reorderSchema = z.object({
  lessonIds: z.array(z.string().uuid()).min(1, "Chưa có bài nào để sắp xếp"),
});

adminRouter.patch(
  "/courses/:id/reorder",
  requireAuth,
  requireAdmin,
  validate(reorderSchema),
  async (req, res, next) => {
    try {
      const { lessonIds } = req.body as z.infer<typeof reorderSchema>;

      /*
        Cột (courseId, lessonOrder) là duy nhất, nên không thể gán thứ tự mới
        trực tiếp — đổi chỗ hai bài sẽ đụng ràng buộc giữa chừng. Cách làm:
        đẩy tất cả sang dải âm trước, rồi gán lại số dương.
      */
      await prisma.$transaction(async (tx) => {
        for (const [index, id] of lessonIds.entries()) {
          await tx.article.updateMany({
            where: { id, courseId: req.params.id },
            data: { lessonOrder: -(index + 1) },
          });
        }
        for (const [index, id] of lessonIds.entries()) {
          await tx.article.updateMany({
            where: { id, courseId: req.params.id },
            data: { lessonOrder: index + 1 },
          });
        }
        await tx.learningCourse.update({
          where: { id: req.params.id },
          data: { lessonCount: lessonIds.length },
        });
      });

      sendData(res, { reordered: true, lessonCount: lessonIds.length });
    } catch (error) {
      next(error);
    }
  },
);

/* ---------- Cấu hình website ---------- */

adminRouter.get("/settings", requireAuth, async (_req, res, next) => {
  try {
    const rows = await prisma.setting.findMany({ orderBy: { key: "asc" } });
    sendData(res, serialize(rows));
  } catch (error) {
    next(error);
  }
});

const settingsSchema = z.record(z.string().max(100), z.unknown());

adminRouter.patch(
  "/settings",
  requireAuth,
  requireSuperAdmin,
  validate(settingsSchema),
  async (req, res, next) => {
    try {
      const entries = Object.entries(req.body as Record<string, unknown>);

      await prisma.$transaction(
        entries.map(([key, value]) =>
          prisma.setting.upsert({
            where: { key },
            create: { key, value: value as never },
            update: { value: value as never },
          }),
        ),
      );

      sendData(res, { updated: entries.length });
    } catch (error) {
      next(error);
    }
  },
);

/* ---------- Tin nhắn liên hệ ---------- */

adminRouter.get("/contact-messages", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { page, limit, skip } = readPaging(req.query, 20);
    const unreadOnly = (req.query.unread as string) === "true";
    const where = unreadOnly ? { isRead: false } : {};

    const [items, total, unread] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.count({ where: { isRead: false } }),
    ]);

    sendData(res, serialize({ items, unread }), buildMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
});

adminRouter.patch(
  "/contact-messages/:id",
  requireAuth,
  requireAdmin,
  validate(z.object({ isRead: z.boolean() })),
  async (req, res, next) => {
    try {
      const updated = await prisma.contactMessage.update({
        where: { id: req.params.id },
        data: { isRead: (req.body as { isRead: boolean }).isRead },
      });
      sendData(res, serialize(updated));
    } catch (error) {
      next(error);
    }
  },
);

/* ---------- Tài khoản quản trị ---------- */

adminRouter.get("/users", requireAuth, requireSuperAdmin, async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
    sendData(res, serialize(users));
  } catch (error) {
    next(error);
  }
});

adminRouter.post(
  "/users",
  requireAuth,
  requireSuperAdmin,
  validate(s.userCreateSchema),
  async (req, res, next) => {
    try {
      const body = req.body as z.infer<typeof s.userCreateSchema>;

      const created = await prisma.user.create({
        data: {
          email: body.email.toLowerCase(),
          passwordHash: await bcrypt.hash(body.password, 12),
          fullName: body.fullName,
          role: body.role,
          isActive: body.isActive,
        },
        select: { id: true, email: true, fullName: true, role: true, isActive: true },
      });

      sendData(res, serialize(created), undefined, 201);
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.patch(
  "/users/:id",
  requireAuth,
  requireSuperAdmin,
  validate(s.userUpdateSchema),
  async (req, res, next) => {
    try {
      const body = req.body as z.infer<typeof s.userUpdateSchema>;

      // Không cho tự hạ quyền hoặc tự khóa tài khoản của chính mình —
      // dễ dẫn tới không còn ai quản trị được hệ thống.
      if (req.params.id === req.user!.id && (body.role || body.isActive === false)) {
        throw ApiError.badRequest(
          "Không thể tự đổi vai trò hoặc tự khóa tài khoản của chính mình",
        );
      }

      const { password, ...rest } = body;

      const updated = await prisma.user.update({
        where: { id: req.params.id },
        data: {
          ...rest,
          ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
        },
        select: { id: true, email: true, fullName: true, role: true, isActive: true },
      });

      sendData(res, serialize(updated));
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.delete("/users/:id", requireAuth, requireSuperAdmin, async (req, res, next) => {
  try {
    if (req.params.id === req.user!.id) {
      throw ApiError.badRequest("Không thể xóa tài khoản của chính mình");
    }
    await prisma.user.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    });
    sendData(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

/* ---------- Dashboard ---------- */

adminRouter.get("/dashboard/stats", requireAuth, async (_req, res, next) => {
  try {
    const alive = { deletedAt: null };
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 29);
    since.setUTCHours(0, 0, 0, 0);

    const [
      articles,
      destinations,
      foods,
      events,
      categories,
      media,
      courses,
      unreadMessages,
      viewAgg,
      latestArticles,
      topArticles,
      dailyViews,
    ] = await Promise.all([
      prisma.article.count({ where: alive }),
      prisma.destination.count({ where: alive }),
      prisma.food.count({ where: alive }),
      prisma.event.count({ where: alive }),
      prisma.category.count({ where: alive }),
      prisma.media.count({ where: alive }),
      prisma.learningCourse.count({ where: alive }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.pageView.aggregate({ _sum: { viewCount: true } }),
      prisma.article.findMany({
        where: alive,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          publishedAt: true,
          viewCount: true,
          category: { select: { name: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.article.findMany({
        where: { ...alive, status: "published" },
        select: { id: true, title: true, slug: true, viewCount: true },
        orderBy: { viewCount: "desc" },
        take: 5,
      }),
      prisma.pageView.groupBy({
        by: ["viewedDate"],
        where: { viewedDate: { gte: since } },
        _sum: { viewCount: true },
        orderBy: { viewedDate: "asc" },
      }),
    ]);

    sendData(
      res,
      serialize({
        counts: {
          articles,
          destinations,
          foods,
          events,
          categories,
          media,
          courses,
          unreadMessages,
          totalViews: viewAgg._sum.viewCount ?? 0,
        },
        latestArticles,
        topArticles,
        dailyViews: dailyViews.map((row) => ({
          date: row.viewedDate,
          views: row._sum.viewCount ?? 0,
        })),
      }),
    );
  } catch (error) {
    next(error);
  }
});
