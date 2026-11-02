import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb, ButtonLink, EmptyState, Skeleton } from "@/components/ui";
import { DestinationCard } from "@/components/content/cards";
import { FilterBar } from "@/components/content/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { destinationCategories, regions } from "@/lib/mock/categories";
import { getDestinations, DEFAULT_PAGE_SIZE } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Khám phá điểm đến",
  description:
    "Hang động, biển, sông suối, núi rừng và di tích trên khắp dải đất Quảng Bình.",
  alternates: { canonical: "/diem-den" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const category = first(params.category);
  const region = first(params.region);
  const q = first(params.q);
  const sort = (first(params.sort) ?? "newest") as "newest" | "popular" | "name";
  const page = Number(first(params.page) ?? 1);

  const result = await getDestinations({
    category,
    region,
    q,
    sort,
    page,
    limit: DEFAULT_PAGE_SIZE,
  });

  const buildHref = (nextPage: number) => {
    const next = new URLSearchParams();
    if (category) next.set("category", category);
    if (region) next.set("region", region);
    if (q) next.set("q", q);
    if (sort !== "newest") next.set("sort", sort);
    if (nextPage > 1) next.set("page", String(nextPage));
    const queryString = next.toString();
    return queryString ? `/diem-den?${queryString}` : "/diem-den";
  };

  return (
    <div className="bg-surface-alt pb-20">
      <div className="container-page pt-7">
        <Breadcrumb
          items={[{ label: "Trang chủ", href: "/" }, { label: "Khám phá điểm đến" }]}
        />
      </div>

      <div className="container-page pt-6">
        <h1 className="text-[32px] font-bold leading-tight tracking-[-0.01em] md:text-[40px]">
          Khám phá điểm đến
        </h1>
        <p className="mt-3 max-w-[60ch] text-[17px] leading-relaxed text-muted">
          Hang động, biển, sông suối, núi rừng và di tích trên khắp dải đất Quảng Bình.
        </p>
      </div>

      <div className="container-page pt-7">
        <Suspense fallback={<Skeleton className="h-52" />}>
          <FilterBar
            basePath="/diem-den"
            searchPlaceholder="Tìm tên điểm đến, ví dụ: Sơn Đoòng"
            groups={[
              {
                param: "category",
                label: "Loại hình",
                options: destinationCategories.map((c) => ({
                  label: c.name,
                  value: c.slug,
                })),
              },
              {
                param: "region",
                label: "Khu vực",
                options: regions.map((r) => ({ label: r, value: r })),
              },
            ]}
            sortOptions={[
              { label: "Mới nhất", value: "newest" },
              { label: "Xem nhiều nhất", value: "popular" },
              { label: "Tên A → Z", value: "name" },
            ]}
          />
        </Suspense>
      </div>

      <div className="container-page mt-7">
        <p className="text-[14.5px] text-muted" aria-live="polite">
          Tìm thấy <strong className="text-ink">{formatNumber(result.total)}</strong>{" "}
          điểm đến
        </p>
      </div>

      <div className="container-page mt-5">
        {result.items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((item) => (
              <DestinationCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Không có điểm đến nào khớp với bộ lọc"
            description="Thử bỏ bớt điều kiện lọc hoặc dùng từ khóa khác."
            action={
              <ButtonLink href="/diem-den" variant="ghost">
                Xóa bộ lọc
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
