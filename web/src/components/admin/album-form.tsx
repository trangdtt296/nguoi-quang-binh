"use client";

import { useState } from "react";
import { z } from "zod";
import { Tabs } from "@/components/admin/ui";
import {
  AdminForm,
  FormColumns,
  FormImage,
  FormInput,
  FormTextarea,
  TitleSlugFields,
} from "@/components/admin/form-fields";
import {
  FormHeader,
  PublishTab,
  SaveFirstNote,
  SeoTab,
  useResourceForm,
} from "@/components/admin/form-parts";
import { AlbumPhotos } from "@/components/admin/album-photos";
import {
  SEO_LIMITS,
  firstTabWithError,
  type FieldLimits,
  optionalNumber,
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
import type { AdminAlbum } from "@/lib/admin/types";

/** Giới hạn theo lib/field-limits.ts. */
const LIMITS = {
  title: F.placeName,
  slug: F.slug,
  description: F.albumDescription,
  ...SEO_LIMITS,
} satisfies FieldLimits;

const schema = z
  .object({
    title: requiredText("Vui lòng nhập tên album", LIMITS.title, "Tên quá ngắn"),
    slug: text(LIMITS.slug),
    description: text(LIMITS.description),
    coverImageUrl: text(),
    sortOrder: optionalNumber({
      min: 0,
      integer: true,
      max: COUNT_LIMITS.sortOrder,
      message: `Thứ tự phải là số nguyên từ 0 đến ${COUNT_LIMITS.sortOrder}`,
    }),
    ...seoFields,
    ...publishFields,
  })
  .superRefine(refineSchedule);

type AlbumValues = z.infer<typeof schema>;

type Tab = "info" | "photos" | "seo" | "publish";

const TABS = [
  ["info", "Thông tin"],
  ["photos", "Ảnh"],
  ["seo", "SEO"],
  ["publish", "Xuất bản"],
] as const;

const TAB_FIELDS = {
  info: ["title", "slug", "description", "sortOrder"],
  seo: ["seoTitle", "seoDescription"],
  publish: ["publishedAt"],
} satisfies Partial<Record<Tab, (keyof AlbumValues)[]>>;

function toFormValues(album?: AdminAlbum): AlbumValues {
  return {
    title: album?.title ?? "",
    slug: album?.slug ?? "",
    description: album?.description ?? "",
    coverImageUrl: album?.coverImageUrl ?? "",
    sortOrder: String(album?.sortOrder ?? 0),
    ...seoPublishDefaults(album),
  };
}

function toPayload(values: AlbumValues) {
  return {
    title: values.title,
    slug: values.slug || undefined,
    description: orNull(values.description),
    coverImageUrl: orNull(values.coverImageUrl),
    sortOrder: Number(values.sortOrder || 0),
    ...seoPublishPayload(values),
  };
}

const publicPath = (slug: string) => `/thu-vien/${slug}`;

export function AlbumForm({ album }: { album?: AdminAlbum }) {
  const [tab, setTab] = useState<Tab>("info");

  const { form, onSubmit, saving } = useResourceForm({
    endpoint: "/admin/albums",
    record: album,
    schema,
    defaultValues: toFormValues(album),
    toPayload,
    createdMessage: "Đã tạo album, giờ chọn ảnh vào",
  });

  return (
    <AdminForm
      form={form}
      idPrefix="album"
      limits={LIMITS}
      onSubmit={onSubmit}
      onInvalid={(errors) => setTab(firstTabWithError(errors, TAB_FIELDS) ?? tab)}
      className="flex flex-col gap-6"
    >
      <FormHeader
        title={album ? "Sửa album" : "Thêm album"}
        backHref="/admin/albums"
        previewPath={album?.status === "published" ? publicPath : undefined}
        saving={saving}
        saveLabel={album ? "Lưu thay đổi" : "Tạo album"}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "info" ? (
        <FormColumns
          mainBasis="480px"
          main={
            <>
              <TitleSlugFields
                titleName="title"
                titleLabel="Tên album"
                slugHint="Để trống thì hệ thống tự sinh từ tên album."
                autoSlug={!album}
              />
              <FormTextarea
                name="description"
                label="Mô tả"
                rows={5}
                hint={(length) =>
                  `Bộ ảnh này chụp ở đâu, khi nào, ai chụp. ${length}/${LIMITS.description.max} ký tự.`
                }
              />
              <FormInput
                name="sortOrder"
                maxLength={String(COUNT_LIMITS.sortOrder).length}
                label="Thứ tự hiển thị"
                inputMode="numeric"
                hint="Số nhỏ hiện trước. Để 0 nếu không cần ưu tiên album nào."
              />
            </>
          }
          side={<FormImage name="coverImageUrl" />}
        />
      ) : null}

      {tab === "photos" ? (
        album ? (
          <AlbumPhotos albumId={album.id} />
        ) : (
          <SaveFirstNote>Lưu album trước đã. Có album rồi mới gắn ảnh vào được.</SaveFirstNote>
        )
      ) : null}

      {tab === "seo" ? (
        <SeoTab titleField="title" fallbackField="description" publicPath={publicPath} />
      ) : null}

      {tab === "publish" ? <PublishTab /> : null}
    </AdminForm>
  );
}
