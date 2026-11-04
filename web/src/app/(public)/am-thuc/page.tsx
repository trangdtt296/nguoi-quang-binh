import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb, ButtonLink, EmptyState, Skeleton } from "@/components/ui";
import { FoodCard } from "@/components/content/cards";
import { FilterBar } from "@/components/content/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { foodCategories } from "@/lib/filters";
import { DEFAULT_PAGE_SIZE, getFoods } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

const title = "Ẩm thực quê hương";
const description =
  "Món ăn, đặc sản và câu chuyện đằng sau mỗi món — mặn mòi vị biển miền Trung.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/am-thuc" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const category = first(params.category);
  const page = Number(first(params.page) ?? 1);

  const result = await getFoods({ category, page, limit: DEFAULT_PAGE_SIZE });

  const buildHref = (nextPage: number) => {
    const next = new URLSearchParams();
    if (category) next.set("category", category);
    if (nextPage > 1) next.set("page", String(nextPage));
    const queryString = next.toString();
    return queryString ? `/am-thuc?${queryString}` : "/am-thuc";
  };

  return (
    <div className="bg-surface-alt pb-20">
      <div className="container-page pt-7">
        <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Ẩm thực" }]} />
      </div>

      <div className="container-page pt-6">
        <h1 className="text-[32px] font-bold leading-tight tracking-[-0.01em] md:text-[40px]">
          {title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[17px] leading-relaxed text-muted">
          {description}
        </p>
      </div>

      <div className="container-page pt-7">
        <Suspense fallback={<Skeleton className="h-24" />}>
          <FilterBar
            basePath="/am-thuc"
            groups={[
              {
                param: "category",
                label: "Phân loại",
                options: foodCategories.map((c) => ({ label: c.name, value: c.slug })),
              },
            ]}
          />
        </Suspense>
      </div>

      <div className="container-page mt-7">
        <p className="text-[14.5px] text-muted" aria-live="polite">
          Có <strong className="text-ink">{formatNumber(result.total)}</strong> món
        </p>
      </div>

      <div className="container-page mt-5">
        {result.items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {result.items.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Chưa có món nào trong phân loại này"
            action={
              <ButtonLink href="/am-thuc" variant="ghost">
                Xem tất cả món
              </ButtonLink>
            }
          />
        )}
      </div>

      {result.items.length ? (
        <div className="container-page mt-12">
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            buildHref={buildHref}
          />
        </div>
      ) : null}
    </div>
  );
}
