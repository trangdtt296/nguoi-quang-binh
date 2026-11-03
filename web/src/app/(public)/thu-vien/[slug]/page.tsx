import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui";
import { GalleryGrid } from "@/components/shared/gallery-grid";
import { ShareButtons } from "@/components/shared/share-buttons";
import { getAlbumBySlug, getAllAlbumSlugs } from "@/lib/queries";
import { formatDate } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getAllAlbumSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) return { title: "Không tìm thấy album" };

  return {
    title: album.seoTitle ?? album.title,
    description: album.seoDescription ?? album.description,
    alternates: { canonical: `/thu-vien/${album.slug}` },
    openGraph: {
      type: "article",
      title: album.seoTitle ?? album.title,
      description: album.seoDescription ?? album.description,
      images: album.ogImageUrl ?? album.coverImageUrl ?? undefined,
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  return (
    <div className="pb-20">
      <div className="container-page pt-7">
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Thư viện", href: "/thu-vien" },
            { label: album.title },
          ]}
        />
      </div>

      <div className="container-page mt-6 max-w-[760px]">
        <h1 className="font-serif text-[32px] font-semibold leading-tight tracking-[-0.015em] md:text-[42px]">
          {album.title}
        </h1>
        <p className="mt-4 text-[18px] leading-relaxed text-muted">{album.description}</p>
        <p className="mt-3 text-[13.5px] text-muted">
          {album.items.length} ảnh · {formatDate(album.publishedAt)}
        </p>
      </div>

      <div className="container-page mt-10">
        <GalleryGrid items={album.items} />
      </div>

      <div className="container-page mt-12 border-t border-line pt-6">
        <ShareButtons path={`/thu-vien/${album.slug}`} title={album.title} />
      </div>
    </div>
  );
}
