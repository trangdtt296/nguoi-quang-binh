"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field, Toast, inputClass, textareaClass, useToast } from "@/components/admin/ui";
import {
  CoverImagePanel,
  FormHeader,
  toLocalInput,
} from "@/components/admin/form-parts";
import { api, ApiError } from "@/lib/admin/api-client";
import {
  BANNER_POSITION_LABELS,
  type AdminBanner,
  type BannerPosition,
} from "@/lib/admin/types";

interface FormState {
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  position: BannerPosition;
  sortOrder: string;
  isActive: boolean;
  startAt: string;
  endAt: string;
}

const emptyForm: FormState = {
  title: "",
  subtitle: "",
  imageUrl: "",
  mobileImageUrl: "",
  linkUrl: "",
  position: "home_hero",
  sortOrder: "0",
  isActive: true,
  startAt: "",
  endAt: "",
};

export function BannerForm({ banner }: { banner?: AdminBanner }) {
  const router = useRouter();
  const { toast, showSuccess, showError, dismiss } = useToast();

  const [form, setForm] = useState<FormState>(
    banner
      ? {
          title: banner.title,
          subtitle: banner.subtitle ?? "",
          imageUrl: banner.imageUrl ?? "",
          mobileImageUrl: banner.mobileImageUrl ?? "",
          linkUrl: banner.linkUrl ?? "",
          position: banner.position,
          sortOrder: String(banner.sortOrder),
          isActive: banner.isActive,
          startAt: toLocalInput(banner.startAt),
          endAt: toLocalInput(banner.endAt),
        }
      : emptyForm,
  );

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): boolean => {
    const found: Partial<Record<keyof FormState, string>> = {};

    if (!form.title.trim()) found.title = "Vui lòng nhập tiêu đề banner";

    if (form.linkUrl.trim()) {
      try {
        new URL(form.linkUrl.trim());
      } catch {
        found.linkUrl = "Liên kết cần dạng đầy đủ, ví dụ https://…";
      }
    }

    const order = form.sortOrder.trim();
    if (order) {
      const parsed = Number(order);
      if (!Number.isInteger(parsed) || parsed < 0) {
        found.sortOrder = "Thứ tự phải là số nguyên từ 0 trở lên";
      }
    }

    if (form.startAt && form.endAt && new Date(form.endAt) < new Date(form.startAt)) {
      found.endAt = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        mobileImageUrl: form.mobileImageUrl.trim() || null,
        linkUrl: form.linkUrl.trim() || null,
        position: form.position,
        sortOrder: form.sortOrder.trim() ? Number(form.sortOrder) : 0,
        isActive: form.isActive,
        startAt: form.startAt ? new Date(form.startAt).toISOString() : null,
        endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
      };

      if (banner) {
        await api.patch(`/admin/banners/${banner.id}`, payload);
        showSuccess("Đã lưu thay đổi");
      } else {
        const { data } = await api.post<AdminBanner>("/admin/banners", payload);
        showSuccess("Đã tạo banner");
        router.replace(`/admin/banners/${data.id}/edit`);
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
        title={banner ? "Sửa banner" : "Thêm banner"}
        backHref="/admin/banners"
        saving={saving}
        saveLabel={banner ? "Lưu thay đổi" : "Tạo banner"}
      />

      <div className="flex flex-wrap gap-6">
        <div className="flex min-w-0 flex-[999_1_460px] flex-col gap-5">
          <Field label="Tiêu đề" htmlFor="banner-title" error={errors.title} required>
            <input
              id="banner-title"
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              aria-invalid={Boolean(errors.title)}
              className={inputClass}
            />
          </Field>

          <Field
            label="Dòng phụ"
            htmlFor="banner-subtitle"
            hint="Câu ngắn dưới tiêu đề. Để trống nếu ảnh đã nói đủ."
          >
            <textarea
              id="banner-subtitle"
              rows={2}
              value={form.subtitle}
              onChange={(event) => setField("subtitle", event.target.value)}
              className={textareaClass}
            />
          </Field>

          <Field
            label="Liên kết khi bấm vào"
            htmlFor="banner-link-url"
            error={errors.linkUrl}
            hint="Để trống thì banner chỉ để xem, không bấm được."
          >
            <input
              id="banner-link-url"
              value={form.linkUrl}
              onChange={(event) => setField("linkUrl", event.target.value)}
              placeholder="https://nguoiquangbinh.vn/diem-den/…"
              aria-invalid={Boolean(errors.linkUrl)}
              className={inputClass}
            />
          </Field>

          <div className="flex flex-wrap gap-5">
            <div className="min-w-[200px] flex-1">
              <Field label="Vị trí" htmlFor="banner-position">
                <select
                  id="banner-position"
                  value={form.position}
                  onChange={(event) =>
                    setField("position", event.target.value as BannerPosition)
                  }
                  className={inputClass}
                >
                  {(
                    Object.entries(BANNER_POSITION_LABELS) as [
                      BannerPosition,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="min-w-[160px] flex-1">
              <Field
                label="Thứ tự"
                htmlFor="banner-sort-order"
                error={errors.sortOrder}
                hint="Số nhỏ hiện trước."
              >
                <input
                  id="banner-sort-order"
                  inputMode="numeric"
                  value={form.sortOrder}
                  onChange={(event) => setField("sortOrder", event.target.value)}
                  aria-invalid={Boolean(errors.sortOrder)}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          <div className="flex flex-wrap gap-5">
            <div className="min-w-[220px] flex-1">
              <Field
                label="Bắt đầu hiện"
                htmlFor="banner-start-at"
                hint="Để trống thì hiện ngay."
              >
                <input
                  id="banner-start-at"
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(event) => setField("startAt", event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="min-w-[220px] flex-1">
              <Field
                label="Ngừng hiện"
                htmlFor="banner-end-at"
                error={errors.endAt}
                hint="Để trống thì hiện mãi."
              >
                <input
                  id="banner-end-at"
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(event) => setField("endAt", event.target.value)}
                  aria-invalid={Boolean(errors.endAt)}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-[8px] border border-line bg-surface p-4">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setField("isActive", event.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            <span>
              <span className="block text-[14.5px] font-semibold">Đang bật</span>
              <span className="mt-0.5 block text-[13.5px] leading-relaxed text-muted">
                Tắt là ẩn khỏi website ngay, không cần xóa.
              </span>
            </span>
          </label>
        </div>

        <div className="flex min-w-0 flex-1 basis-[300px] flex-col gap-5">
          <CoverImagePanel
            label="Ảnh máy tính"
            value={form.imageUrl}
            onChange={(url) => setField("imageUrl", url)}
          />
          <CoverImagePanel
            label="Ảnh điện thoại"
            value={form.mobileImageUrl}
            onChange={(url) => setField("mobileImageUrl", url)}
          />
          <p className="text-[13px] leading-relaxed text-muted">
            Ảnh điện thoại nên cắt dọc hơn. Để trống thì điện thoại dùng luôn ảnh máy
            tính, chữ trên ảnh có thể bị cắt mất.
          </p>
        </div>
      </div>

      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onDismiss={dismiss} />
      ) : null}
    </form>
  );
}
