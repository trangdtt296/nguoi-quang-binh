"use client";

import { useState } from "react";
import { z } from "zod";
import { Tabs } from "@/components/admin/ui";
import {
  AdminForm,
  FormCheckbox,
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
import { useCategoryOptions, useDestinationOptions } from "@/lib/admin/queries";
import {
  SEO_LIMITS,
  firstTabWithError,
  type FieldLimits,
  orNull,
  publishFields,
  refineDateOrder,
  refineSchedule,
  requiredText,
  seoFields,
  seoPublishDefaults,
  seoPublishPayload,
  text,
  toIsoOrNull,
  toLocalInput,
} from "@/lib/admin/form-utils";
import { FIELD_LIMITS as F } from "@/lib/field-limits";
import type { AdminEvent } from "@/lib/admin/types";

/** Giới hạn theo lib/field-limits.ts. */
const LIMITS = {
  name: F.placeName,
  slug: F.slug,
  summary: F.summary,
  locationText: F.locationText,
  ...SEO_LIMITS,
} satisfies FieldLimits;

const schema = z
  .object({
    name: requiredText("Vui lòng nhập tên sự kiện", LIMITS.name, "Tên quá ngắn"),
    slug: text(LIMITS.slug),
    summary: text(LIMITS.summary),
    contentHtml: z.string(),
    coverImageUrl: text(),
    categoryId: z.string(),
    destinationId: z.string(),
    locationText: text(LIMITS.locationText),
    startAt: z.string().min(1, "Sự kiện phải có thời gian bắt đầu"),
    endAt: z.string(),
    isRecurring: z.boolean(),
    ...seoFields,
    ...publishFields,
  })
  .superRefine((values, ctx) => {
    refineSchedule(values, ctx);
    refineDateOrder(values.startAt, values.endAt, ctx, {
      path: "endAt",
      message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    });
  });

type EventValues = z.infer<typeof schema>;

type Tab = "content" | "schedule" | "seo" | "publish";

const TABS = [
  ["content", "Nội dung"],
  ["schedule", "Thời gian & địa điểm"],
  ["seo", "SEO"],
  ["publish", "Xuất bản"],
] as const;

const TAB_FIELDS = {
  content: ["name", "slug", "summary"],
  schedule: ["startAt", "endAt", "locationText"],
  seo: ["seoTitle", "seoDescription"],
  publish: ["publishedAt"],
} satisfies Record<Tab, (keyof EventValues)[]>;

function toFormValues(event?: AdminEvent): EventValues {
  return {
    name: event?.name ?? "",
    slug: event?.slug ?? "",
    summary: event?.summary ?? "",
    contentHtml: event?.contentHtml ?? "",
    coverImageUrl: event?.coverImageUrl ?? "",
    categoryId: event?.categoryId ?? "",
    destinationId: event?.destinationId ?? "",
    locationText: event?.locationText ?? "",
    startAt: toLocalInput(event?.startAt),
    endAt: toLocalInput(event?.endAt),
    isRecurring: event?.isRecurring ?? false,
    ...seoPublishDefaults(event),
  };
}

function toPayload(values: EventValues) {
  return {
    name: values.name,
    slug: values.slug || undefined,
    summary: orNull(values.summary),
    contentHtml: orNull(values.contentHtml),
    content: {},
    coverImageUrl: orNull(values.coverImageUrl),
    categoryId: orNull(values.categoryId),
    destinationId: orNull(values.destinationId),
    locationText: orNull(values.locationText),
    startAt: toIsoOrNull(values.startAt),
    endAt: toIsoOrNull(values.endAt),
    isRecurring: values.isRecurring,
    ...seoPublishPayload(values),
  };
}

const publicPath = (slug: string) => `/su-kien/${slug}`;

export function EventForm({ event }: { event?: AdminEvent }) {
  const [tab, setTab] = useState<Tab>("content");
  const categories = useCategoryOptions("event");
  const destinations = useDestinationOptions();

  const { form, onSubmit, saving } = useResourceForm({
    endpoint: "/admin/events",
    record: event,
    schema,
    defaultValues: toFormValues(event),
    toPayload,
    createdMessage: "Đã tạo sự kiện",
  });

  return (
    <AdminForm
      form={form}
      idPrefix="event"
      limits={LIMITS}
      onSubmit={onSubmit}
      onInvalid={(errors) => setTab(firstTabWithError(errors, TAB_FIELDS) ?? tab)}
      className="flex flex-col gap-6"
    >
      <FormHeader
        title={event ? "Sửa sự kiện" : "Thêm sự kiện"}
        backHref="/admin/events"
        previewPath={event?.status === "published" ? publicPath : undefined}
        saving={saving}
        saveLabel={event ? "Lưu thay đổi" : "Tạo sự kiện"}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "content" ? (
        <FormColumns
          main={
            <>
              <TitleSlugFields
                titleName="name"
                titleLabel="Tên sự kiện"
                slugHint="Để trống thì hệ thống tự sinh từ tên sự kiện."
                autoSlug={!event}
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
                  label="Loại sự kiện"
                  placeholder="Chưa phân loại"
                  options={toOptions(categories, (category) => category.name)}
                />
              </FormPanel>
            </>
          }
        />
      ) : null}

      {tab === "schedule" ? (
        <div className="flex max-w-[720px] flex-col gap-5">
          <div className="flex flex-wrap gap-5">
            <div className="min-w-[220px] flex-1">
              <FormInput name="startAt" type="datetime-local" label="Bắt đầu" required />
            </div>
            <div className="min-w-[220px] flex-1">
              <FormInput
                name="endAt"
                type="datetime-local"
                label="Kết thúc"
                hint="Để trống nếu sự kiện chỉ diễn ra trong một buổi."
              />
            </div>
          </div>

          <FormCheckbox
            name="isRecurring"
            label="Sự kiện thường niên"
            hint="Lễ hội lặp lại hằng năm. Trang chi tiết sẽ ghi rõ thay vì để người đọc tưởng chỉ có một lần."
          />

          <FormSelect
            name="destinationId"
            label="Điểm đến liên quan"
            placeholder="Không gắn điểm đến nào"
            options={toOptions(destinations, (destination) => destination.name)}
          />

          <FormInput
            name="locationText"
            label="Địa điểm (mô tả)"
            hint="Dùng khi địa điểm không phải một điểm đến có trong hệ thống. Ví dụ: Quảng trường biển Bảo Ninh."
          />
        </div>
      ) : null}

      {tab === "seo" ? (
        <SeoTab titleField="name" fallbackField="summary" publicPath={publicPath} />
      ) : null}

      {tab === "publish" ? <PublishTab /> : null}
    </AdminForm>
  );
}
