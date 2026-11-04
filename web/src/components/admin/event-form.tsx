"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Field,
  Toast,
  inputClass,
  textareaClass,
  useToast,
} from "@/components/admin/ui";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  CoverImagePanel,
  FormHeader,
  FormTabs,
  PublishTab,
  SeoTab,
  toLocalInput,
} from "@/components/admin/form-parts";
import { api, ApiError } from "@/lib/admin/api-client";
import { useAuth } from "@/lib/admin/auth-context";
import type {
  AdminCategory,
  AdminDestination,
  AdminEvent,
  ContentStatus,
} from "@/lib/admin/types";
import { slugify } from "@/lib/slugify";

type Tab = "content" | "schedule" | "seo" | "publish";

interface FormState {
  name: string;
  slug: string;
  summary: string;
  contentHtml: string;
  coverImageUrl: string;
  categoryId: string;
  destinationId: string;
  locationText: string;
  startAt: string;
  endAt: string;
  isRecurring: boolean;
  status: ContentStatus;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
}

const emptyForm: FormState = {
  name: "",
  slug: "",
  summary: "",
  contentHtml: "",
  coverImageUrl: "",
  categoryId: "",
  destinationId: "",
  locationText: "",
  startAt: "",
  endAt: "",
  isRecurring: false,
  status: "draft",
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
};

