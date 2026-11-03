import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, Tag } from "@/components/ui";
import { ContentImage } from "@/components/shared/content-image";
import { Prose } from "@/components/shared/prose";
import { ShareButtons } from "@/components/shared/share-buttons";
import { getAllFoodSlugs, getFoodBySlug, getFeaturedFoods } from "@/lib/queries";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getAllFoodSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const food = await getFoodBySlug(slug);
  if (!food) return { title: "Không tìm thấy món ăn" };

  return {
    title: food.seoTitle ?? food.name,
    description: food.seoDescription ?? food.summary,
    alternates: { canonical: `/am-thuc/${food.slug}` },
    openGraph: {
      type: "article",
      title: food.seoTitle ?? food.name,
      description: food.seoDescription ?? food.summary,
      images: food.ogImageUrl ?? food.coverImageUrl ?? undefined,
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const food = await getFoodBySlug(slug);
  if (!food) notFound();

  const others = (await getFeaturedFoods(5)).filter((f) => f.id !== food.id).slice(0, 4);

  return (
    <article className="pb-20">
      <ContentImage
        src={food.coverImageUrl}
        alt={`Ảnh món ${food.name}`}
        ratio="16/9"
        className="max-h-[460px]"
        sizes="100vw"
        priority
      />

      <div className="container-page pt-7">
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Ẩm thực", href: "/am-thuc" },
            { label: food.name },
          ]}
        />
      </div>

      <div className="container-page mt-6 flex flex-wrap gap-12">
        <div className="min-w-0 flex-[999_1_560px]">
          {food.category ? <Tag>{food.category.name}</Tag> : null}
          <h1 className="mt-3.5 font-serif text-[32px] font-semibold leading-tight tracking-[-0.015em] md:text-[42px]">
            {food.name}
          </h1>
          <p className="mt-4 text-[18px] leading-relaxed text-muted">{food.summary}</p>

          <Prose html={food.contentHtml} className="mt-9" />

          <div className="mt-10 border-t border-line pt-6">
            <ShareButtons path={`/am-thuc/${food.slug}`} title={food.name} />
          </div>
        </div>

        <aside className="min-w-0 flex-1 basis-[300px]">
          <div className="rounded-[12px] border border-line bg-surface-alt p-6">
            <h2 className="text-[16px] font-semibold">Thông tin nhanh</h2>
            <dl className="mt-4 flex flex-col gap-3.5 text-[14.5px]">
              {food.season ? (
                <div>
                  <dt className="text-muted">Mùa</dt>
                  <dd className="mt-0.5 font-medium">{food.season}</dd>
                </div>
              ) : null}
              {food.category ? (
                <div>
                  <dt className="text-muted">Phân loại</dt>
                  <dd className="mt-0.5 font-medium">{food.category.name}</dd>
                </div>
              ) : null}
            </dl>

            {food.originStory ? (
              <>
                <h2 className="mt-7 text-[16px] font-semibold">Câu chuyện món ăn</h2>
                <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
                  {food.originStory}
                </p>
              </>
            ) : null}
          </div>
        </aside>
      </div>

      {others.length ? (
        <section className="container-page mt-16">
          <h2 className="mb-6 text-[22px] font-semibold">Món khác</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((item) => (
              <Link
                key={item.id}
                href={`/am-thuc/${item.slug}`}
                className="group block overflow-hidden rounded-[12px] border border-line transition-shadow hover:shadow-[0_10px_28px_rgba(13,17,20,0.1)]"
              >
                <ContentImage
                  src={item.coverImageUrl}
                  alt={`Ảnh món ${item.name}`}
                  ratio="1/1"
                />
                <div className="p-4">
                  <h3 className="text-[16.5px] font-semibold">{item.name}</h3>
                  {item.season ? (
                    <p className="mt-1.5 text-[13.5px] text-muted">{item.season}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
