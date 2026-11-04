"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Plus, Trash2 } from "lucide-react";
import {
  AdminButton,
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
import type { AdminCategory, AdminFood, ContentStatus } from "@/lib/admin/types";
import { slugify } from "@/lib/slugify";

type Tab = "content" | "detail" | "seo" | "publish";

interface PlaceRow {
  name: string;
  address: string;
}

interface FormState {
  name: string;
  slug: string;
  summary: string;
  contentHtml: string;
  coverImageUrl: string;
  categoryId: string;
  season: string;
  originStory: string;
  whereToEat: PlaceRow[];
  status: ContentStatus;
  publishedAt: string;
  isFeatured: boolean;
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
  season: "",
  originStory: "",
  whereToEat: [],
  status: "draft",
  publishedAt: "",
  isFeatured: false,
  seoTitle: "",
  seoDescription: "",
};

export function FoodForm({ food }: { food?: AdminFood }) {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { toast, showSuccess, showError, dismiss } = useToast();

  const [tab, setTab] = useState<Tab>("content");
  const [form, setForm] = useState<FormState>(
    food
      ? {
          name: food.name,
          slug: food.slug,
          summary: food.summary ?? "",
          contentHtml: food.contentHtml ?? "",
          coverImageUrl: food.coverImageUrl ?? "",
          categoryId: food.categoryId ?? "",
          season: food.season ?? "",
          originStory: food.originStory ?? "",
          whereToEat: food.whereToEat ?? [],
          status: food.status,
          publishedAt: toLocalInput(food.publishedAt),
          isFeatured: food.isFeatured,
          seoTitle: food.seoTitle ?? "",
          seoDescription: food.seoDescription ?? "",
        }
      : emptyForm,
  );

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(food));

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  useEffect(() => {
    let active = true;
    api
      .get<AdminCategory[]>("/categories?type=food")
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

    if (!form.name.trim()) found.name = "Vui lòng nhập tên món";
    else if (form.name.trim().length < 2) found.name = "Tên quá ngắn";

    if (form.summary.length > 500) found.summary = "Mô tả ngắn tối đa 500 ký tự";
    if (form.originStory.length > 5000)
      found.originStory = "Câu chuyện tối đa 5000 ký tự";
    if (form.seoDescription.length > 320)
      found.seoDescription = "Mô tả SEO tối đa 320 ký tự";

    if (form.status === "scheduled" && !form.publishedAt) {
      found.publishedAt = "Chọn thời điểm xuất bản khi đặt lịch";
    }

    setErrors(found);
    if (Object.keys(found).length > 0) {
      if (found.name || found.summary) setTab("content");
      else if (found.originStory) setTab("detail");
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
        season: form.season.trim() || null,
        originStory: form.originStory.trim() || null,
        whereToEat: form.whereToEat.filter(
          (row) => row.name.trim() && row.address.trim(),
        ),
        status: form.status,
        publishedAt: form.publishedAt
          ? new Date(form.publishedAt).toISOString()
          : null,
        isFeatured: form.isFeatured,
        seoTitle: form.seoTitle.trim() || null,
        seoDescription: form.seoDescription.trim() || null,
      };

      if (food) {
        await api.patch(`/admin/foods/${food.id}`, payload);
        showSuccess("Đã lưu thay đổi");
      } else {
        const { data } = await api.post<AdminFood>("/admin/foods", payload);
        showSuccess("Đã tạo món ăn");
        router.replace(`/admin/foods/${data.id}/edit`);
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
        title={food ? "Sửa món ăn" : "Thêm món ăn"}
        backHref="/admin/foods"
        previewHref={
          food && food.status === "published" ? `/am-thuc/${form.slug}` : undefined
        }
        saving={saving}
        saveLabel={food ? "Lưu thay đổi" : "Tạo món ăn"}
      />

      <FormTabs<Tab>
        active={tab}
        onChange={setTab}
        tabs={[
          ["content", "Nội dung"],
          ["detail", "Nguồn gốc & nơi ăn"],
          ["seo", "SEO"],
          ["publish", "Xuất bản"],
        ]}
      />

      {tab === "content" ? (
        <div className="flex flex-wrap gap-6">
          <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
            <Field label="Tên món" htmlFor="food-name" error={errors.name} required>
              <input
                id="food-name"
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
              htmlFor="food-slug"
              hint="Để trống thì hệ thống tự sinh từ tên món."
            >
              <input
                id="food-slug"
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
              htmlFor="food-summary"
              error={errors.summary}
              hint={`Hiện trên card ở trang danh sách. ${form.summary.length}/500 ký tự.`}
            >
              <textarea
                id="food-summary"
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
            <CoverImagePanel
              value={form.coverImageUrl}
              onChange={(url) => setField("coverImageUrl", url)}
            />

            <div className="flex flex-col gap-5 rounded-[12px] border border-line bg-surface p-5">
              <Field label="Nhóm món" htmlFor="food-category">
                <select
                  id="food-category"
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
                label="Mùa ngon nhất"
                htmlFor="food-season"
                hint="Ví dụ: Tháng 3 – tháng 7, hoặc Quanh năm."
              >
                <input
                  id="food-season"
                  value={form.season}
                  onChange={(event) => setField("season", event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "detail" ? (
        <div className="flex max-w-[760px] flex-col gap-6">
          <Field
            label="Câu chuyện nguồn gốc"
            htmlFor="food-origin-story"
            error={errors.originStory}
            hint={`Món này từ đâu ra, ai làm, gắn với vùng nào. ${form.originStory.length}/5000 ký tự.`}
          >
            <textarea
              id="food-origin-story"
              rows={7}
              value={form.originStory}
              onChange={(event) => setField("originStory", event.target.value)}
              aria-invalid={Boolean(errors.originStory)}
              className={textareaClass}
            />
          </Field>

          <div>
            <p className="mb-1.5 text-[14px] font-semibold">Ăn ở đâu</p>
            <p className="mb-3 text-[13px] leading-relaxed text-muted">
              Danh sách quán gợi ý, hiện thành khối riêng ở trang chi tiết. Chỉ giới
              thiệu, không nhận đặt chỗ hay thu phí.
            </p>

            <div className="flex flex-col gap-3">
              {form.whereToEat.map((row, index) => (
                <div key={index} className="flex flex-wrap items-start gap-3">
                  <input
                    aria-label={`Tên quán ${index + 1}`}
                    value={row.name}
                    placeholder="Tên quán"
                    onChange={(event) => {
                      const next = [...form.whereToEat];
                      next[index] = { ...next[index], name: event.target.value };
                      setField("whereToEat", next);
                    }}
                    className={clsx(inputClass, "min-w-[160px] flex-1")}
                  />
                  <input
                    aria-label={`Địa chỉ quán ${index + 1}`}
                    value={row.address}
                    placeholder="Địa chỉ"
                    onChange={(event) => {
                      const next = [...form.whereToEat];
                      next[index] = { ...next[index], address: event.target.value };
                      setField("whereToEat", next);
                    }}
                    className={clsx(inputClass, "min-w-[220px] flex-[2]")}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setField(
                        "whereToEat",
                        form.whereToEat.filter((_, i) => i !== index),
                      )
                    }
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-line text-muted transition-colors hover:border-ink hover:text-ink"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    <span className="sr-only">Xóa quán {index + 1}</span>
                  </button>
                </div>
              ))}

              <AdminButton
                variant="ghost"
                className="self-start"
                onClick={() =>
                  setField("whereToEat", [...form.whereToEat, { name: "", address: "" }])
                }
              >
                <Plus size={15} aria-hidden="true" />
                Thêm quán
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "seo" ? (
        <SeoTab
          idPrefix="food"
          title={form.name}
          seoTitle={form.seoTitle}
          seoDescription={form.seoDescription}
          fallbackDescription={form.summary}
          publicPath={`/am-thuc/${form.slug}`}
          error={errors.seoDescription}
          onChange={setField}
        />
      ) : null}

      {tab === "publish" ? (
        <PublishTab
          idPrefix="food"
          status={form.status}
          publishedAt={form.publishedAt}
          isFeatured={form.isFeatured}
          featuredLabel="Món nổi bật"
          featuredHint="Được ưu tiên hiện ở khối Ẩm thực trên trang chủ."
          isAdmin={isAdmin}
          error={errors.publishedAt}
          onChangeStatus={(status) => setField("status", status)}
          onChangePublishedAt={(value) => setField("publishedAt", value)}
          onChangeFeatured={(value) => setField("isFeatured", value)}
        />
      ) : null}

      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onDismiss={dismiss} />
      ) : null}
    </form>
  );
}
