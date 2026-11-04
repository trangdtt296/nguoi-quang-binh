import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { Breadcrumb, Tag } from "@/components/ui";
import { Prose } from "@/components/shared/prose";
import { ShareButtons } from "@/components/shared/share-buttons";
import { getCourseBySlug, getLesson } from "@/lib/queries";

type Params = Promise<{ courseSlug: string; lessonSlug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const [course, found] = await Promise.all([
    getCourseBySlug(courseSlug),
    getLesson(courseSlug, lessonSlug),
  ]);
  if (!course || !found) return { title: "Không tìm thấy bài học" };

  return {
    title: `${found.lesson.title} — ${course.title}`,
    description: found.lesson.excerpt,
    alternates: { canonical: `/goc-hoc-tap/${courseSlug}/${lessonSlug}` },
    openGraph: {
      type: "article",
      title: found.lesson.title,
      description: found.lesson.excerpt,
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { courseSlug, lessonSlug } = await params;
  const [course, found] = await Promise.all([
    getCourseBySlug(courseSlug),
    getLesson(courseSlug, lessonSlug),
  ]);
  if (!course || !found) notFound();

  const { lesson, lessons, previous, next } = found;

  return (
    <div className="pb-20">
      <div className="container-page pt-6">
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Góc học tập", href: "/goc-hoc-tap" },
            { label: course.title, href: `/goc-hoc-tap/${course.slug}` },
            { label: `Bài ${lesson.lessonOrder}` },
          ]}
        />
      </div>

      <div className="container-page mt-6 flex flex-wrap items-start gap-10">
        <article className="min-w-0 flex-[999_1_560px]">
          <Tag>
            {course.category.name} · Bài {lesson.lessonOrder} / {lessons.length}
          </Tag>

          <h1 className="mt-3.5 font-serif text-[30px] font-semibold leading-tight tracking-[-0.015em] md:text-[40px]">
            {lesson.title}
          </h1>

          {lesson.durationMinutes ? (
            <p className="mt-4 text-[13.5px] text-muted">{lesson.durationMinutes} phút</p>
          ) : null}

          {lesson.videoUrl ? (
            <div className="mt-7 overflow-hidden rounded-[12px] bg-abyss">
              <iframe
                src={lesson.videoUrl}
                title={`Video bài học: ${lesson.title}`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full"
              />
            </div>
          ) : (
            <div className="mt-7 flex items-center gap-3 rounded-[12px] border border-dashed border-silver bg-surface-alt px-5 py-4">
              <PlayCircle size={20} className="shrink-0 text-muted" aria-hidden="true" />
              <p className="text-[14.5px] leading-relaxed text-muted">
                Bài này hiện chỉ có phần chữ. Video sẽ được thêm khi quản trị viên
                đăng lên.
              </p>
            </div>
          )}

          <Prose html={lesson.contentHtml} className="mt-9" />

          <nav
            aria-label="Điều hướng bài học"
            className="mt-12 flex flex-wrap justify-between gap-3 border-t border-line pt-6"
          >
            {previous ? (
              <Link
                href={`/goc-hoc-tap/${course.slug}/${previous.slug}`}
                className="inline-flex min-h-11 max-w-[48%] items-center gap-2 rounded-[8px] border border-line px-4 text-[14.5px] font-semibold transition-colors hover:border-ink"
              >
                <ChevronLeft size={16} aria-hidden="true" />
                <span className="truncate">Bài {previous.lessonOrder}: {previous.title}</span>
              </Link>
            ) : (
              <span />
            )}

            {next ? (
              <Link
                href={`/goc-hoc-tap/${course.slug}/${next.slug}`}
                className="inline-flex min-h-11 max-w-[48%] items-center gap-2 rounded-[8px] bg-ink px-4 text-[14.5px] font-semibold text-white transition-colors hover:bg-primary-500"
              >
                <span className="truncate">Bài {next.lessonOrder}: {next.title}</span>
                <ChevronRight size={16} aria-hidden="true" />
              </Link>
            ) : (
              <Link
                href={`/goc-hoc-tap/${course.slug}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-ink px-4 text-[14.5px] font-semibold text-white transition-colors hover:bg-primary-500"
              >
                Hết khóa — xem lại nội dung
              </Link>
            )}
          </nav>

          <div className="mt-8 border-t border-line pt-6">
            <ShareButtons
              path={`/goc-hoc-tap/${course.slug}/${lesson.slug}`}
              title={lesson.title}
            />
          </div>
        </article>

        <aside className="min-w-0 flex-1 basis-[320px] lg:sticky lg:top-24">
          <div className="rounded-[12px] border border-line bg-surface-alt p-5">
            <Link
              href={`/goc-hoc-tap/${course.slug}`}
              className="text-[16px] font-semibold leading-snug hover:underline"
            >
              {course.title}
            </Link>
            <p className="mt-1.5 text-[13.5px] text-muted">
              {lessons.length} bài · Miễn phí, không cần đăng ký
            </p>

            <ol className="mt-4 flex max-h-[520px] flex-col gap-1 overflow-y-auto">
              {lessons.map((item) => {
                const isCurrent = item.slug === lesson.slug;
                return (
                  <li key={item.id}>
                    <Link
                      href={`/goc-hoc-tap/${course.slug}/${item.slug}`}
                      aria-current={isCurrent ? "page" : undefined}
                      className={clsx(
                        "flex items-start gap-3 rounded-[9px] px-3.5 py-3 transition-colors",
                        isCurrent
                          ? "bg-ink text-white"
                          : "text-ink hover:bg-primary-50",
                      )}
                    >
                      <span className="text-[13px] font-bold opacity-75">
                        {item.lessonOrder}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14.5px] font-medium leading-snug">
                          {item.title}
                        </span>
                        {item.durationMinutes ? (
                          <span className="mt-1 block text-[12.5px] opacity-70">
                            {item.durationMinutes} phút
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
