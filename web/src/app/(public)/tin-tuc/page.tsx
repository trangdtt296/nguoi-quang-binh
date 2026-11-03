import type { Metadata } from "next";
import { ArticleListPage } from "@/components/content/article-list";
import { articleCategories } from "@/lib/mock/categories";

const title = "Tin tức & sự kiện";
const description =
  "Tin tức, hoạt động du lịch, sự kiện và chuyện thường ngày ở Quảng Bình.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tin-tuc" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <ArticleListPage
      type="news"
      basePath="/tin-tuc"
      title={title}
      description={description}
      breadcrumbLabel="Tin tức"
      categories={articleCategories}
      searchParams={await searchParams}
    />
  );
}
