import Link from "next/link";
import type { Article } from "@/types/content";
import { Breadcrumb, Tag } from "@/components/ui";
import { ContentImage } from "@/components/shared/content-image";
import { Prose } from "@/components/shared/prose";
import { ShareButtons } from "@/components/shared/share-buttons";
import { getRelatedArticles } from "@/lib/queries";
import { formatDate, formatNumber } from "@/lib/format";
import { articleHref } from "@/lib/routes";

/** Khung chung cho trang chi tiết bài viết, dùng cho cả ba chuyên mục. */
export async function ArticleDetail({
  article,
  sectionLabel,
  sectionHref,
}: {
  article: Article;
  sectionLabel: string;
  sectionHref: string;
}) {
  const related = await getRelatedArticles(article, 3);

  return (
    <article className="pb-20">
      <ContentImage
        src={article.coverImageUrl}
        alt={`Ảnh bài viết ${article.title}`}
        ratio="16/9"
        className="max-h-[480px]"
        sizes="100vw"
        priority
      />

      <div className="container-page pt-7">
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/" },
            { label: sectionLabel, href: sectionHref },
            { label: article.title },
          ]}
        />
      </div>

      <div className="container-page mt-6 max-w-[760px]">
        {article.category ? <Tag>{article.category.name}</Tag> : null}

        <h1 className="mt-3.5 font-serif text-[32px] font-semibold leading-tight tracking-[-0.015em] md:text-[42px]">
          {article.title}
        </h1>

        <p className="mt-4 text-[13.5px] text-muted">
          {formatDate(article.publishedAt)} · {article.authorName} ·{" "}
          {formatNumber(article.viewCount)} lượt xem
        </p>

        {article.excerpt ? (
          <p className="mt-6 border-l-2 border-ink pl-5 text-[19px] leading-relaxed text-ink">
            {article.excerpt}
          </p>
        ) : null}

        <Prose html={article.contentHtml} className="mt-9" />

        {article.tags.length ? (
          <div className="mt-10 flex flex-wrap items-center gap-2">
            <span className="text-[14px] text-muted">Từ khóa:</span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line px-3 py-1 text-[13px] text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-10 border-t border-line pt-6">
          <ShareButtons path={articleHref(article)} title={article.title} />
        </div>
      </div>

      {related.length ? (
        <section className="container-page mt-16">
          <h2 className="mb-6 text-[22px] font-semibold">Bài viết liên quan</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.id}
                href={articleHref(item)}
                className="group block overflow-hidden rounded-[12px] border border-line transition-shadow hover:shadow-[0_10px_28px_rgba(13,17,20,0.1)]"
              >
                <ContentImage
                  src={item.coverImageUrl}
                  alt={`Ảnh bài viết ${item.title}`}
                  ratio="16/9"
                />
                <div className="p-5">
                  <h3 className="text-[17.5px] font-semibold leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                    {item.excerpt}
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
