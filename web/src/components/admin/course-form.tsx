"use client";

import { useState } from "react";
import { z } from "zod";
import { Tabs } from "@/components/admin/ui";
import {
  AdminForm,
  FormColumns,
  FormImage,
  FormPanel,
  FormSelect,
  FormTextarea,
  TitleSlugFields,
  toOptions,
} from "@/components/admin/form-fields";
import {
  FormHeader,
  PublishTab,
  SaveFirstNote,
  SeoTab,
  useResourceForm,
} from "@/components/admin/form-parts";
import { CourseLessons } from "@/components/admin/course-lessons";
import { useCategoryOptions } from "@/lib/admin/queries";
import {
  SEO_LIMITS,
  firstTabWithError,
  type FieldLimits,
  orNull,
  publishFields,
  refineSchedule,
  requiredText,
  seoFields,
  seoPublishDefaults,
  seoPublishPayload,
  text,
} from "@/lib/admin/form-utils";
import { FIELD_LIMITS as F } from "@/lib/field-limits";
import type { AdminCourse } from "@/lib/admin/types";

/** Giới hạn theo lib/field-limits.ts. */
const LIMITS = {
  title: F.courseTitle,
  slug: F.slug,
  description: F.courseDescription,
  ...SEO_LIMITS,
} satisfies FieldLimits;

const schema = z
  .object({
    title: requiredText("Vui lòng nhập tên khóa học", LIMITS.title, "Tên quá ngắn"),
    slug: text(LIMITS.slug),
    description: text(LIMITS.description),
    coverImageUrl: text(),
    categoryId: z.string(),
    isFeatured: z.boolean(),
    ...seoFields,
    ...publishFields,
  })
  .superRefine(refineSchedule);

type CourseValues = z.infer<typeof schema>;

type Tab = "info" | "lessons" | "seo" | "publish";

const TAB_FIELDS = {
  info: ["title", "slug", "description"],
  seo: ["seoTitle", "seoDescription"],
  publish: ["publishedAt"],
} satisfies Partial<Record<Tab, (keyof CourseValues)[]>>;

function toFormValues(course?: AdminCourse): CourseValues {
  return {
    title: course?.title ?? "",
    slug: course?.slug ?? "",
    description: course?.description ?? "",
    coverImageUrl: course?.coverImageUrl ?? "",
    categoryId: course?.categoryId ?? "",
    isFeatured: course?.isFeatured ?? false,
    ...seoPublishDefaults(course),
  };
}

function toPayload(values: CourseValues) {
  return {
    title: values.title,
    slug: values.slug || undefined,
    description: orNull(values.description),
    coverImageUrl: orNull(values.coverImageUrl),
    categoryId: orNull(values.categoryId),
    isFeatured: values.isFeatured,
    ...seoPublishPayload(values),
  };
}

const publicPath = (slug: string) => `/goc-hoc-tap/${slug}`;

export function CourseForm({ course }: { course?: AdminCourse }) {
  const [tab, setTab] = useState<Tab>("info");
  const categories = useCategoryOptions("learning");

  const { form, onSubmit, saving } = useResourceForm({
    endpoint: "/admin/courses",
    record: course,
    schema,
    defaultValues: toFormValues(course),
    toPayload,
    createdMessage: "Đã tạo khóa học, giờ thêm bài học vào",
  });

  const tabs = [
    ["info", "Thông tin"],
    ["lessons", course ? `Bài học (${course.lessonCount})` : "Bài học"],
    ["seo", "SEO"],
    ["publish", "Xuất bản"],
  ] as const;

  return (
    <AdminForm
      form={form}
      idPrefix="course"
      limits={LIMITS}
      onSubmit={onSubmit}
      onInvalid={(errors) => setTab(firstTabWithError(errors, TAB_FIELDS) ?? tab)}
      className="flex flex-col gap-6"
    >
      <FormHeader
        title={course ? "Sửa khóa học" : "Thêm khóa học"}
        backHref="/admin/courses"
        previewPath={course?.status === "published" ? publicPath : undefined}
        saving={saving}
        saveLabel={course ? "Lưu thay đổi" : "Tạo khóa học"}
      />

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === "info" ? (
        <FormColumns
          mainBasis="480px"
          main={
            <>
              <TitleSlugFields
                titleName="title"
                titleLabel="Tên khóa học"
                slugHint="Để trống thì hệ thống tự sinh từ tên khóa học."
                autoSlug={!course}
              />
              <FormTextarea
                name="description"
                label="Giới thiệu khóa học"
                rows={6}
                hint={(length) =>
                  `Học xong biết làm gì, phù hợp với ai. ${length}/${LIMITS.description.max} ký tự.`
                }
              />
            </>
          }
          side={
            <>
              <FormImage name="coverImageUrl" />
              <FormPanel>
                <FormSelect
                  name="categoryId"
                  label="Lĩnh vực"
                  placeholder="Chưa phân loại"
                  hint="Lập trình, tiếng Anh, tiếng Nhật… Người học vào một lĩnh vực là thấy toàn bộ khóa trong đó."
                  options={toOptions(categories, (category) => category.name)}
                />
              </FormPanel>
            </>
          }
        />
      ) : null}

      {/*
        Bài học có form và luồng lưu riêng, nên nằm ngoài form khóa học về
        mặt dữ liệu — chỉ hiển thị chung trong tab này.
      */}
      {tab === "lessons" ? (
        course ? (
          <CourseLessons courseId={course.id} />
        ) : (
          <SaveFirstNote>Lưu khóa học trước đã. Có khóa rồi mới thêm bài vào được.</SaveFirstNote>
        )
      ) : null}

      {tab === "seo" ? (
        <SeoTab titleField="title" fallbackField="description" publicPath={publicPath} />
      ) : null}

      {tab === "publish" ? (
        <PublishTab
          featured={{
            label: "Khóa học nổi bật",
            hint: "Được ưu tiên hiện ở khối Góc học tập trên trang chủ.",
          }}
        />
      ) : null}
    </AdminForm>
  );
}
