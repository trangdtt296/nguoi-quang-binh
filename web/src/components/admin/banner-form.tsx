"use client";

import { z } from "zod";
import {
  AdminForm,
  FormCheckbox,
  FormColumns,
  FormImage,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/admin/form-fields";
import { FormHeader, useResourceForm } from "@/components/admin/form-parts";
import {
  optionalNumber,
  type FieldLimits,
  optionalUrl,
  orNull,
  refineDateOrder,
  requiredText,
  text,
  toIsoOrNull,
  toLocalInput,
} from "@/lib/admin/form-utils";
import { COUNT_LIMITS, FIELD_LIMITS as F } from "@/lib/field-limits";
import { BANNER_POSITION_LABELS, type AdminBanner, type BannerPosition } from "@/lib/admin/types";

const POSITIONS = Object.keys(BANNER_POSITION_LABELS) as [BannerPosition, ...BannerPosition[]];

const POSITION_OPTIONS = POSITIONS.map((value) => ({
  value,
  label: BANNER_POSITION_LABELS[value],
}));

/** Giới hạn theo lib/field-limits.ts. */
const LIMITS = {
  title: F.bannerTitle,
  subtitle: F.bannerSubtitle,
} satisfies FieldLimits;

const schema = z
  .object({
    title: requiredText("Vui lòng nhập tiêu đề banner", LIMITS.title),
    subtitle: text(LIMITS.subtitle),
    imageUrl: text(),
    mobileImageUrl: text(),
    linkUrl: optionalUrl("Liên kết cần dạng đầy đủ, ví dụ https://…"),
    position: z.enum(POSITIONS),
    sortOrder: optionalNumber({
      min: 0,
      integer: true,
      max: COUNT_LIMITS.sortOrder,
      message: `Thứ tự phải là số nguyên từ 0 đến ${COUNT_LIMITS.sortOrder}`,
    }),
    isActive: z.boolean(),
    startAt: z.string(),
    endAt: z.string(),
  })
  .superRefine((values, ctx) =>
    refineDateOrder(values.startAt, values.endAt, ctx, {
      path: "endAt",
      message: "Ngày kết thúc phải sau ngày bắt đầu",
    }),
  );

type BannerValues = z.infer<typeof schema>;

function toFormValues(banner?: AdminBanner): BannerValues {
  return {
    title: banner?.title ?? "",
    subtitle: banner?.subtitle ?? "",
    imageUrl: banner?.imageUrl ?? "",
    mobileImageUrl: banner?.mobileImageUrl ?? "",
    linkUrl: banner?.linkUrl ?? "",
    position: banner?.position ?? "home_hero",
    sortOrder: String(banner?.sortOrder ?? 0),
    isActive: banner?.isActive ?? true,
    startAt: toLocalInput(banner?.startAt),
    endAt: toLocalInput(banner?.endAt),
  };
}

function toPayload(values: BannerValues) {
  return {
    title: values.title,
    subtitle: orNull(values.subtitle),
    imageUrl: orNull(values.imageUrl),
    mobileImageUrl: orNull(values.mobileImageUrl),
    linkUrl: orNull(values.linkUrl),
    position: values.position,
    sortOrder: Number(values.sortOrder || 0),
    isActive: values.isActive,
    startAt: toIsoOrNull(values.startAt),
    endAt: toIsoOrNull(values.endAt),
  };
}

export function BannerForm({ banner }: { banner?: AdminBanner }) {
  const { form, onSubmit, saving } = useResourceForm({
    endpoint: "/admin/banners",
    record: banner,
    schema,
    defaultValues: toFormValues(banner),
    toPayload,
    createdMessage: "Đã tạo banner",
  });

  return (
    <AdminForm
      form={form}
      idPrefix="banner"
      limits={LIMITS}
      onSubmit={onSubmit}
      className="flex flex-col gap-6"
    >
      <FormHeader
        title={banner ? "Sửa banner" : "Thêm banner"}
        backHref="/admin/banners"
        saving={saving}
        saveLabel={banner ? "Lưu thay đổi" : "Tạo banner"}
      />

      <FormColumns
        mainBasis="460px"
        main={
          <>
            <FormInput name="title" label="Tiêu đề" required />
            <FormTextarea
              name="subtitle"
              label="Dòng phụ"
              rows={2}
              hint="Câu ngắn dưới tiêu đề. Để trống nếu ảnh đã nói đủ."
            />
            <FormInput
              name="linkUrl"
              label="Liên kết khi bấm vào"
              placeholder="https://nguoiquangbinh.vn/diem-den/…"
              hint="Để trống thì banner chỉ để xem, không bấm được."
            />

            <div className="flex flex-wrap gap-5">
              <div className="min-w-[200px] flex-1">
                <FormSelect name="position" label="Vị trí" options={POSITION_OPTIONS} />
              </div>
              <div className="min-w-[160px] flex-1">
                <FormInput
                  name="sortOrder"
                  maxLength={String(COUNT_LIMITS.sortOrder).length}
                  label="Thứ tự"
                  inputMode="numeric"
                  hint="Số nhỏ hiện trước."
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-5">
              <div className="min-w-[220px] flex-1">
                <FormInput
                  name="startAt"
                  type="datetime-local"
                  label="Bắt đầu hiện"
                  hint="Để trống thì hiện ngay."
                />
              </div>
              <div className="min-w-[220px] flex-1">
                <FormInput
                  name="endAt"
                  type="datetime-local"
                  label="Ngừng hiện"
                  hint="Để trống thì hiện mãi."
                />
              </div>
            </div>

            <FormCheckbox
              name="isActive"
              label="Đang bật"
              hint="Tắt là ẩn khỏi website ngay, không cần xóa."
            />
          </>
        }
        side={
          <>
            <FormImage name="imageUrl" label="Ảnh máy tính" />
            <FormImage name="mobileImageUrl" label="Ảnh điện thoại" />
            <p className="text-[13px] leading-relaxed text-muted">
              Ảnh điện thoại nên cắt dọc hơn. Để trống thì điện thoại dùng luôn ảnh máy tính,
              chữ trên ảnh có thể bị cắt mất.
            </p>
          </>
        }
      />
    </AdminForm>
  );
}
