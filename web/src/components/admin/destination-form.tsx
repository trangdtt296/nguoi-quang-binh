"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft, ExternalLink, ImagePlus, Plus, Trash2, X } from "lucide-react";
import {
  AdminButton,
  Field,
  Toast,
  inputClass,
  textareaClass,
  useToast,
} from "@/components/admin/ui";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { MediaPicker } from "@/components/admin/media-picker";
import { api, ApiError } from "@/lib/admin/api-client";
import { useAuth } from "@/lib/admin/auth-context";
import type {
  AdminCategory,
  AdminDestination,
  ContentStatus,
} from "@/lib/admin/types";
import { regions } from "@/lib/filters";
import { slugify } from "@/lib/slugify";

type Tab = "content" | "location" | "seo" | "publish";

interface VisitRow {
  label: string;
  value: string;
}

interface FormState {
  name: string;
  slug: string;
  summary: string;
  contentHtml: string;
  coverImageUrl: string;
  categoryId: string;
  region: string;
  address: string;
  latitude: string;
  longitude: string;
  bestTime: string;
  visitInfo: VisitRow[];
  status: ContentStatus;
  publishedAt: string;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const emptyForm: FormState = {
  name: "",
  slug: "",
  summary: "",
  contentHtml: "",
  coverImageUrl: "",
  categoryId: "",
  region: "",
  address: "",
  latitude: "",
  longitude: "",
  bestTime: "",
  visitInfo: [],
  status: "draft",
  publishedAt: "",
  isFeatured: false,
  seoTitle: "",
  seoDescription: "",
};

export function DestinationForm({ destination }: { destination?: AdminDestination }) {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { toast, showSuccess, showError, dismiss } = useToast();

  const [tab, setTab] = useState<Tab>("content");
  const [form, setForm] = useState<FormState>(
    destination
      ? {
          name: destination.name,
          slug: destination.slug,
          summary: destination.summary ?? "",
          contentHtml: destination.contentHtml ?? "",
          coverImageUrl: destination.coverImageUrl ?? "",
          categoryId: destination.categoryId ?? "",
          region: destination.region ?? "",
          address: destination.address ?? "",
          latitude: destination.latitude != null ? String(destination.latitude) : "",
          longitude: destination.longitude != null ? String(destination.longitude) : "",
          bestTime: destination.bestTime ?? "",
          visitInfo: destination.visitInfo ?? [],
          status: destination.status,
          publishedAt: toLocalInput(destination.publishedAt),
          isFeatured: destination.isFeatured,
          seoTitle: destination.seoTitle ?? "",
          seoDescription: destination.seoDescription ?? "",
        }
      : emptyForm,
  );

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(destination));

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  useEffect(() => {
    let active = true;
    api
      .get<AdminCategory[]>("/categories?type=destination")
      .then(({ data }) => {
        if (active) setCategories(data);
      })
      .catch(() => {
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const validate = (): boolean => {
    const found: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim()) found.name = "Vui lòng nhập tên điểm đến";
    else if (form.name.trim().length < 2) found.name = "Tên quá ngắn";

    if (form.summary.length > 500) found.summary = "Mô tả ngắn tối đa 500 ký tự";
    if (form.seoDescription.length > 320)
      found.seoDescription = "Mô tả SEO tối đa 320 ký tự";

    const lat = form.latitude.trim();
    if (lat) {
      const parsed = Number(lat);
      if (!Number.isFinite(parsed) || parsed < -90 || parsed > 90) {
        found.latitude = "Vĩ độ phải là số từ -90 đến 90";
      }
    }

    const lng = form.longitude.trim();
    if (lng) {
      const parsed = Number(lng);
      if (!Number.isFinite(parsed) || parsed < -180 || parsed > 180) {
        found.longitude = "Kinh độ phải là số từ -180 đến 180";
      }
    }

    if (form.status === "scheduled" && !form.publishedAt) {
      found.publishedAt = "Chọn thời điểm xuất bản khi đặt lịch";
    }

    setErrors(found);
    if (Object.keys(found).length > 0) {
      if (found.name || found.summary) setTab("content");
      else if (found.latitude || found.longitude) setTab("location");
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
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        summary: form.summary.trim() || null,
        contentHtml: form.contentHtml || null,
        content: {},
        coverImageUrl: form.coverImageUrl.trim() || null,
        categoryId: form.categoryId || null,
        region: form.region.trim() || null,
        address: form.address.trim() || null,
        latitude: form.latitude.trim() ? Number(form.latitude) : null,
        longitude: form.longitude.trim() ? Number(form.longitude) : null,
        bestTime: form.bestTime.trim() || null,
        visitInfo: form.visitInfo.filter((row) => row.label.trim() && row.value.trim()),
        status: form.status,
        publishedAt: form.publishedAt
          ? new Date(form.publishedAt).toISOString()
          : null,
        isFeatured: form.isFeatured,
        seoTitle: form.seoTitle.trim() || null,
        seoDescription: form.seoDescription.trim() || null,
      };

      if (destination) {
        await api.patch(`/admin/destinations/${destination.id}`, payload);
        showSuccess("Đã lưu thay đổi");
      } else {
        const { data } = await api.post<AdminDestination>(
          "/admin/destinations",
          payload,
        );
        showSuccess("Đã tạo điểm đến");
        router.replace(`/admin/destinations/${data.id}/edit`);
      }
    } catch (error) {
      if (error instanceof ApiError && error.details?.length) {
        showError(
          `${error.message}: ${error.details.map((d) => d.message).join(", ")}`,
        );
      } else {
        showError(error instanceof ApiError ? error.message : "Không lưu được");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/destinations"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-line transition-colors hover:border-ink"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            <span className="sr-only">Quay lại danh sách</span>
          </Link>
          <h1 className="text-[24px] font-bold">
            {destination ? "Sửa điểm đến" : "Thêm điểm đến"}
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          {destination && destination.status === "published" ? (
            <Link
              href={`/diem-den/${form.slug}`}
              target="_blank"
              className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-line px-4 text-[14.5px] font-semibold transition-colors hover:border-ink"
            >
              <ExternalLink size={15} aria-hidden="true" />
              Xem trên website
            </Link>
          ) : null}
          <AdminButton type="submit" loading={saving}>
            {saving ? "Đang lưu" : destination ? "Lưu thay đổi" : "Tạo điểm đến"}
          </AdminButton>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-line">
        {(
          [
            ["content", "Nội dung"],
            ["location", "Vị trí & tham quan"],
            ["seo", "SEO"],
            ["publish", "Xuất bản"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            aria-current={tab === key ? "true" : undefined}
            className={clsx(
              "min-h-11 border-b-2 px-4 text-[14.5px] font-semibold transition-colors",
              tab === key
                ? "border-ink text-ink"
                : "border-transparent text-muted hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "content" ? (
        <div className="flex flex-wrap gap-6">
          <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
            <Field
              label="Tên điểm đến"
              htmlFor="destination-name"
              error={errors.name}
              required
            >
              <input
                id="destination-name"
                value={form.name}
                onChange={(event) => {
                  const value = event.target.value;
                  setField("name", value);
                  if (!slugTouched) setField("slug", slugify(value));
                }}
                aria-invalid={Boolean(errors.name)}
                className={inputClass}
              />
            </Field>

            <Field
              label="Đường dẫn"
              htmlFor="destination-slug"
              hint="Để trống thì hệ thống tự sinh từ tên."
            >
              <input
                id="destination-slug"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setField("slug", event.target.value);
                }}
                className={inputClass}
              />
            </Field>

            <Field
              label="Mô tả ngắn"
              htmlFor="destination-summary"
              error={errors.summary}
              hint={`Hiện trên card ở trang danh sách. ${form.summary.length}/500 ký tự.`}
            >
              <textarea
                id="destination-summary"
                rows={3}
                value={form.summary}
                onChange={(event) => setField("summary", event.target.value)}
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
            <div className="rounded-[12px] border border-line bg-surface p-5">
              <h2 className="mb-4 text-[15px] font-semibold">Ảnh bìa</h2>
              {form.coverImageUrl ? (
                <>
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.coverImageUrl}
                      alt="Ảnh bìa đã chọn"
                      className="aspect-video w-full rounded-[8px] object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setField("coverImageUrl", "")}
                      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-abyss/80 text-white"
                    >
                      <X size={15} aria-hidden="true" />
                      <span className="sr-only">Bỏ ảnh bìa</span>
                    </button>
                  </div>
                  <AdminButton
                    variant="ghost"
                    className="mt-3 w-full"
                    onClick={() => setPickerOpen(true)}
                  >
                    Đổi ảnh khác
                  </AdminButton>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed border-silver text-muted transition-colors hover:border-ink hover:text-ink"
                >
                  <ImagePlus size={20} aria-hidden="true" />
                  <span className="text-[13.5px]">Chọn ảnh bìa</span>
                </button>
              )}
            </div>

            <div className="flex flex-col gap-5 rounded-[12px] border border-line bg-surface p-5">
              <Field label="Loại hình" htmlFor="destination-category">
                <select
                  id="destination-category"
                  value={form.categoryId}
                  onChange={(event) => setField("categoryId", event.target.value)}
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

              <Field
                label="Thời điểm đẹp nhất"
                htmlFor="destination-best-time"
                hint="Ví dụ: Tháng 4 – tháng 8, hoặc Quanh năm."
              >
                <input
                  id="destination-best-time"
                  value={form.bestTime}
                  onChange={(event) => setField("bestTime", event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "location" ? (
        <div className="flex max-w-[760px] flex-col gap-5">
          <Field label="Khu vực" htmlFor="destination-region">
            <select
              id="destination-region"
              value={form.region}
              onChange={(event) => setField("region", event.target.value)}
              className={inputClass}
            >
              <option value="">Chưa chọn</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Địa chỉ" htmlFor="destination-address">
            <input
              id="destination-address"
              value={form.address}
              onChange={(event) => setField("address", event.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="flex flex-wrap gap-5">
            <div className="min-w-[200px] flex-1">
              <Field
                label="Vĩ độ"
                htmlFor="destination-latitude"
                error={errors.latitude}
                hint="Mở Google Maps, bấm chuột phải vào địa điểm, số đầu tiên là vĩ độ."
              >
                <input
                  id="destination-latitude"
                  value={form.latitude}
                  onChange={(event) => setField("latitude", event.target.value)}
                  aria-invalid={Boolean(errors.latitude)}
                  placeholder="17.5878"
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="min-w-[200px] flex-1">
              <Field
                label="Kinh độ"
                htmlFor="destination-longitude"
                error={errors.longitude}
                hint="Số thứ hai trong cặp tọa độ."
              >
                <input
                  id="destination-longitude"
                  value={form.longitude}
                  onChange={(event) => setField("longitude", event.target.value)}
                  aria-invalid={Boolean(errors.longitude)}
                  placeholder="106.2847"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[14px] font-semibold">Thông tin tham quan</p>
            <p className="mb-3 text-[13px] leading-relaxed text-muted">
              Hiện thành bảng ở cột bên phải trang chi tiết. Ví dụ: &ldquo;Cách
              đi&rdquo; — &ldquo;Thuyền từ bến Xuân Sơn, khoảng 30 phút&rdquo;.
            </p>

            <div className="flex flex-col gap-3">
              {form.visitInfo.map((row, index) => (
                <div key={index} className="flex flex-wrap items-start gap-3">
                  <input
                    aria-label={`Nhãn dòng ${index + 1}`}
                    value={row.label}
                    placeholder="Nhãn"
                    onChange={(event) => {
                      const next = [...form.visitInfo];
                      next[index] = { ...next[index], label: event.target.value };
                      setField("visitInfo", next);
                    }}
                    className={clsx(inputClass, "min-w-[140px] flex-1")}
                  />
                  <input
                    aria-label={`Nội dung dòng ${index + 1}`}
                    value={row.value}
                    placeholder="Nội dung"
                    onChange={(event) => {
                      const next = [...form.visitInfo];
                      next[index] = { ...next[index], value: event.target.value };
                      setField("visitInfo", next);
                    }}
                    className={clsx(inputClass, "min-w-[220px] flex-[2]")}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setField(
                        "visitInfo",
                        form.visitInfo.filter((_, i) => i !== index),
                      )
                    }
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-line text-muted transition-colors hover:border-ink hover:text-ink"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    <span className="sr-only">Xóa dòng {index + 1}</span>
                  </button>
                </div>
              ))}

              <AdminButton
                variant="ghost"
                className="self-start"
                onClick={() =>
                  setField("visitInfo", [...form.visitInfo, { label: "", value: "" }])
                }
              >
                <Plus size={15} aria-hidden="true" />
                Thêm dòng
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "seo" ? (
        <div className="flex max-w-[720px] flex-col gap-5">
          <Field
            label="Tiêu đề SEO"
            htmlFor="destination-seo-title"
            hint="Để trống thì dùng tên điểm đến. Nên dưới 60 ký tự."
          >
            <input
              id="destination-seo-title"
              value={form.seoTitle}
              onChange={(event) => setField("seoTitle", event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field
            label="Mô tả SEO"
            htmlFor="destination-seo-description"
            error={errors.seoDescription}
            hint={`${form.seoDescription.length}/320 ký tự, nên viết khoảng 150.`}
          >
            <textarea
              id="destination-seo-description"
              rows={3}
              value={form.seoDescription}
              onChange={(event) => setField("seoDescription", event.target.value)}
              aria-invalid={Boolean(errors.seoDescription)}
              className={textareaClass}
            />
          </Field>

          <div className="rounded-[12px] border border-line bg-surface-alt p-5">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.05em] text-muted">
              Xem trước trên Google
            </p>
            <p className="text-[13px] text-muted">nguoiquangbinh.vn/diem-den/{form.slug}</p>
            <p className="mt-1 text-[18px] font-medium text-deep">
              {form.seoTitle || form.name || "Tên điểm đến"}
            </p>
            <p className="mt-1 max-w-[60ch] text-[14px] leading-relaxed text-muted">
              {form.seoDescription || form.summary || "Mô tả sẽ hiện ở đây."}
            </p>
          </div>
        </div>
      ) : null}

      {tab === "publish" ? (
        <div className="flex max-w-[640px] flex-col gap-5">
          <Field label="Trạng thái" htmlFor="destination-status">
            <select
              id="destination-status"
              value={form.status}
              onChange={(event) =>
                setField("status", event.target.value as ContentStatus)
              }
              className={inputClass}
            >
              <option value="draft">Bản nháp — chỉ mình thấy</option>
              {isAdmin ? (
                <>
                  <option value="published">Xuất bản — hiện trên website</option>
                  <option value="scheduled">Lên lịch — tự hiện khi tới giờ</option>
                  <option value="archived">Lưu trữ — ẩn khỏi website</option>
                </>
              ) : null}
            </select>
          </Field>

          {!isAdmin ? (
            <p className="rounded-[8px] border border-line bg-surface-alt px-4 py-3 text-[14px] leading-relaxed text-muted">
              Tài khoản cộng tác viên chỉ lưu được bản nháp. Quản trị viên sẽ duyệt
              và xuất bản.
            </p>
          ) : null}

          <Field
            label="Thời điểm xuất bản"
            htmlFor="destination-published-at"
            error={errors.publishedAt}
            hint="Để trống thì lấy thời điểm bấm Xuất bản."
          >
            <input
              id="destination-published-at"
              type="datetime-local"
              value={form.publishedAt}
              onChange={(event) => setField("publishedAt", event.target.value)}
              aria-invalid={Boolean(errors.publishedAt)}
              className={inputClass}
            />
          </Field>

          {isAdmin ? (
            <label className="flex items-start gap-3 rounded-[8px] border border-line bg-surface p-4">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => setField("isFeatured", event.target.checked)}
                className="mt-0.5 h-4 w-4"
              />
              <span>
                <span className="block text-[14.5px] font-semibold">
                  Điểm đến nổi bật
                </span>
                <span className="mt-0.5 block text-[13.5px] leading-relaxed text-muted">
                  Được ưu tiên hiện ở khối Điểm đến trên trang chủ.
                </span>
              </span>
            </label>
          ) : null}
        </div>
      ) : null}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media) => {
          setField("coverImageUrl", media.url);
          setPickerOpen(false);
          showSuccess("Đã chọn ảnh bìa");
        }}
      />

      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onDismiss={dismiss} />
      ) : null}
    </form>
  );
}
