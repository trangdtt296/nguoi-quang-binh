"use client";

import { useState } from "react";
import { z } from "zod";
import { Tabs } from "@/components/admin/ui";
import {
  AdminForm,
  FormColumns,
  FormImage,
  FormInput,
  FormPanel,
  FormRichText,
  FormRows,
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
  orNull,
  type FieldLimits,
  publishFields,
  refineSchedule,
  requiredText,
  seoFields,
  seoPublishDefaults,
  seoPublishPayload,
  text,
} from "@/lib/admin/form-utils";
import { COUNT_LIMITS, FIELD_LIMITS as F } from "@/lib/field-limits";
import type { AdminFood } from "@/lib/admin/types";

/** Giới hạn theo lib/field-limits.ts. */
const LIMITS = {
  name: F.placeName,
  slug: F.slug,
  summary: F.summary,
  season: F.season,
  originStory: F.originStory,
  ...SEO_LIMITS,
} satisfies FieldLimits;

const PLACE_LIMITS = {
  name: F.placeRowName.max,
  address: F.placeRowAddress.max,
  rows: COUNT_LIMITS.placeRows,
};

const schema = z
  .object({
    name: requiredText("Vui lòng nhập tên món", LIMITS.name, "Tên quá ngắn"),
    slug: text(LIMITS.slug),
    summary: text(LIMITS.summary),
    contentHtml: z.string(),
    coverImageUrl: text(),
    categoryId: z.string(),
    season: text(LIMITS.season),
    originStory: text(LIMITS.originStory),
    whereToEat: z
      .array(
        z.object({
          name: text({ max: PLACE_LIMITS.name }),
          address: text({ max: PLACE_LIMITS.address }),
        }),
      )
      .max(PLACE_LIMITS.rows, `Tối đa ${PLACE_LIMITS.rows} quán`),
    isFeatured: z.boolean(),
    ...seoFields,
    ...publishFields,
  })
  .superRefine(refineSchedule);

type FoodValues = z.infer<typeof schema>;

type Tab = "content" | "detail" | "seo" | "publish";

const TABS = [
  ["content", "Nội dung"],
  ["detail", "Nguồn gốc & nơi ăn"],
  ["seo", "SEO"],
  ["publish", "Xuất bản"],
] as const;

const TAB_FIELDS = {
  content: ["name", "slug", "summary", "season"],
  detail: ["originStory", "whereToEat"],
  seo: ["seoTitle", "seoDescription"],
  publish: ["publishedAt"],
} satisfies Record<Tab, (keyof FoodValues)[]>;

function toFormValues(food?: AdminFood): FoodValues {
  return {
    name: food?.name ?? "",
    slug: food?.slug ?? "",
    summary: food?.summary ?? "",
    contentHtml: food?.contentHtml ?? "",
    coverImageUrl: food?.coverImageUrl ?? "",
    categoryId: food?.categoryId ?? "",
    season: food?.season ?? "",
    originStory: food?.originStory ?? "",
    whereToEat: food?.whereToEat ?? [],
    isFeatured: food?.isFeatured ?? false,
    ...seoPublishDefaults(food),
  };
}

function toPayload(values: FoodValues) {
  return {
    name: values.name,
    slug: values.slug || undefined,
    summary: orNull(values.summary),
    contentHtml: orNull(values.contentHtml),
    content: {},
    coverImageUrl: orNull(values.coverImageUrl),
    categoryId: orNull(values.categoryId),
    season: orNull(values.season),
    originStory: orNull(values.originStory),
    whereToEat: values.whereToEat.filter((row) => row.name && row.address),
    isFeatured: values.isFeatured,
    ...seoPublishPayload(values),
  };
}

const publicPath = (slug: string) => `/am-thuc/${slug}`;

export function FoodForm({ food }: { food?: AdminFood }) {
  const [tab, setTab] = useState<Tab>("content");
  const categories = useCategoryOptions("food");

  const { form, onSubmit, saving } = useResourceForm({
    endpoint: "/admin/foods",
    record: food,
    schema,
    defaultValues: toFormValues(food),
    toPayload,
    createdMessage: "Đã tạo món ăn",
  });

  return (
    <AdminForm
      form={form}
      idPrefix="food"
      limits={LIMITS}
      onSubmit={onSubmit}
      onInvalid={(errors) => setTab(firstTabWithError(errors, TAB_FIELDS) ?? tab)}
      className="flex flex-col gap-6"
    >
      <FormHeader
        title={food ? "Sửa món ăn" : "Thêm món ăn"}
        backHref="/admin/foods"
        previewPath={food?.status === "published" ? publicPath : undefined}
        saving={saving}
        saveLabel={food ? "Lưu thay đổi" : "Tạo món ăn"}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "content" ? (
        <FormColumns
          main={
            <>
              <TitleSlugFields
                titleName="name"
                titleLabel="Tên món"
                slugHint="Để trống thì hệ thống tự sinh từ tên món."
                autoSlug={!food}
              />
              <FormTextarea
                name="summary"
                label="Mô tả ngắn"
                hint={(length) => `Hiện trên card ở trang danh sách. ${length}/${LIMITS.summary.max} ký tự.`}
              />
              <FormRichText name="contentHtml" label="Nội dung chi tiết" />
            </>
          }
          side={
            <>
              <FormImage name="coverImageUrl" />
              <FormPanel>
                <FormSelect
                  name="categoryId"
                  label="Nhóm món"
                  placeholder="Chưa phân loại"
                  options={toOptions(categories, (category) => category.name)}
                />
                <FormInput
                  name="season"
                  label="Mùa ngon nhất"
                  hint="Ví dụ: Tháng 3 – tháng 7, hoặc Quanh năm."
                />
              </FormPanel>
            </>
          }
        />
      ) : null}

      {tab === "detail" ? (
        <div className="flex max-w-[760px] flex-col gap-6">
          <FormTextarea
            name="originStory"
            label="Câu chuyện nguồn gốc"
            rows={7}
            hint={(length) =>
              `Món này từ đâu ra, ai làm, gắn với vùng nào. ${length}/${LIMITS.originStory.max} ký tự.`
            }
          />

          <div>
            <p className="mb-1.5 text-[14px] font-semibold">Ăn ở đâu</p>
            <p className="mb-3 text-[13px] leading-relaxed text-muted">
              Danh sách quán gợi ý, hiện thành khối riêng ở trang chi tiết. Chỉ giới thiệu,
              không nhận đặt chỗ hay thu phí.
            </p>
            <FormRows
              name="whereToEat"
              rowLabel="quán"
              addLabel="Thêm quán"
              maxRows={PLACE_LIMITS.rows}
              columns={[
                {
                  key: "name",
                  placeholder: "Tên quán",
                  className: "min-w-[160px] flex-1",
                  maxLength: PLACE_LIMITS.name,
                },
                {
                  key: "address",
                  placeholder: "Địa chỉ",
                  className: "min-w-[220px] flex-[2]",
                  maxLength: PLACE_LIMITS.address,
                },
              ]}
            />
          </div>
        </div>
      ) : null}

      {tab === "seo" ? (
        <SeoTab titleField="name" fallbackField="summary" publicPath={publicPath} />
      ) : null}

      {tab === "publish" ? (
        <PublishTab
          featured={{
            label: "Món nổi bật",
            hint: "Được ưu tiên hiện ở khối Ẩm thực trên trang chủ.",
          }}
        />
      ) : null}
    </AdminForm>
  );
}
