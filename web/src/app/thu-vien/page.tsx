import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, EmptyState } from "@/components/ui";
import { ContentImage } from "@/components/shared/content-image";
import { getAlbums } from "@/lib/queries";
import { formatDate } from "@/lib/format";

const title = "Thư viện ảnh";
const description = "Quảng Bình qua ống kính — các album ảnh theo chủ đề và địa điểm.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/thu-vien" },
};

export default async function Page() {
  const albums = await getAlbums();

  return (
    <div className="bg-surface-alt pb-20">
      <div className="container-page pt-7">
        <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Thư viện" }]} />
      </div>

      <div className="container-page pt-6 pb-8">
        <h1 className="text-[32px] font-bold leading-tight tracking-[-0.01em] md:text-[40px]">
          {title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[17px] leading-relaxed text-muted">
          {description}
        </p>
      </div>

      <div className="container-page">
        {albums.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/thu-vien/${album.slug}`}
                className="group block overflow-hidden rounded-[12px] border border-line bg-surface transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_10px_28px_rgba(13,17,20,0.1)]"
              >
                <ContentImage
                  src={album.coverImageUrl ?? album.items[0]?.url}
                  alt={album.items[0]?.altText ?? `Ảnh bìa album ${album.title}`}
                  ratio="4/3"
                  className="transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="p-5">
                  <h2 className="text-[19px] font-semibold leading-snug">{album.title}</h2>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                    {album.description}
                  </p>
                  <p className="mt-3.5 border-t border-line pt-3 text-[13px] text-muted">
                    {album.items.length} ảnh · {formatDate(album.publishedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="Chưa có album nào được đăng" />
        )}
      </div>
    </div>
  );
}
