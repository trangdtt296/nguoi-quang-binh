import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/content/article-detail";
import { getArticleWithRelated } from "@/lib/queries";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const found = await getArticleWithRelated(slug);
  if (!found || found.article.type !== "culture") {
    return { title: "Không tìm thấy bài viết" };
  }

  const { article } = found;
  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt,
    alternates: { canonical: `/van-hoa/${article.slug}` },
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
  const found = await getArticleWithRelated(slug);
  if (!found || found.article.type !== "culture") notFound();

  return (
    <ArticleDetail
      article={found.article}
      related={found.related}
      sectionLabel="Văn hóa"
      sectionHref="/van-hoa"
    />
  );
}
