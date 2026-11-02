import { Router } from "express";
import { prisma } from "../../config/prisma";
import { ApiError, buildMeta, readPaging, sendData, serialize } from "../../utils/api";
import { publicWhere, searchOn } from "../../utils/public-filters";

export const destinationsRouter = Router();

const listSelect = {
  id: true,
  name: true,
  slug: true,
  summary: true,
  coverImageUrl: true,
  region: true,
  bestTime: true,
  viewCount: true,
  isFeatured: true,
  publishedAt: true,
  category: { select: { id: true, name: true, slug: true, type: true } },
};

destinationsRouter.get("/", async (req, res, next) => {
  try {
    const { page, limit, skip } = readPaging(req.query);
    const { category, region, q, sort, featured } = req.query as Record<string, string>;

    const where = {
      ...publicWhere(),
      ...(category ? { category: { slug: category } } : {}),
      ...(region ? { region } : {}),
      ...(featured === "true" ? { isFeatured: true } : {}),
      ...(searchOn(["name", "summary"], q) ?? {}),
    };

    const orderBy =
      sort === "popular"
        ? { viewCount: "desc" as const }
        : sort === "name"
          ? { name: "asc" as const }
          : { publishedAt: "desc" as const };

    const [items, total] = await Promise.all([
      prisma.destination.findMany({ where, select: listSelect, orderBy, skip, take: limit }),
      prisma.destination.count({ where }),
    ]);

    sendData(res, serialize(items), buildMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
});

destinationsRouter.get("/:slug", async (req, res, next) => {
  try {
    const item = await prisma.destination.findFirst({
      where: { slug: req.params.slug, ...publicWhere() },
      include: {
        category: { select: { id: true, name: true, slug: true, type: true } },
        media: {
          orderBy: { sortOrder: "asc" },
          select: {
            sortOrder: true,
            media: { select: { id: true, url: true, altText: true, caption: true } },
          },
        },
        articles: {
          select: {
            article: {
              select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                coverImageUrl: true,
                type: true,
                publishedAt: true,
                status: true,
                deletedAt: true,
              },
            },
          },
        },
      },
    });

    if (!item) throw ApiError.notFound("Không tìm thấy điểm đến này");

    // Chỉ trả về bài liên quan đang thực sự hiển thị công khai.
    const relatedArticles = item.articles
      .map((row) => row.article)
      .filter((a) => a.status === "published" && !a.deletedAt)
      .map(({ status: _s, deletedAt: _d, ...rest }) => rest);

    sendData(
      res,
      serialize({
        ...item,
        gallery: item.media.map((row) => row.media),
        media: undefined,
        articles: undefined,
        relatedArticles,
      }),
    );
  } catch (error) {
    next(error);
  }
});
