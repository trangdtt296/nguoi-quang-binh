import { Router } from "express";
import { prisma } from "../../config/prisma";
import { ApiError, buildMeta, readPaging, sendData, serialize } from "../../utils/api";
import { publicWhere } from "../../utils/public-filters";

export const coursesRouter = Router();

const lessonSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  lessonOrder: true,
  videoUrl: true,
  durationMinutes: true,
  publishedAt: true,
};

/** Danh sách khóa học, lọc theo lĩnh vực. Không có trục trình độ. */
coursesRouter.get("/", async (req, res, next) => {
  try {
    const { page, limit, skip } = readPaging(req.query);
    const { category } = req.query as Record<string, string>;

    const where = {
      ...publicWhere(),
      ...(category ? { category: { slug: category } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.learningCourse.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImageUrl: true,
          lessonCount: true,
          viewCount: true,
          publishedAt: true,
          category: { select: { id: true, name: true, slug: true } },
          // Đếm số bài có video, để thẻ khóa học ngoài trang danh sách biết
          // mà ghi "Có video" hay "Bài viết".
          _count: { select: { lessons: { where: { videoUrl: { not: null } } } } },
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.learningCourse.count({ where }),
    ]);

    const withVideoFlag = items.map(({ _count, ...course }) => ({
      ...course,
      hasVideo: _count.lessons > 0,
    }));

    sendData(res, serialize(withVideoFlag), buildMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
});

/** Chi tiết khóa học kèm danh sách bài theo đúng thứ tự. */
coursesRouter.get("/:courseSlug", async (req, res, next) => {
  try {
    const course = await prisma.learningCourse.findFirst({
      where: { slug: req.params.courseSlug, ...publicWhere() },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        lessons: {
          where: publicWhere(),
          select: lessonSelect,
          orderBy: { lessonOrder: "asc" },
        },
      },
    });

    if (!course) throw ApiError.notFound("Không tìm thấy khóa học này");

    sendData(res, serialize(course));
  } catch (error) {
    next(error);
  }
});

/** Một bài học, kèm bài trước và bài sau để điều hướng. */
coursesRouter.get("/:courseSlug/:lessonSlug", async (req, res, next) => {
  try {
    const course = await prisma.learningCourse.findFirst({
      where: { slug: req.params.courseSlug, ...publicWhere() },
      select: { id: true, title: true, slug: true, lessonCount: true },
    });

    if (!course) throw ApiError.notFound("Không tìm thấy khóa học này");

    const lesson = await prisma.article.findFirst({
      where: {
        slug: req.params.lessonSlug,
        courseId: course.id,
        type: "lesson",
        ...publicWhere(),
      },
      select: { ...lessonSelect, contentHtml: true },
    });

    if (!lesson) throw ApiError.notFound("Không tìm thấy bài học này");

    const siblings = await prisma.article.findMany({
      where: { courseId: course.id, type: "lesson", ...publicWhere() },
      select: { title: true, slug: true, lessonOrder: true, durationMinutes: true },
      orderBy: { lessonOrder: "asc" },
    });

    const index = siblings.findIndex((row) => row.slug === lesson.slug);

    sendData(
      res,
      serialize({
        course,
        lesson,
        lessons: siblings,
        previous: index > 0 ? siblings[index - 1] : null,
        next: index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null,
      }),
    );
  } catch (error) {
    next(error);
  }
});
