import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Repeat } from "lucide-react";
import { Breadcrumb, Tag } from "@/components/ui";
import { ContentImage } from "@/components/shared/content-image";
import { ShareButtons } from "@/components/shared/share-buttons";
import { EventCard } from "@/components/content/cards";
import { getEventBySlug, getUpcomingEvents } from "@/lib/queries";
import { formatEventRange } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getEventBySlug(slug);
  if (!item) return { title: "Không tìm thấy sự kiện" };

  return {
    title: item.seoTitle ?? item.name,
    description: item.seoDescription ?? item.summary,
    alternates: { canonical: `/su-kien/${item.slug}` },
    openGraph: {
      type: "article",
      title: item.seoTitle ?? item.name,
      description: item.seoDescription ?? item.summary,
      images: item.ogImageUrl ?? item.coverImageUrl ?? undefined,
    },
  };
}

export default async function EventDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const item = await getEventBySlug(slug);
  if (!item) notFound();

  const past = new Date(item.endAt ?? item.startAt).getTime() < Date.now();
  const others = (await getUpcomingEvents(4)).filter((other) => other.id !== item.id);

  return (
    <article className="pb-20">
      <ContentImage
        src={item.coverImageUrl}
        alt={`Ảnh sự kiện ${item.name}`}
        height="h-[260px] sm:h-[380px] lg:h-[500px]"
        sizes="100vw"
        priority
      />

      <div className="container-page pt-7">
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Sự kiện", href: "/su-kien" },
            { label: item.name },
          ]}
        />
      </div>

      <div className="container-page mt-6 flex flex-wrap gap-12">
        <div className="min-w-0 flex-[999_1_560px]">
          <div className="flex flex-wrap gap-2">
            {item.isRecurring ? <Tag>Thường niên</Tag> : null}
            {past ? <Tag>Đã diễn ra</Tag> : null}
          </div>

          <h1 className="mt-3.5 font-serif text-[34px] font-semibold leading-tight tracking-[-0.015em] md:text-[44px]">
            {item.name}
          </h1>
          <p className="mt-4 text-[18px] leading-relaxed text-muted">{item.summary}</p>

          {past && item.isRecurring ? (
            <p className="mt-6 rounded-[8px] border border-line bg-surface-alt px-4 py-3 text-[14.5px] leading-relaxed">
              Lần này đã qua, nhưng đây là lễ hội thường niên — năm sau vẫn có. Thời
              gian cụ thể sẽ được cập nhật khi địa phương công bố.
            </p>
          ) : null}

          <div
            className="prose-body mt-9 [&_h2]:mt-9 [&_h2]:mb-3.5 [&_h2]:text-[24px] [&_h2]:font-semibold [&_p]:mb-5 [&_p]:text-[17px] [&_p]:leading-[1.75] [&_p]:text-[#2a3036]"
            dangerouslySetInnerHTML={{ __html: item.contentHtml }}
          />

          <div className="mt-12 border-t border-line pt-6">
            <ShareButtons path={`/su-kien/${item.slug}`} title={item.name} />
          </div>
        </div>

        <aside className="min-w-0 flex-1 basis-[320px]">
          <div className="rounded-[12px] border border-line bg-surface-alt p-6">
            <h2 className="text-[16px] font-semibold">Thông tin nhanh</h2>
            <dl className="mt-4 flex flex-col gap-3.5 text-[14.5px]">
              <div>
                <dt className="flex items-center gap-1.5 text-muted">
                  <CalendarDays size={14} aria-hidden="true" /> Thời gian
                </dt>
                <dd className="mt-0.5 font-medium">
                  {formatEventRange(item.startAt, item.endAt)}
                </dd>
              </div>

              {item.destination || item.locationText ? (
                <div>
                  <dt className="flex items-center gap-1.5 text-muted">
                    <MapPin size={14} aria-hidden="true" /> Địa điểm
                  </dt>
                  <dd className="mt-0.5 font-medium">
                    {item.destination ? (
                      <Link
                        href={`/diem-den/${item.destination.slug}`}
                        className="underline decoration-silver underline-offset-[3px] hover:decoration-ink"
                      >
                        {item.destination.name}
                      </Link>
                    ) : (
                      item.locationText
                    )}
                  </dd>
                </div>
              ) : null}

              {item.isRecurring ? (
                <div>
                  <dt className="flex items-center gap-1.5 text-muted">
                    <Repeat size={14} aria-hidden="true" /> Chu kỳ
                  </dt>
                  <dd className="mt-0.5 font-medium">Lặp lại hằng năm</dd>
                </div>
              ) : null}
            </dl>

            {item.destination ? (
              <Link
                href={`/diem-den/${item.destination.slug}`}
                className="mt-7 inline-flex min-h-11 w-full items-center justify-center rounded-[8px] border border-line bg-surface px-4 text-center text-[14.5px] font-semibold transition-colors hover:border-ink"
              >
                Xem điểm đến
              </Link>
            ) : null}
          </div>

          <p className="mt-4 px-1 text-[13px] leading-relaxed text-muted">
            Trang này chỉ giới thiệu, không nhận đặt chỗ hay bán vé. Thông tin có thể
            thay đổi, nên hỏi lại ban tổ chức trước khi đi xa.
          </p>
        </aside>
      </div>

      {others.length ? (
        <section className="container-page mt-16">
          <h2 className="mb-6 text-[22px] font-semibold">Sự kiện sắp tới</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.slice(0, 3).map((other) => (
              <EventCard key={other.id} item={other} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
