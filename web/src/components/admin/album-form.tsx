"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Field,
  Toast,
  inputClass,
  textareaClass,
  useToast,
} from "@/components/admin/ui";
import {
  CoverImagePanel,
  FormHeader,
  FormTabs,
  PublishTab,
  SeoTab,
  toLocalInput,
} from "@/components/admin/form-parts";
import { AlbumPhotos } from "@/components/admin/album-photos";
import { api, ApiError } from "@/lib/admin/api-client";
import { useAuth } from "@/lib/admin/auth-context";
import type { AdminAlbum, ContentStatus } from "@/lib/admin/types";
import { slugify } from "@/lib/slugify";

type Tab = "info" | "photos" | "seo" | "publish";

interface FormState {
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string;
  sortOrder: string;
  status: ContentStatus;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
}

const emptyForm: FormState = {
  title: "",
  slug: "",
  description: "",
  coverImageUrl: "",
  sortOrder: "0",
  status: "draft",
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
};

export function AlbumForm({ album }: { album?: AdminAlbum }) {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { toast, showSuccess, showError, dismiss } = useToast();

  const [tab, setTab] = useState<Tab>("info");
  const [form, setForm] = useState<FormState>(
    album
      ? {
          title: album.title,
          slug: album.slug,
          description: album.description ?? "",
          coverImageUrl: album.coverImageUrl ?? "",
          sortOrder: String(album.sortOrder),
          status: album.status,
          publishedAt: toLocalInput(album.publishedAt),
          seoTitle: album.seoTitle ?? "",
          seoDescription: album.seoDescription ?? "",
        }
      : emptyForm,
  );

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(album));

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): boolean => {
    const found: Partial<Record<keyof FormState, string>> = {};

    if (!form.title.trim()) found.title = "Vui lòng nhập tên album";
    else if (form.title.trim().length < 2) found.title = "Tên quá ngắn";

    if (form.description.length > 1000) found.description = "Mô tả tối đa 1000 ký tự";
    if (form.seoDescription.length > 320)
      found.seoDescription = "Mô tả SEO tối đa 320 ký tự";

    const order = form.sortOrder.trim();
    if (order) {
      const parsed = Number(order);
      if (!Number.isInteger(parsed) || parsed < 0) {
        found.sortOrder = "Thứ tự phải là số nguyên từ 0 trở lên";
      }
    }

    if (form.status === "scheduled" && !form.publishedAt) {
      found.publishedAt = "Chọn thời điểm xuất bản khi đặt lịch";
    }

    setErrors(found);
    if (Object.keys(found).length > 0) {
      if (found.title || found.description) setTab("info");
      else if (found.seoDescription) setTab("seo");
      else setTab("publish");
      return false;
    }
    return true;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || null,
        coverImageUrl: form.coverImageUrl.trim() || null,
        sortOrder: form.sortOrder.trim() ? Number(form.sortOrder) : 0,
        status: form.status,
        publishedAt: form.publishedAt
          ? new Date(form.publishedAt).toISOString()
          : null,
        seoTitle: form.seoTitle.trim() || null,
        seoDescription: form.seoDescription.trim() || null,
      };

      if (album) {
        await api.patch(`/admin/albums/${album.id}`, payload);
        showSuccess("Đã lưu thay đổi");
      } else {
        const { data } = await api.post<AdminAlbum>("/admin/albums", payload);
        showSuccess("Đã tạo album, giờ chọn ảnh vào");
        router.replace(`/admin/albums/${data.id}/edit`);
      }
    } catch (error) {
      if (error instanceof ApiError && error.details?.length) {
        showError(`${error.message}: ${error.details.map((d) => d.message).join(", ")}`);
      } else {
        showError(error instanceof ApiError ? error.message : "Không lưu được");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <FormHeader
        title={album ? "Sửa album" : "Thêm album"}
        backHref="/admin/albums"
        previewHref={
          album && album.status === "published" ? `/thu-vien/${form.slug}` : undefined
        }
        saving={saving}
        saveLabel={album ? "Lưu thay đổi" : "Tạo album"}
      />

      <FormTabs<Tab>
        active={tab}
        onChange={setTab}
        tabs={[
          ["info", "Thông tin"],
          ["photos", "Ảnh"],
          ["seo", "SEO"],
          ["publish", "Xuất bản"],
        ]}
      />

      {tab === "info" ? (
        <div className="flex flex-wrap gap-6">
          <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-5">
            <Field label="Tên album" htmlFor="album-title" error={errors.title} required>
              <input
                id="album-title"
                value={form.title}
                onChange={(event) => {
                  const value = event.target.value;
                  setField("title", value);
                  if (!slugTouched) setField("slug", slugify(value));
                }}
                aria-invalid={Boolean(errors.title)}
                className={inputClass}
              />
            </Field>

            <Field
              label="Đường dẫn"
              htmlFor="album-slug"
              hint="Để trống thì hệ thống tự sinh từ tên album."
            >
              <input
                id="album-slug"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setField("slug", event.target.value);
                }}
                className={inputClass}
              />
            </Field>

            <Field
              label="Mô tả"
              htmlFor="album-description"
              error={errors.description}
              hint={`Bộ ảnh này chụp ở đâu, khi nào, ai chụp. ${form.description.length}/1000 ký tự.`}
            >
              <textarea
                id="album-description"
                rows={5}
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
                aria-invalid={Boolean(errors.description)}
                className={textareaClass}
              />
            </Field>

            <Field
              label="Thứ tự hiển thị"
              htmlFor="album-sort-order"
              error={errors.sortOrder}
              hint="Số nhỏ hiện trước. Để 0 nếu không cần ưu tiên album nào."
            >
              <input
                id="album-sort-order"
                inputMode="numeric"
                value={form.sortOrder}
                onChange={(event) => setField("sortOrder", event.target.value)}
                aria-invalid={Boolean(errors.sortOrder)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="flex min-w-0 flex-1 basis-[280px] flex-col gap-5">
            <CoverImagePanel
              value={form.coverImageUrl}
              onChange={(url) => setField("coverImageUrl", url)}
            />
          </div>
        </div>
      ) : null}

      {tab === "photos" ? (
        album ? (
          <AlbumPhotos albumId={album.id} />
        ) : (
          <p className="max-w-[60ch] rounded-[8px] border border-line bg-surface-alt px-4 py-3 text-[14px] leading-relaxed text-muted">
            Lưu album trước đã. Có album rồi mới gắn ảnh vào được.
          </p>
        )
      ) : null}

      {tab === "seo" ? (
        <SeoTab
          idPrefix="album"
          title={form.title}
          seoTitle={form.seoTitle}
          seoDescription={form.seoDescription}
          fallbackDescription={form.description}
          publicPath={`/thu-vien/${form.slug}`}
          error={errors.seoDescription}
          onChange={setField}
        />
      ) : null}

      {tab === "publish" ? (
        <PublishTab
          idPrefix="album"
          status={form.status}
          publishedAt={form.publishedAt}
          isAdmin={isAdmin}
          error={errors.publishedAt}
          onChangeStatus={(status) => setField("status", status)}
          onChangePublishedAt={(value) => setField("publishedAt", value)}
        />
      ) : null}

      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onDismiss={dismiss} />
      ) : null}
    </form>
  );
}
