import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { Breadcrumb, ButtonLink, EmptyState } from "@/components/ui";
import { ContentImage } from "@/components/shared/content-image";
import { search } from "@/lib/queries";
import { articleHref } from "@/lib/routes";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Tìm kiếm",
  description: "Tìm bài viết, điểm đến, món ăn và khóa học trên toàn trang.",
  alternates: { canonical: "/tim-kiem" },
  // Trang kết quả không nên vào chỉ mục tìm kiếm: nội dung thay đổi theo
  // từ khóa và sẽ trùng lặp với các trang gốc.
  robots: { index: false, follow: true },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.q;
  const keyword = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";

  const result = keyword.length >= 2 ? await search(keyword) : null;

  return (
    <div className="bg-surface-alt pb-20">
      <div className="container-page pt-7">
        <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Tìm kiếm" }]} />
      </div>

      <div className="container-page pt-6">
        <h1 className="text-[32px] font-bold leading-tight tracking-[-0.01em] md:text-[40px]">
          Tìm kiếm
        </h1>

        <form action="/tim-kiem" role="search" className="mt-6 max-w-[560px]">
          <label htmlFor="search-query" className="sr-only">
            Từ khóa tìm kiếm
          </label>
          <div className="flex min-h-13 items-center gap-3 rounded-[10px] border border-line bg-surface px-4 focus-within:border-ink">
            <Search size={18} className="shrink-0 text-muted" aria-hidden="true" />
            <input
              id="search-query"
              name="q"
              type="search"
              defaultValue={keyword}
              placeholder="Nhập từ khóa, ví dụ: Sơn Đoòng, cháo hàu"
              className="min-h-12 w-full bg-transparent text-[15px] outline-none"
            />
          </div>
        </form>
      </div>

      <div className="container-page mt-10">
        {!keyword ? (
          <EmptyState
            title="Nhập từ khóa để bắt đầu"
            description="Bạn có thể tìm tên điểm đến, món ăn, tiêu đề bài viết hoặc tên khóa học. Không cần gõ dấu."
          />
        ) : keyword.length < 2 ? (
          <EmptyState
            title="Từ khóa quá ngắn"
            description="Vui lòng nhập ít nhất 2 ký tự."
          />
        ) : result && result.total === 0 ? (
          <EmptyState
            title={`Không tìm thấy kết quả nào cho "${keyword}"`}
            description="Thử từ khóa ngắn hơn, hoặc duyệt theo chuyên mục."
            action={<ButtonLink href="/diem-den">Xem tất cả điểm đến</ButtonLink>}
          />
        ) : result ? (
          <>
            <p className="mb-8 text-[14.5px] text-muted" aria-live="polite">
              Tìm thấy <strong className="text-ink">{formatNumber(result.total)}</strong>{" "}
              kết quả cho &ldquo;{keyword}&rdquo;
            </p>

            <div className="flex flex-col gap-12">
              <ResultGroup
                heading="Điểm đến"
                viewAllHref="/diem-den"
                items={result.destinations.map((item) => ({
                  id: item.id,
                  title: item.name,
                  excerpt: item.summary,
                  href: `/diem-den/${item.slug}`,
                  imageUrl: item.coverImageUrl,
                }))}
              />

              <ResultGroup
                heading="Bài viết"
                viewAllHref="/tin-tuc"
                items={result.articles.map((item) => ({
                  id: item.id,
                  title: item.title,
                  excerpt: item.excerpt,
                  href: articleHref(item),
                  imageUrl: item.coverImageUrl,
                }))}
              />

              <ResultGroup
                heading="Ẩm thực"
                viewAllHref="/am-thuc"
                items={result.foods.map((item) => ({
                  id: item.id,
                  title: item.name,
                  excerpt: item.summary,
                  href: `/am-thuc/${item.slug}`,
                  imageUrl: item.coverImageUrl,
                }))}
              />

              <ResultGroup
                heading="Khóa học"
                viewAllHref="/goc-hoc-tap"
                items={result.courses.map((item) => ({
                  id: item.id,
                  title: item.title,
                  excerpt: item.description,
                  href: `/goc-hoc-tap/${item.slug}`,
                  imageUrl: item.coverImageUrl,
                }))}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

interface ResultItem {
  id: string;
  title: string;
  excerpt: string;
  href: string;
  imageUrl?: string;
}

function ResultGroup({
  heading,
  items,
  viewAllHref,
}: {
  heading: string;
  items: ResultItem[];
  viewAllHref: string;
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="text-[20px] font-semibold">
          {heading}{" "}
          <span className="text-[15px] font-normal text-muted">({items.length})</span>
        </h2>
        <Link
          href={viewAllHref}
          className="text-[14px] font-semibold underline underline-offset-4"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-start gap-5 rounded-[12px] border border-line bg-surface p-4 transition-colors hover:border-ink"
          >
            <ContentImage
              src={item.imageUrl}
              alt={`Ảnh ${item.title}`}
              ratio="3/2"
              className="w-[120px] shrink-0 rounded-lg"
              sizes="120px"
            />
            <span className="min-w-0">
              <span className="block text-[17px] font-semibold leading-snug">
                {item.title}
              </span>
              <span className="mt-1.5 block text-[14.5px] leading-relaxed text-muted">
                {item.excerpt}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
