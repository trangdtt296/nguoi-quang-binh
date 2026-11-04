import type { Metadata } from "next";
import { ArticleListPage } from "@/components/content/article-list";
import { cultureCategories } from "@/lib/filters";

const title = "Văn hóa & con người";
const description =
  "Lễ hội, nghề truyền thống và những câu chuyện về người Quảng Bình — kể bằng giọng của chính người trong cuộc.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/van-hoa" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <ArticleListPage
      type="culture"
      basePath="/van-hoa"
      title={title}
      description={description}
      breadcrumbLabel="Văn hóa"
      categories={cultureCategories}
      searchParams={await searchParams}
    />
  );
}
