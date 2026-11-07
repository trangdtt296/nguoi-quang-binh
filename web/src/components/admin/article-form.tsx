"use client";

import { useState } from "react";
import { useWatch } from "react-hook-form";
import { z } from "zod";
import { Tabs } from "@/components/admin/ui";
import {
  AdminForm,
  FormColumns,
  FormImage,
  FormInput,
  FormPanel,
  FormRichText,
  FormSelect,
  FormTextarea,
  TitleSlugFields,
  toOptions,
} from "@/components/admin/form-fields";
import { FormHeader, PublishTab, SeoTab, useResourceForm } from "@/components/admin/form-parts";
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
import { COUNT_LIMITS, FIELD_LIMITS as F } from "@/lib/field-limits";
import {
  ARTICLE_TYPE_LABELS,
  ARTICLE_TYPE_TO_CATEGORY_TYPE,
  type AdminArticle,
  type ArticleType,
} from "@/lib/admin/types";

/** Bài học soạn trong khóa học, không chọn ở đây. */
const EDITABLE_TYPES = ["news", "culture", "guide"] as const satisfies readonly ArticleType[];

const TYPE_OPTIONS = EDITABLE_TYPES.map((value) => ({
  value,
  label: ARTICLE_TYPE_LABELS[value],
}));

/** Giới hạn theo lib/field-limits.ts. */
const LIMITS = {
  title: F.articleTitle,
  slug: F.slug,
  excerpt: F.summary,
  ...SEO_LIMITS,
} satisfies FieldLimits;

const TAG_LIMITS = { length: F.tag.max, count: COUNT_LIMITS.tags };

/** Ô từ khóa nhập dạng "a, b, c"; tách thành mảng khi gửi. */
const splitTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

function checkTags(value: string, ctx: z.RefinementCtx) {
  const tags = splitTags(value);
  if (tags.length > TAG_LIMITS.count) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Tối đa ${TAG_LIMITS.count} từ khóa` });
  }
  const tooLongTag = tags.find((tag) => tag.length > TAG_LIMITS.length);
  if (tooLongTag) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Mỗi từ khóa tối đa ${TAG_LIMITS.length} ký tự ("${tooLongTag.slice(0, 20)}…")`,
    });
  }
}

const schema = z
  .object({
    title: requiredText("Vui lòng nhập tiêu đề", LIMITS.title, "Tiêu đề quá ngắn"),
    slug: text(LIMITS.slug),
    excerpt: text(LIMITS.excerpt),
    contentHtml: z.string(),
    coverImageUrl: text(),
    type: z.enum(["news", "culture", "guide", "lesson"]),
    categoryId: z.string(),
    tags: z.string().superRefine(checkTags),
    isFeatured: z.boolean(),
    ...seoFields,
    ...publishFields,
  })
  .superRefine(refineSchedule);

type ArticleValues = z.infer<typeof schema>;

type Tab = "content" | "seo" | "publish";

const TABS = [
  ["content", "Nội dung"],
  ["seo", "SEO"],
  ["publish", "Xuất bản"],
] as const;

const TAB_FIELDS = {
  content: ["title", "slug", "excerpt", "tags"],
  seo: ["seoTitle", "seoDescription"],
  publish: ["publishedAt"],
} satisfies Record<Tab, (keyof ArticleValues)[]>;

const PUBLIC_PREFIX: Record<ArticleType, string> = {
  news: "/tin-tuc",
  culture: "/van-hoa",
  guide: "/cam-nang",
  lesson: "/tin-tuc",
};

function toFormValues(article?: AdminArticle): ArticleValues {
  return {
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    excerpt: article?.excerpt ?? "",
    contentHtml: article?.contentHtml ?? "",
    coverImageUrl: article?.coverImageUrl ?? "",
    type: article?.type ?? "news",
    categoryId: article?.categoryId ?? "",
    tags: article?.tags.join(", ") ?? "",
    isFeatured: article?.isFeatured ?? false,
    ...seoPublishDefaults(article),
  };
}

function toPayload(values: ArticleValues) {
  return {
    title: values.title,
    slug: values.slug || undefined,
    excerpt: orNull(values.excerpt),
    contentHtml: orNull(values.contentHtml),
    content: {},
    coverImageUrl: orNull(values.coverImageUrl),
    type: values.type,
    categoryId: orNull(values.categoryId),
    tags: splitTags(values.tags),
    isFeatured: values.isFeatured,
    ...seoPublishPayload(values),
  };
}

export function ArticleForm({ article }: { article?: AdminArticle }) {
  const [tab, setTab] = useState<Tab>("content");

  const { form, onSubmit, saving } = useResourceForm({
    endpoint: "/admin/articles",
    record: article,
    schema,
    defaultValues: toFormValues(article),
    toPayload,
    createdMessage: "Đã tạo bài viết",
  });

  // Danh mục và đường dẫn công khai đều phụ thuộc loại bài đang chọn.
  const type = useWatch({ control: form.control, name: "type" });
  const categories = useCategoryOptions(ARTICLE_TYPE_TO_CATEGORY_TYPE[type]);
  const publicPath = (slug: string) => `${PUBLIC_PREFIX[type]}/${slug}`;

  return (
    <AdminForm
      form={form}
      idPrefix="article"
      limits={LIMITS}
      onSubmit={onSubmit}
      onInvalid={(errors) => setTab(firstTabWithError(errors, TAB_FIELDS) ?? tab)}
      className="flex flex-col gap-6"
    >
      <FormHeader
        title={article ? "Sửa bài viết" : "Soạn bài mới"}
        backHref="/admin/articles"
        previewPath={article?.status === "published" ? publicPath : undefined}
        saving={saving}
        saveLabel={article ? "Lưu thay đổi" : "Tạo bài viết"}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "content" ? (
        <FormColumns
          main={
            <>
              <TitleSlugFields
                titleName="title"
                titleLabel="Tiêu đề"
                slugHint="Để trống thì hệ thống tự sinh từ tiêu đề. Đổi đường dẫn của bài đã xuất bản sẽ làm hỏng các liên kết cũ."
                autoSlug={!article}
              />
              <FormTextarea
                name="excerpt"
                label="Mô tả ngắn"
                hint={(length) => `Hiện trên card ở trang danh sách. ${length}/${LIMITS.excerpt.max} ký tự.`}
              />
              <FormRichText name="contentHtml" label="Nội dung" />
            </>
          }
          side={
            <>
              <FormImage name="coverImageUrl" />
              <FormPanel>
                <FormSelect
                  name="type"
                  label="Loại bài"
                  options={TYPE_OPTIONS}
                  registerOptions={{
                    // Danh mục cũ không còn hợp với loại bài mới.
                    onChange: () => form.setValue("categoryId", ""),
                  }}
                />
                <FormSelect
                  name="categoryId"
                  label="Chuyên mục"
                  placeholder="Chưa phân loại"
                  options={toOptions(categories, (category) => category.name)}
                />
                <FormInput
                  name="tags"
                  label="Từ khóa"
                  hint={`Cách nhau bằng dấu phẩy. Tối đa ${TAG_LIMITS.count} từ, mỗi từ tối đa ${TAG_LIMITS.length} ký tự.`}
                />
              </FormPanel>
            </>
          }
        />
      ) : null}

      {tab === "seo" ? (
        <SeoTab titleField="title" fallbackField="excerpt" publicPath={publicPath} />
      ) : null}

      {tab === "publish" ? (
        <PublishTab
          featured={{
            label: "Bài nổi bật",
            hint: "Được ưu tiên hiện ở trang chủ và đầu danh sách.",
          }}
        />
      ) : null}
    </AdminForm>
  );
}
