import { Suspense } from "react";
import type { ArticleType, Category } from "@/types/content";
import { Breadcrumb, ButtonLink, EmptyState, Skeleton } from "@/components/ui";
import { ArticleCard } from "@/components/content/cards";
import { FilterBar } from "@/components/content/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { DEFAULT_PAGE_SIZE, getArticles } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

/**
 * Khung chung cho ba trang danh sách bài viết: Tin tức, Văn hóa, Cẩm nang.
 *
 * Ba trang đó chỉ khác nhau ở loại bài, tiêu đề và bộ danh mục, nên dùng
 * chung một component — sửa bố cục một lần là cả ba đổi theo.
 */
export async function ArticleListPage({
  type,
  basePath,
  title,
  description,
  breadcrumbLabel,
  categories,
  searchParams,
}: {
  type: ArticleType;
  basePath: string;
  title: string;
  description: string;
  breadcrumbLabel: string;
  categories: Category[];
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const category = first(searchParams.category);
  const q = first(searchParams.q);
  const page = Number(first(searchParams.page) ?? 1);

  const result = await getArticles({
    type,
    category,
    q,
    page,
    limit: DEFAULT_PAGE_SIZE,
  });

  const buildHref = (nextPage: number) => {
    const next = new URLSearchParams();
    if (category) next.set("category", category);
    if (q) next.set("q", q);
    if (nextPage > 1) next.set("page", String(nextPage));
    const queryString = next.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  return (
    <div className="bg-surface-alt pb-20">
      <div className="container-page pt-7">
        <Breadcrumb
          items={[{ label: "Trang chủ", href: "/" }, { label: breadcrumbLabel }]}
        />
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
        <Suspense fallback={<Skeleton className="h-28" />}>
          <FilterBar
            basePath={basePath}
            searchPlaceholder="Tìm theo tiêu đề"
            groups={[
              {
                param: "category",
                label: "Chuyên mục",
                options: categories.map((c) => ({ label: c.name, value: c.slug })),
              },
            ]}
          />
        </Suspense>
      </div>

      <div className="container-page mt-7">
        <p className="text-[14.5px] text-muted" aria-live="polite">
          Tìm thấy <strong className="text-ink">{formatNumber(result.total)}</strong> bài
        </p>
      </div>

      <div className="container-page mt-5">
        {result.items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((item) => (
              <ArticleCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Không có bài nào khớp với bộ lọc"
            description="Thử bỏ bớt điều kiện lọc hoặc dùng từ khóa khác."
            action={
              <ButtonLink href={basePath} variant="ghost">
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
