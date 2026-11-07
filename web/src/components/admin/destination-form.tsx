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
  optionalNumber,
  type FieldLimits,
  orNull,
  publishFields,
  refineSchedule,
  requiredText,
  seoFields,
  seoPublishDefaults,
  seoPublishPayload,
  text,
  toNumberOrNull,
} from "@/lib/admin/form-utils";
import { COUNT_LIMITS, FIELD_LIMITS as F } from "@/lib/field-limits";
import type { AdminDestination } from "@/lib/admin/types";
import { regions } from "@/lib/filters";

/** Giới hạn theo lib/field-limits.ts. */
const LIMITS = {
  name: F.placeName,
  slug: F.slug,
  summary: F.summary,
  address: F.address,
  bestTime: F.season,
  ...SEO_LIMITS,
} satisfies FieldLimits;

const VISIT_LIMITS = {
  label: F.visitRowLabel.max,
  value: F.visitRowValue.max,
  rows: COUNT_LIMITS.visitRows,
};

const schema = z
  .object({
    name: requiredText("Vui lòng nhập tên điểm đến", LIMITS.name, "Tên quá ngắn"),
    slug: text(LIMITS.slug),
    summary: text(LIMITS.summary),
    contentHtml: z.string(),
    coverImageUrl: text(),
    categoryId: z.string(),
    region: text(),
    address: text(LIMITS.address),
    latitude: optionalNumber({ min: -90, max: 90, message: "Vĩ độ phải là số từ -90 đến 90" }),
    longitude: optionalNumber({
      min: -180,
      max: 180,
      message: "Kinh độ phải là số từ -180 đến 180",
    }),
    bestTime: text(LIMITS.bestTime),
    visitInfo: z
      .array(
        z.object({
          label: text({ max: VISIT_LIMITS.label }),
          value: text({ max: VISIT_LIMITS.value }),
        }),
      )
      .max(VISIT_LIMITS.rows, `Tối đa ${VISIT_LIMITS.rows} dòng`),
    isFeatured: z.boolean(),
    ...seoFields,
    ...publishFields,
  })
  .superRefine(refineSchedule);

type DestinationValues = z.infer<typeof schema>;

type Tab = "content" | "location" | "seo" | "publish";

const TABS = [
  ["content", "Nội dung"],
  ["location", "Vị trí & tham quan"],
  ["seo", "SEO"],
  ["publish", "Xuất bản"],
] as const;

const TAB_FIELDS = {
  content: ["name", "slug", "summary", "bestTime"],
  location: ["address", "latitude", "longitude", "visitInfo"],
  seo: ["seoTitle", "seoDescription"],
  publish: ["publishedAt"],
} satisfies Record<Tab, (keyof DestinationValues)[]>;

const REGION_OPTIONS = regions.map((region) => ({ value: region, label: region }));

function toFormValues(destination?: AdminDestination): DestinationValues {
  return {
    name: destination?.name ?? "",
    slug: destination?.slug ?? "",
    summary: destination?.summary ?? "",
    contentHtml: destination?.contentHtml ?? "",
    coverImageUrl: destination?.coverImageUrl ?? "",
    categoryId: destination?.categoryId ?? "",
    region: destination?.region ?? "",
    address: destination?.address ?? "",
    // API trả tọa độ dạng chuỗi hoặc số (Prisma Decimal); ô nhập cần chuỗi.
    latitude: destination?.latitude != null ? String(destination.latitude) : "",
    longitude: destination?.longitude != null ? String(destination.longitude) : "",
    bestTime: destination?.bestTime ?? "",
    visitInfo: destination?.visitInfo ?? [],
    isFeatured: destination?.isFeatured ?? false,
    ...seoPublishDefaults(destination),
  };
}

