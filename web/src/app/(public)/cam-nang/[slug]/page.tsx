import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/content/article-detail";
import { getArticleBySlug, getArticleSlugsByType } from "@/lib/queries";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getArticleSlugsByType("guide");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.type !== "guide") return { title: "Không tìm thấy bài viết" };

  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt,
    alternates: { canonical: `/cam-nang/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.seoTitle ?? article.title,
      description: article.seoDescription ?? article.excerpt,
      publishedTime: article.publishedAt,
      images: article.ogImageUrl ?? article.coverImageUrl ?? undefined,
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.type !== "guide") notFound();

  return <ArticleDetail article={article} sectionLabel="Cẩm nang" sectionHref="/cam-nang" />;
}
