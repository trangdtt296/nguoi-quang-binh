import { Router } from "express";
import type { ArticleType } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError, buildMeta, readPaging, sendData, serialize } from "../../utils/api";
import { publicWhere, searchOn } from "../../utils/public-filters";

export const articlesRouter = Router();

const listSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImageUrl: true,
  type: true,
  tags: true,
  viewCount: true,
  isFeatured: true,
  publishedAt: true,
  category: { select: { id: true, name: true, slug: true, type: true } },
  author: { select: { id: true, fullName: true } },
};

const ARTICLE_TYPES: ArticleType[] = ["news", "culture", "guide", "lesson"];

articlesRouter.get("/", async (req, res, next) => {
  try {
    const { page, limit, skip } = readPaging(req.query);
    const { type, category, q, featured } = req.query as Record<string, string>;

    // Bài học thuộc Góc học tập, có endpoint riêng — không trộn vào tin tức.
    const typeFilter = ARTICLE_TYPES.includes(type as ArticleType)
      ? { type: type as ArticleType }
      : { type: { not: "lesson" as const } };

    const where = {
      ...publicWhere(),
      ...typeFilter,
      ...(category ? { category: { slug: category } } : {}),
      ...(featured === "true" ? { isFeatured: true } : {}),
      ...(searchOn(["title", "excerpt"], q) ?? {}),
    };

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: listSelect,
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    sendData(res, serialize(items), buildMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
});

articlesRouter.get("/:slug", async (req, res, next) => {
  try {
    const item = await prisma.article.findFirst({
      where: { slug: req.params.slug, ...publicWhere() },
      include: {
        category: { select: { id: true, name: true, slug: true, type: true } },
        author: { select: { id: true, fullName: true } },
        destinations: {
          select: {
            destination: {
              select: { id: true, name: true, slug: true, coverImageUrl: true },
            },
          },
        },
      },
    });

    if (!item) throw ApiError.notFound("Không tìm thấy bài viết này");

    // Bài liên quan: ưu tiên cùng danh mục, sau đó cùng loại.
    const related = await prisma.article.findMany({
      where: {
        ...publicWhere(),
        id: { not: item.id },
        type: item.type,
        ...(item.categoryId ? { categoryId: item.categoryId } : {}),
      },
      select: listSelect,
      orderBy: { publishedAt: "desc" },
      take: 3,
    });

    sendData(
      res,
      serialize({
        ...item,
        // Nội dung TipTap dạng JSON chỉ cần cho CMS, frontend dùng contentHtml.
        content: undefined,
        relatedDestinations: item.destinations.map((row) => row.destination),
        destinations: undefined,
        related,
      }),
    );
  } catch (error) {
    next(error);
  }
});
