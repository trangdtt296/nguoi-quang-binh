import Link from "next/link";
import { CalendarDays, MapPin, PlayCircle, Layers } from "lucide-react";
import type {
  Article,
  Destination,
  EventItem,
  Food,
  LearningCourse,
} from "@/types/content";
import { ContentImage } from "@/components/shared/content-image";
import { Tag } from "@/components/ui";
import { formatDate, formatEventRange } from "@/lib/format";
import { articleHref } from "@/lib/routes";

const cardClass =
  "group block overflow-hidden rounded-[12px] border border-line bg-surface transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_10px_28px_rgba(13,17,20,0.1)]";

export function DestinationCard({ item }: { item: Destination }) {
  return (
    <Link href={`/diem-den/${item.slug}`} className={cardClass}>
      <ContentImage
        src={item.coverImageUrl}
        alt={`Ảnh ${item.name}`}
        ratio="16/10"
        className="transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <div className="p-5">
        {item.category ? <Tag>{item.category.name}</Tag> : null}
        <h3 className="mt-3 text-[19px] font-semibold leading-snug text-ink">
          {item.name}
        </h3>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{item.summary}</p>
        <div className="mt-3.5 flex flex-wrap gap-4 border-t border-line pt-3 text-[13px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} aria-hidden="true" />
            {item.region}
          </span>
          {item.bestTime ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} aria-hidden="true" />
              {item.bestTime}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function ArticleCard({ item }: { item: Article }) {
  return (
    <Link href={articleHref(item)} className={cardClass}>
      <ContentImage
        src={item.coverImageUrl}
        alt={`Ảnh bài viết ${item.title}`}
        ratio="16/9"
        className="transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <div className="p-5">
        {item.category ? <Tag>{item.category.name}</Tag> : null}
        <h3 className="mt-3 text-[18px] font-semibold leading-snug text-ink">
          {item.title}
        </h3>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{item.excerpt}</p>
        <p className="mt-3.5 border-t border-line pt-3 text-[13px] text-muted">
          {formatDate(item.publishedAt)} · {item.authorName}
        </p>
      </div>
    </Link>
  );
}

/** Bản gọn cho danh sách tin phụ bên cạnh bài nổi bật. */
export function ArticleRow({ item }: { item: Article }) {
  return (
    <Link
      href={articleHref(item)}
      className="flex items-start gap-4 border-b border-line pb-4 last:border-b-0"
    >
      <ContentImage
        src={item.coverImageUrl}
        alt={`Ảnh bài viết ${item.title}`}
        ratio="3/2"
        className="w-[108px] shrink-0 rounded-lg"
      />
      <div className="min-w-0">
        <h4 className="text-[15.5px] font-semibold leading-snug text-ink">
          {item.title}
        </h4>
        <p className="mt-1.5 text-[12.5px] text-muted">
          {formatDate(item.publishedAt)}
          {item.category ? ` · ${item.category.name}` : ""}
        </p>
      </div>
    </Link>
  );
}

export function FoodCard({ item }: { item: Food }) {
  return (
    <Link href={`/am-thuc/${item.slug}`} className={cardClass}>
      <ContentImage
        src={item.coverImageUrl}
        alt={`Ảnh ${item.name}`}
        ratio="1/1"
        className="transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <div className="p-4">
        <h3 className="text-[16.5px] font-semibold text-ink">{item.name}</h3>
        {item.season ? (
          <p className="mt-1.5 text-[13.5px] text-muted">{item.season}</p>
        ) : null}
      </div>
    </Link>
  );
}

export function EventCard({ item }: { item: EventItem }) {
  const past = new Date(item.endAt ?? item.startAt).getTime() < Date.now();

  return (
    <Link href={`/su-kien/${item.slug}`} className={cardClass}>
      <ContentImage
        src={item.coverImageUrl}
        alt={`Ảnh sự kiện ${item.name}`}
        ratio="16/9"
        className="transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {item.isRecurring ? <Tag>Thường niên</Tag> : null}
          {past ? <Tag>Đã diễn ra</Tag> : null}
        </div>
        <h3 className="mt-3 text-[18px] font-semibold leading-snug text-ink">
          {item.name}
        </h3>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{item.summary}</p>
        <div className="mt-3.5 flex flex-col gap-2 border-t border-line pt-3 text-[13px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} className="shrink-0" aria-hidden="true" />
            {formatEventRange(item.startAt, item.endAt)}
          </span>
          {item.destination?.name || item.locationText ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="shrink-0" aria-hidden="true" />
              {item.destination?.name || item.locationText}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function CourseCard({ item }: { item: LearningCourse }) {
  return (
    <Link href={`/goc-hoc-tap/${item.slug}`} className={cardClass}>
      <ContentImage
        src={item.coverImageUrl}
        alt={`Ảnh bìa khóa học ${item.title}`}
        ratio="16/9"
        className="transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <div className="p-5">
        <Tag>{item.category.name}</Tag>
        <h3 className="mt-3 text-[18px] font-semibold leading-snug text-ink">
          {item.title}
        </h3>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
          {item.description}
        </p>
        <div className="mt-3.5 flex flex-wrap gap-4 border-t border-line pt-3 text-[13px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Layers size={14} aria-hidden="true" />
            {item.lessonCount} bài
          </span>
          <span className="inline-flex items-center gap-1.5">
            <PlayCircle size={14} aria-hidden="true" />
            {item.hasVideo ? "Có video" : "Bài viết"}
          </span>
        </div>
      </div>
    </Link>
  );
}
