import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb, ButtonLink, EmptyState, Skeleton } from "@/components/ui";
import { CourseCard } from "@/components/content/cards";
import { FilterBar } from "@/components/content/filter-bar";
import { getCategories, getCourses } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

const title = "Góc học tập";
const description =
  "Ngoại ngữ, lập trình, và nhiều thứ khác. Mỗi khóa chia thành từng bài, học đến đâu biết đến đó. Tất cả miễn phí, không cần đăng ký tài khoản.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/goc-hoc-tap" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.category;
  const category = Array.isArray(raw) ? raw[0] : raw;

  const [courses, categories] = await Promise.all([
    getCourses(category),
    getCategories("learning"),
  ]);

  return (
    <div className="bg-surface-alt pb-20">
      <section className="bg-abyss text-white">
        <div className="container-page py-14 md:py-16">
          <Breadcrumb
            items={[{ label: "Trang chủ", href: "/" }, { label: "Góc học tập" }]}
          />
          <h1 className="mt-5 font-serif text-[34px] font-semibold leading-tight md:text-[44px]">
            {title}
          </h1>
          <p className="mt-4 max-w-[60ch] text-[17.5px] leading-relaxed text-silver">
            {description}
          </p>
        </div>
      </section>

      <div className="container-page pt-8">
        <Suspense fallback={<Skeleton className="h-24" />}>
          <FilterBar
            basePath="/goc-hoc-tap"
            groups={[
              {
                param: "category",
                label: "Lĩnh vực",
                options: categories.map((c) => ({
                  label: c.name,
                  value: c.slug,
                })),
              },
            ]}
          />
        </Suspense>
      </div>

      <div className="container-page mt-7">
        <p className="text-[14.5px] text-muted" aria-live="polite">
          Có <strong className="text-ink">{formatNumber(courses.length)}</strong> khóa học
        </p>
      </div>

      <div className="container-page mt-5">
        {courses.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} item={course} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Chưa có khóa học nào trong lĩnh vực này"
            description="Các khóa mới được thêm dần. Bạn xem thử lĩnh vực khác nhé."
            action={
              <ButtonLink href="/goc-hoc-tap" variant="ghost">
                Xem tất cả khóa học
              </ButtonLink>
            }
          />
        )}
      </div>
    </div>
  );
}
