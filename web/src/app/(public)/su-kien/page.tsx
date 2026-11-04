import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb, ButtonLink, EmptyState, Skeleton } from "@/components/ui";
import { EventCard } from "@/components/content/cards";
import { FilterBar } from "@/components/content/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { DEFAULT_PAGE_SIZE, getEvents } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

const title = "Sự kiện & lễ hội";
const description =
  "Lễ hội, phiên chợ và hoạt động cộng đồng ở Quảng Bình — biết trước để kịp về.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/su-kien" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const when = first(params.when);
  const page = Number(first(params.page) ?? 1);

  // Mặc định hiện sự kiện sắp diễn ra: người đọc vào đây thường để xem còn
  // kịp về dự không, chứ không để tra lại lễ hội năm ngoái.
  const upcoming = when !== "all";

  const result = await getEvents({ upcoming, page, limit: DEFAULT_PAGE_SIZE });

  const buildHref = (nextPage: number) => {
    const next = new URLSearchParams();
    if (when) next.set("when", when);
    if (nextPage > 1) next.set("page", String(nextPage));
    const queryString = next.toString();
    return queryString ? `/su-kien?${queryString}` : "/su-kien";
  };

  return (
    <div className="bg-surface-alt pb-20">
      <div className="container-page pt-7">
        <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Sự kiện" }]} />
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
            basePath="/su-kien"
            groups={[
              {
                param: "when",
                label: "Thời gian",
                options: [
                  { label: "Sắp diễn ra", value: "upcoming" },
                  { label: "Tất cả, kể cả đã qua", value: "all" },
                ],
              },
            ]}
          />
        </Suspense>
      </div>

      <div className="container-page mt-7">
        <p className="text-[14.5px] text-muted" aria-live="polite">
          Có <strong className="text-ink">{formatNumber(result.total)}</strong> sự kiện
          {upcoming ? " sắp diễn ra" : ""}
        </p>
      </div>

      <div className="container-page mt-5">
        {result.items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((item) => (
              <EventCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              upcoming
                ? "Chưa có sự kiện nào sắp diễn ra"
                : "Chưa có sự kiện nào được đăng"
            }
            description={
              upcoming
                ? "Xem lại những lễ hội đã qua để biết thường niên có gì."
                : undefined
            }
            action={
              upcoming ? (
                <ButtonLink href="/su-kien?when=all" variant="ghost">
                  Xem cả sự kiện đã qua
                </ButtonLink>
              ) : undefined
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
