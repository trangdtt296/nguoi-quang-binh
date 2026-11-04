import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { Breadcrumb, Tag } from "@/components/ui";
import { ContentImage } from "@/components/shared/content-image";
import { ShareButtons } from "@/components/shared/share-buttons";
import { getDestinationBySlug, getFeaturedDestinations } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getDestinationBySlug(slug);
  if (!item) return { title: "Không tìm thấy điểm đến" };

  return {
    title: item.seoTitle ?? item.name,
    description: item.seoDescription ?? item.summary,
    alternates: { canonical: `/diem-den/${item.slug}` },
    openGraph: {
      type: "article",
      title: item.seoTitle ?? item.name,
      description: item.seoDescription ?? item.summary,
      images: item.ogImageUrl ?? item.coverImageUrl ?? undefined,
    },
  };
}

export default async function DestinationDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const item = await getDestinationBySlug(slug);
  if (!item) notFound();

  const related = (await getFeaturedDestinations(4)).filter((d) => d.id !== item.id);

  return (
    <article className="pb-20">
      <ContentImage
        src={item.coverImageUrl}
        alt={`Ảnh ${item.name}`}
        ratio="16/9"
        className="max-h-[520px]"
        sizes="100vw"
        priority
      />

      <div className="container-page pt-7">
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Điểm đến", href: "/diem-den" },
            { label: item.name },
          ]}
        />
      </div>

      <div className="container-page mt-6 flex flex-wrap gap-12">
        <div className="min-w-0 flex-[999_1_560px]">
          {item.category ? <Tag>{item.category.name}</Tag> : null}
          <h1 className="mt-3.5 font-serif text-[34px] font-semibold leading-tight tracking-[-0.015em] md:text-[44px]">
            {item.name}
          </h1>
          <p className="mt-4 text-[18px] leading-relaxed text-muted">{item.summary}</p>

          <div
            className="prose-body mt-9 [&_h2]:mt-9 [&_h2]:mb-3.5 [&_h2]:text-[24px] [&_h2]:font-semibold [&_p]:mb-5 [&_p]:text-[17px] [&_p]:leading-[1.75] [&_p]:text-[#2a3036]"
            dangerouslySetInnerHTML={{ __html: item.contentHtml }}
          />

          {item.gallery.length ? (
            <section className="mt-12">
              <h2 className="mb-5 text-[22px] font-semibold">Album ảnh</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {item.gallery.map((media) => (
                  <ContentImage
                    key={media.id}
                    src={media.url}
                    alt={media.altText}
                    ratio="4/3"
                    className="rounded-[12px]"
                  />
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-12 border-t border-line pt-6">
            <ShareButtons
              path={`/diem-den/${item.slug}`}
              title={item.name}
            />
          </div>
        </div>

        <aside className="min-w-0 flex-1 basis-[320px]">
          <div className="rounded-[12px] border border-line bg-surface-alt p-6">
            <h2 className="text-[16px] font-semibold">Thông tin nhanh</h2>
            <dl className="mt-4 flex flex-col gap-3.5 text-[14.5px]">
              <div>
                <dt className="flex items-center gap-1.5 text-muted">
                  <MapPin size={14} aria-hidden="true" /> Khu vực
                </dt>
                <dd className="mt-0.5 font-medium">{item.region}</dd>
              </div>
              {item.bestTime ? (
                <div>
                  <dt className="flex items-center gap-1.5 text-muted">
                    <CalendarDays size={14} aria-hidden="true" /> Thời điểm đẹp nhất
                  </dt>
                  <dd className="mt-0.5 font-medium">{item.bestTime}</dd>
                </div>
              ) : null}
              {item.address ? (
                <div>
                  <dt className="text-muted">Địa chỉ</dt>
                  <dd className="mt-0.5 font-medium">{item.address}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted">Lượt xem</dt>
                <dd className="mt-0.5 font-medium">{formatNumber(item.viewCount)}</dd>
              </div>
            </dl>

            {item.visitInfo?.length ? (
              <>
                <h2 className="mt-7 text-[16px] font-semibold">Hướng dẫn tham quan</h2>
                <dl className="mt-4 flex flex-col gap-3.5 text-[14.5px]">
                  {item.visitInfo.map((row) => (
                    <div key={row.label}>
                      <dt className="text-muted">{row.label}</dt>
                      <dd className="mt-0.5 font-medium">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : null}

            {item.latitude && item.longitude ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex min-h-11 w-full items-center justify-center rounded-[8px] border border-line bg-surface px-4 text-[14.5px] font-semibold transition-colors hover:border-ink"
              >
                Mở vị trí trên bản đồ
              </a>
            ) : null}
          </div>
        </aside>
      </div>

      {related.length ? (
        <section className="container-page mt-16">
          <h2 className="mb-6 text-[22px] font-semibold">Điểm đến khác</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.slice(0, 3).map((other) => (
              <Link
                key={other.id}
                href={`/diem-den/${other.slug}`}
                className="group block overflow-hidden rounded-[12px] border border-line transition-shadow hover:shadow-[0_10px_28px_rgba(13,17,20,0.1)]"
              >
                <ContentImage
                  src={other.coverImageUrl}
                  alt={`Ảnh ${other.name}`}
                  ratio="16/10"
                />
                <div className="p-5">
                  <h3 className="text-[18px] font-semibold">{other.name}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                    {other.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
