import { Router } from "express";
import type { ZodSchema } from "zod";
import { prisma } from "../../config/prisma";
import { ApiError, buildMeta, readPaging, sendData, serialize } from "../../utils/api";
import { searchOn } from "../../utils/public-filters";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { canEditContent, canPublish, requireAdmin } from "../../middleware/rbac";
import { uniqueSlug } from "../../utils/slug";

type ModelName =
  | "article"
  | "destination"
  | "food"
  | "event"
  | "album"
  | "learningCourse"
  | "category"
  | "banner";

interface CrudOptions {
  model: ModelName;
  /** Trường dùng để sinh slug ("title" hoặc "name"). Bỏ qua nếu bảng không có slug. */
  slugFrom?: "title" | "name";
  /** Các cột cho phép tìm kiếm bằng từ khóa. */
  searchFields: string[];
  createSchema: ZodSchema;
  updateSchema: ZodSchema;
  /** Bảng có cột status/publishedAt hay không (danh mục và banner thì không). */
  hasStatus?: boolean;
  /** Bảng có cột authorId — dùng để giới hạn quyền sửa của editor. */
  hasAuthor?: boolean;
  include?: Record<string, unknown>;
}

/**
 * Sinh bộ route CRUD chuẩn cho một bảng nội dung.
 *
 * Gom vào một chỗ vì mười bảng có cùng một luồng: danh sách có lọc và phân
 * trang, xem một bản ghi, tạo, sửa, xóa mềm. Viết tay mười lần thì mười lần
 * có cơ hội quên lọc deletedAt hoặc quên kiểm tra quyền.
 */
export function crudRouter(options: CrudOptions): Router {
  const router = Router();
  const delegate = prisma[options.model] as unknown as {
    findMany: (args: unknown) => Promise<Record<string, unknown>[]>;
    findFirst: (args: unknown) => Promise<Record<string, unknown> | null>;
    count: (args: unknown) => Promise<number>;
    create: (args: unknown) => Promise<Record<string, unknown>>;
    update: (args: unknown) => Promise<Record<string, unknown>>;
  };

  // Mọi route quản trị đều cần đăng nhập.
  router.use(requireAuth);

  /* Danh sách */
  router.get("/", async (req, res, next) => {
    try {
      const { page, limit, skip } = readPaging(req.query, 20);
      const { q, status, category, trash } = req.query as Record<string, string>;

      const where = {
        // trash=true để xem thùng rác; mặc định chỉ hiện bản ghi còn sống.
        deletedAt: trash === "true" ? { not: null } : null,
        ...(options.hasStatus && status ? { status } : {}),
        ...(category ? { category: { slug: category } } : {}),
        ...(searchOn(options.searchFields, q) ?? {}),
      };

      const [items, total] = await Promise.all([
        delegate.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip,
          take: limit,
          ...(options.include ? { include: options.include } : {}),
        }),
        delegate.count({ where }),
      ]);

      sendData(res, serialize(items), buildMeta(total, page, limit));
    } catch (error) {
      next(error);
    }
  });

  /* Một bản ghi */
  router.get("/:id", async (req, res, next) => {
    try {
      const item = await delegate.findFirst({
        where: { id: req.params.id },
        ...(options.include ? { include: options.include } : {}),
      });
      if (!item) throw ApiError.notFound();
      sendData(res, serialize(item));
    } catch (error) {
      next(error);
    }
  });

  /* Tạo mới */
  router.post("/", validate(options.createSchema), async (req, res, next) => {
    try {
      const user = req.user!;
      const body = { ...(req.body as Record<string, unknown>) };

      applyPublishRules(body, user.role, options);

      if (options.slugFrom) {
        const source = (body.slug as string) || (body[options.slugFrom] as string);
        body.slug = await uniqueSlug(options.model as never, source);
      }

      if (options.hasAuthor) body.authorId = user.id;

      const created = await delegate.create({ data: body });
      sendData(res, serialize(created), undefined, 201);
    } catch (error) {
      next(error);
    }
  });

  /* Sửa */
  router.patch("/:id", validate(options.updateSchema), async (req, res, next) => {
    try {
      const user = req.user!;
      const existing = await delegate.findFirst({ where: { id: req.params.id } });
      if (!existing) throw ApiError.notFound();

      if (
        options.hasAuthor &&
        !canEditContent(user.role, existing.authorId as string | null, user.id)
      ) {
        throw ApiError.forbidden("Bạn chỉ sửa được nội dung do mình tạo");
      }

      const body = { ...(req.body as Record<string, unknown>) };
      applyPublishRules(body, user.role, options, existing.status as string | undefined);

      if (options.slugFrom && body.slug) {
        body.slug = await uniqueSlug(options.model as never, body.slug as string, req.params.id);
      }

      const updated = await delegate.update({ where: { id: req.params.id }, data: body });
      sendData(res, serialize(updated));
    } catch (error) {
      next(error);
    }
  });

  /* Xóa mềm — chỉ admin trở lên */
  router.delete("/:id", requireAdmin, async (req, res, next) => {
    try {
      await delegate.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });
      sendData(res, { deleted: true });
    } catch (error) {
      next(error);
    }
  });

  /* Khôi phục từ thùng rác */
  router.post("/:id/restore", requireAdmin, async (req, res, next) => {
    try {
      const restored = await delegate.update({
        where: { id: req.params.id },
        data: { deletedAt: null },
      });
      sendData(res, serialize(restored));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

/**
 * Editor không được tự xuất bản: nếu họ gửi status = published thì hạ xuống
 * draft. Và khi chuyển sang published mà chưa có publishedAt thì đặt luôn
 * thời điểm hiện tại, để điều kiện hiển thị công khai hoạt động.
 */
function applyPublishRules(
  body: Record<string, unknown>,
  role: string,
  options: CrudOptions,
  currentStatus?: string,
) {
  if (!options.hasStatus) return;

  if (body.status === "published" && !canPublish(role as never)) {
    body.status = "draft";
  }

  const becomingPublic = body.status === "published" && currentStatus !== "published";
  if (becomingPublic && !body.publishedAt) {
    body.publishedAt = new Date();
  }
}
