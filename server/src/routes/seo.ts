import { Router } from "express";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { publicWhere } from "../utils/public-filters";

export const seoRouter = Router();

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (char) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]!,
  );

/**
 * Sitemap sinh từ database, nên nội dung mới xuất bản có mặt ngay mà không
 * phải build lại frontend.
 */
seoRouter.get("/sitemap.xml", async (_req, res, next) => {
  try {
    const site = env.SITE_URL.replace(/\/$/, "");

    const [destinations, articles, foods, courses, albums, lessons] = await Promise.all([
      prisma.destination.findMany({
        where: publicWhere(),
        select: { slug: true, updatedAt: true },
      }),
      prisma.article.findMany({
        where: { ...publicWhere(), type: { not: "lesson" } },
        select: { slug: true, type: true, updatedAt: true },
      }),
      prisma.food.findMany({ where: publicWhere(), select: { slug: true, updatedAt: true } }),
      prisma.learningCourse.findMany({
        where: publicWhere(),
        select: { slug: true, updatedAt: true },
      }),
      prisma.album.findMany({ where: publicWhere(), select: { slug: true, updatedAt: true } }),
      prisma.article.findMany({
        where: { ...publicWhere(), type: "lesson", course: { isNot: null } },
        select: { slug: true, updatedAt: true, course: { select: { slug: true } } },
      }),
    ]);

    const staticPaths = [
      "/",
      "/gioi-thieu",
      "/diem-den",
      "/van-hoa",
      "/am-thuc",
      "/tin-tuc",
      "/cam-nang",
      "/goc-hoc-tap",
      "/thu-vien",
      "/lien-he",
    ];

    const articlePath = (type: string) =>
      type === "culture" ? "/van-hoa" : type === "guide" ? "/cam-nang" : "/tin-tuc";

    const urls = [
      ...staticPaths.map((path) => ({ loc: path, lastmod: null as Date | null })),
      ...destinations.map((d) => ({ loc: `/diem-den/${d.slug}`, lastmod: d.updatedAt })),
      ...articles.map((a) => ({
        loc: `${articlePath(a.type)}/${a.slug}`,
        lastmod: a.updatedAt,
      })),
      ...foods.map((f) => ({ loc: `/am-thuc/${f.slug}`, lastmod: f.updatedAt })),
      ...courses.map((c) => ({ loc: `/goc-hoc-tap/${c.slug}`, lastmod: c.updatedAt })),
      ...lessons.map((l) => ({
        loc: `/goc-hoc-tap/${l.course!.slug}/${l.slug}`,
        lastmod: l.updatedAt,
      })),
      ...albums.map((a) => ({ loc: `/thu-vien/${a.slug}`, lastmod: a.updatedAt })),
    ];

    const body = urls
      .map(
        (url) =>
          `  <url><loc>${escapeXml(site + url.loc)}</loc>${
            url.lastmod ? `<lastmod>${url.lastmod.toISOString()}</lastmod>` : ""
          }</url>`,
      )
      .join("\n");

    res.type("application/xml").send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`,
    );
  } catch (error) {
    next(error);
  }
});

seoRouter.get("/robots.txt", (_req, res) => {
  const site = env.SITE_URL.replace(/\/$/, "");
  res
    .type("text/plain")
    .send(`User-agent: *\nDisallow: /admin\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
});
