import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Layers, PlayCircle, Clock } from "lucide-react";
import { Breadcrumb, ButtonLink, EmptyState, Tag } from "@/components/ui";
import { ContentImage } from "@/components/shared/content-image";
import { getCourseWithLessons } from "@/lib/queries";

type Params = Promise<{ courseSlug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { courseSlug } = await params;
  const found = await getCourseWithLessons(courseSlug);
  if (!found) return { title: "Không tìm thấy khóa học" };

  const { course } = found;
  return {
    title: course.seoTitle ?? course.title,
    description: course.seoDescription ?? course.description,
    alternates: { canonical: `/goc-hoc-tap/${course.slug}` },
    openGraph: {
      type: "article",
      title: course.seoTitle ?? course.title,
      description: course.seoDescription ?? course.description,
      images: course.ogImageUrl ?? course.coverImageUrl ?? undefined,
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { courseSlug } = await params;
  const found = await getCourseWithLessons(courseSlug);
  if (!found) notFound();

  const { course, lessons } = found;
  const totalMinutes = lessons.reduce((sum, l) => sum + (l.durationMinutes ?? 0), 0);

  return (
    <div className="pb-20">
      <div className="container-page pt-7">
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Góc học tập", href: "/goc-hoc-tap" },
            { label: course.title },
          ]}
        />
      </div>

      <div className="container-page mt-6 flex flex-wrap gap-12">
        <div className="min-w-0 flex-[999_1_560px]">
          <Tag>{course.category.name}</Tag>
          <h1 className="mt-3.5 font-serif text-[32px] font-semibold leading-tight tracking-[-0.015em] md:text-[42px]">
            {course.title}
          </h1>
          <p className="mt-4 text-[18px] leading-relaxed text-muted">
            {course.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-5 border-y border-line py-4 text-[14.5px] text-muted">
            <span className="inline-flex items-center gap-2">
              <Layers size={16} aria-hidden="true" />
              {course.lessonCount} bài
            </span>
            {totalMinutes > 0 ? (
              <span className="inline-flex items-center gap-2">
                <Clock size={16} aria-hidden="true" />
                Khoảng {totalMinutes} phút
              </span>
            ) : null}
            <span className="inline-flex items-center gap-2">
              <PlayCircle size={16} aria-hidden="true" />
              {course.hasVideo ? "Có video" : "Bài viết"}
            </span>
            <span>Miễn phí, không cần đăng ký</span>
          </div>

          <h2 className="mt-10 text-[22px] font-semibold">Nội dung khóa học</h2>

          {lessons.length ? (
            <ol className="mt-5 flex flex-col gap-2">
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={`/goc-hoc-tap/${course.slug}/${lesson.slug}`}
                    className="flex items-start gap-4 rounded-[10px] border border-line bg-surface p-4 transition-colors hover:border-ink"
                  >
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[13px] font-bold text-ink">
                      {lesson.lessonOrder}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[16.5px] font-semibold leading-snug">
                        {lesson.title}
                      </span>
                      <span className="mt-1 block text-[14px] leading-relaxed text-muted">
                        {lesson.excerpt}
                      </span>
                      {lesson.durationMinutes ? (
                        <span className="mt-1.5 block text-[12.5px] text-muted">
                          {lesson.durationMinutes} phút
                          {lesson.videoUrl ? " · Có video" : ""}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              title="Khóa này chưa có bài nào"
              description="Bài học đang được soạn, bạn quay lại sau nhé."
            />
          )}

          {lessons.length ? (
            <ButtonLink
              href={`/goc-hoc-tap/${course.slug}/${lessons[0].slug}`}
              className="mt-8"
            >
              Bắt đầu học từ bài 1
            </ButtonLink>
          ) : null}
        </div>

        <aside className="min-w-0 flex-1 basis-[300px]">
          <ContentImage
            src={course.coverImageUrl}
            alt={`Ảnh bìa khóa học ${course.title}`}
            ratio="4/3"
            className="rounded-[12px]"
            sizes="(max-width: 768px) 100vw, 360px"
          />
          <div className="mt-5 rounded-[12px] border border-line bg-surface-alt p-5">
            <h2 className="text-[15px] font-semibold">Học thế nào</h2>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">
              Các bài xếp theo thứ tự, nên học từ bài 1. Không cần tài khoản, không
              theo dõi tiến độ — bạn tự đánh dấu mình đang học tới đâu.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
