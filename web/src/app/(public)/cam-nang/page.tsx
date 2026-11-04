import type { Metadata } from "next";
import { ArticleListPage } from "@/components/content/article-list";

const title = "Cẩm nang du lịch";
const description =
  "Thời điểm nên đi, cách di chuyển, chỗ ở và lịch trình gợi ý — những thứ cần biết trước khi lên đường.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/cam-nang" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <ArticleListPage
      type="guide"
      basePath="/cam-nang"
      title={title}
      description={description}
      breadcrumbLabel="Cẩm nang"
      categoryType="guide"
      searchParams={await searchParams}
    />
  );
}