export function EventForm({ event }: { event?: AdminEvent }) {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { toast, showSuccess, showError, dismiss } = useToast();

  const [tab, setTab] = useState<Tab>("content");
  const [form, setForm] = useState<FormState>(
    event
      ? {
          name: event.name,
          slug: event.slug,
          summary: event.summary ?? "",
          contentHtml: event.contentHtml ?? "",
          coverImageUrl: event.coverImageUrl ?? "",
          categoryId: event.categoryId ?? "",
          destinationId: event.destinationId ?? "",
          locationText: event.locationText ?? "",
          startAt: toLocalInput(event.startAt),
          endAt: toLocalInput(event.endAt),
          isRecurring: event.isRecurring,
          status: event.status,
          publishedAt: toLocalInput(event.publishedAt),
          seoTitle: event.seoTitle ?? "",
          seoDescription: event.seoDescription ?? "",
        }
      : emptyForm,
  );

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [destinations, setDestinations] = useState<AdminDestination[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(event));

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  useEffect(() => {
    let active = true;

    api
      .get<AdminCategory[]>("/categories?type=event")
      .then(({ data }) => {
        if (active) setCategories(data);
      })
      .catch(() => {
        if (active) setCategories([]);
      });

    // Lấy danh sách điểm đến để gắn sự kiện vào một địa điểm có sẵn.
    api
      .get<AdminDestination[]>("/admin/destinations?limit=100")
      .then(({ data }) => {
        if (active) setDestinations(data);
      })
      .catch(() => {
        if (active) setDestinations([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const validate = (): boolean => {
    const found: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim()) found.name = "Vui lòng nhập tên sự kiện";
    else if (form.name.trim().length < 2) found.name = "Tên quá ngắn";

    if (form.summary.length > 500) found.summary = "Mô tả ngắn tối đa 500 ký tự";
    if (form.seoDescription.length > 320)
      found.seoDescription = "Mô tả SEO tối đa 320 ký tự";

    if (!form.startAt) {
      found.startAt = "Sự kiện phải có thời gian bắt đầu";
    } else if (form.endAt && new Date(form.endAt) < new Date(form.startAt)) {
      found.endAt = "Thời gian kết thúc phải sau thời gian bắt đầu";
    }

    if (form.status === "scheduled" && !form.publishedAt) {
      found.publishedAt = "Chọn thời điểm xuất bản khi đặt lịch";
    }

    setErrors(found);
    if (Object.keys(found).length > 0) {
      if (found.name || found.summary) setTab("content");
      else if (found.startAt || found.endAt) setTab("schedule");
      else if (found.seoDescription) setTab("seo");
      else setTab("publish");
      return false;
    }
    return true;
  };

  const submit = async (formEvent: FormEvent) => {
    formEvent.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        summary: form.summary.trim() || null,
        contentHtml: form.contentHtml || null,
        content: {},
        coverImageUrl: form.coverImageUrl.trim() || null,
        categoryId: form.categoryId || null,
        destinationId: form.destinationId || null,
        locationText: form.locationText.trim() || null,
        startAt: new Date(form.startAt).toISOString(),
        endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
        isRecurring: form.isRecurring,
        status: form.status,
        publishedAt: form.publishedAt
          ? new Date(form.publishedAt).toISOString()
          : null,
        seoTitle: form.seoTitle.trim() || null,
        seoDescription: form.seoDescription.trim() || null,
      };

      if (event) {
        await api.patch(`/admin/events/${event.id}`, payload);
        showSuccess("Đã lưu thay đổi");
      } else {
        const { data } = await api.post<AdminEvent>("/admin/events", payload);
        showSuccess("Đã tạo sự kiện");
        router.replace(`/admin/events/${data.id}/edit`);
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
        title={event ? "Sửa sự kiện" : "Thêm sự kiện"}
        backHref="/admin/events"
        previewHref={
          event && event.status === "published" ? `/su-kien/${form.slug}` : undefined
        }
        saving={saving}
        saveLabel={event ? "Lưu thay đổi" : "Tạo sự kiện"}
      />

      <FormTabs<Tab>
        active={tab}
        onChange={setTab}
        tabs={[
          ["content", "Nội dung"],
          ["schedule", "Thời gian & địa điểm"],
          ["seo", "SEO"],
          ["publish", "Xuất bản"],
        ]}
      />

      {tab === "content" ? (
        <div className="flex flex-wrap gap-6">
          <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
            <Field label="Tên sự kiện" htmlFor="event-name" error={errors.name} required>
              <input
                id="event-name"
                value={form.name}
                onChange={(changeEvent) => {
                  const value = changeEvent.target.value;
                  setField("name", value);
                  if (!slugTouched) setField("slug", slugify(value));
                }}
                aria-invalid={Boolean(errors.name)}
                className={inputClass}
              />
            </Field>

            <Field
              label="Đường dẫn"
              htmlFor="event-slug"
              hint="Để trống thì hệ thống tự sinh từ tên sự kiện."
            >
              <input
                id="event-slug"
                value={form.slug}
                onChange={(changeEvent) => {
                  setSlugTouched(true);
                  setField("slug", changeEvent.target.value);
                }}
                className={inputClass}
              />
            </Field>

            <Field
              label="Mô tả ngắn"
              htmlFor="event-summary"
              error={errors.summary}
              hint={`Hiện trên card ở trang danh sách. ${form.summary.length}/500 ký tự.`}
            >
              <textarea
                id="event-summary"
                rows={3}
                value={form.summary}
                onChange={(changeEvent) =>
                  setField("summary", changeEvent.target.value)
                }
                aria-invalid={Boolean(errors.summary)}
                className={textareaClass}
              />
            </Field>

            <div>
              <p className="mb-1.5 text-[14px] font-semibold">Nội dung chi tiết</p>
              <RichTextEditor
                value={form.contentHtml}
                onChange={(html) => setField("contentHtml", html)}
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 basis-[280px] flex-col gap-5">
            <CoverImagePanel
              value={form.coverImageUrl}
              onChange={(url) => setField("coverImageUrl", url)}
            />

            <div className="rounded-[12px] border border-line bg-surface p-5">
              <Field label="Loại sự kiện" htmlFor="event-category">
                <select
                  id="event-category"
                  value={form.categoryId}
                  onChange={(changeEvent) =>
                    setField("categoryId", changeEvent.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Chưa phân loại</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "schedule" ? (
        <div className="flex max-w-[720px] flex-col gap-5">
          <div className="flex flex-wrap gap-5">
            <div className="min-w-[220px] flex-1">
              <Field
                label="Bắt đầu"
                htmlFor="event-start-at"
                error={errors.startAt}
                required
              >
                <input
                  id="event-start-at"
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(changeEvent) =>
                    setField("startAt", changeEvent.target.value)
                  }
                  aria-invalid={Boolean(errors.startAt)}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="min-w-[220px] flex-1">
              <Field
                label="Kết thúc"
                htmlFor="event-end-at"
                error={errors.endAt}
                hint="Để trống nếu sự kiện chỉ diễn ra trong một buổi."
              >
                <input
                  id="event-end-at"
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(changeEvent) => setField("endAt", changeEvent.target.value)}
                  aria-invalid={Boolean(errors.endAt)}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-[8px] border border-line bg-surface p-4">
            <input
              type="checkbox"
              checked={form.isRecurring}
              onChange={(changeEvent) =>
                setField("isRecurring", changeEvent.target.checked)
              }
              className="mt-0.5 h-4 w-4"
            />
            <span>
              <span className="block text-[14.5px] font-semibold">
                Sự kiện thường niên
              </span>
              <span className="mt-0.5 block text-[13.5px] leading-relaxed text-muted">
                Lễ hội lặp lại hằng năm. Trang chi tiết sẽ ghi rõ thay vì để người đọc
                tưởng chỉ có một lần.
              </span>
            </span>
          </label>

          <Field label="Điểm đến liên quan" htmlFor="event-destination">
            <select
              id="event-destination"
              value={form.destinationId}
              onChange={(changeEvent) =>
                setField("destinationId", changeEvent.target.value)
              }
              className={inputClass}
            >
              <option value="">Không gắn điểm đến nào</option>
              {destinations.map((destination) => (
                <option key={destination.id} value={destination.id}>
                  {destination.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Địa điểm (mô tả)"
            htmlFor="event-location-text"
            hint="Dùng khi địa điểm không phải một điểm đến có trong hệ thống. Ví dụ: Quảng trường biển Bảo Ninh."
          >
            <input
              id="event-location-text"
              value={form.locationText}
              onChange={(changeEvent) =>
                setField("locationText", changeEvent.target.value)
              }
              className={inputClass}
            />
          </Field>
        </div>
      ) : null}

      {tab === "seo" ? (
        <SeoTab
          idPrefix="event"
          title={form.name}
          seoTitle={form.seoTitle}
          seoDescription={form.seoDescription}
          fallbackDescription={form.summary}
          publicPath={`/su-kien/${form.slug}`}
          error={errors.seoDescription}
          onChange={setField}
        />
      ) : null}

      {tab === "publish" ? (
        <PublishTab
          idPrefix="event"
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