function toPayload(values: DestinationValues) {
  return {
    name: values.name,
    slug: values.slug || undefined,
    summary: orNull(values.summary),
    contentHtml: orNull(values.contentHtml),
    content: {},
    coverImageUrl: orNull(values.coverImageUrl),
    categoryId: orNull(values.categoryId),
    region: orNull(values.region),
    address: orNull(values.address),
    latitude: toNumberOrNull(values.latitude),
    longitude: toNumberOrNull(values.longitude),
    bestTime: orNull(values.bestTime),
    visitInfo: values.visitInfo.filter((row) => row.label && row.value),
    isFeatured: values.isFeatured,
    ...seoPublishPayload(values),
  };
}

const publicPath = (slug: string) => `/diem-den/${slug}`;

export function DestinationForm({ destination }: { destination?: AdminDestination }) {
  const [tab, setTab] = useState<Tab>("content");
  const categories = useCategoryOptions("destination");

  const { form, onSubmit, saving } = useResourceForm({
    endpoint: "/admin/destinations",
    record: destination,
    schema,
    defaultValues: toFormValues(destination),
    toPayload,
    createdMessage: "Đã tạo điểm đến",
  });

  return (
    <AdminForm
      form={form}
      idPrefix="destination"
      limits={LIMITS}
      onSubmit={onSubmit}
      onInvalid={(errors) => setTab(firstTabWithError(errors, TAB_FIELDS) ?? tab)}
      className="flex flex-col gap-6"
    >
      <FormHeader
        title={destination ? "Sửa điểm đến" : "Thêm điểm đến"}
        backHref="/admin/destinations"
        previewPath={destination?.status === "published" ? publicPath : undefined}
        saving={saving}
        saveLabel={destination ? "Lưu thay đổi" : "Tạo điểm đến"}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "content" ? (
        <FormColumns
          main={
            <>
              <TitleSlugFields
                titleName="name"
                titleLabel="Tên điểm đến"
                slugHint="Để trống thì hệ thống tự sinh từ tên."
                autoSlug={!destination}
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
                  label="Loại hình"
                  placeholder="Chưa phân loại"
                  options={toOptions(categories, (category) => category.name)}
                />
                <FormInput
                  name="bestTime"
                  label="Thời điểm đẹp nhất"
                  hint="Ví dụ: Tháng 4 – tháng 8, hoặc Quanh năm."
                />
              </FormPanel>
            </>
          }
        />
      ) : null}

      {tab === "location" ? (
        <div className="flex max-w-[760px] flex-col gap-5">
          <FormSelect
            name="region"
            label="Khu vực"
            placeholder="Chưa chọn"
            options={REGION_OPTIONS}
          />
          <FormInput name="address" label="Địa chỉ" />

          <div className="flex flex-wrap gap-5">
            <div className="min-w-[200px] flex-1">
              <FormInput
                name="latitude"
                label="Vĩ độ"
                placeholder="17.5878"
                hint="Mở Google Maps, bấm chuột phải vào địa điểm, số đầu tiên là vĩ độ."
              />
            </div>
            <div className="min-w-[200px] flex-1">
              <FormInput
                name="longitude"
                label="Kinh độ"
                placeholder="106.2847"
                hint="Số thứ hai trong cặp tọa độ."
              />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[14px] font-semibold">Thông tin tham quan</p>
            <p className="mb-3 text-[13px] leading-relaxed text-muted">
              Hiện thành bảng ở cột bên phải trang chi tiết. Ví dụ: &ldquo;Cách đi&rdquo; —
              &ldquo;Thuyền từ bến Xuân Sơn, khoảng 30 phút&rdquo;.
            </p>
            <FormRows
              name="visitInfo"
              rowLabel="dòng"
              addLabel="Thêm dòng"
              maxRows={VISIT_LIMITS.rows}
              columns={[
                {
                  key: "label",
                  placeholder: "Nhãn",
                  className: "min-w-[140px] flex-1",
                  maxLength: VISIT_LIMITS.label,
                },
                {
                  key: "value",
                  placeholder: "Nội dung",
                  className: "min-w-[220px] flex-[2]",
                  maxLength: VISIT_LIMITS.value,
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
            label: "Điểm đến nổi bật",
            hint: "Được ưu tiên hiện ở khối Điểm đến trên trang chủ.",
          }}
        />
      ) : null}
    </AdminForm>
  );
}
