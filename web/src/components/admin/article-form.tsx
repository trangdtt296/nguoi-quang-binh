"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft, ExternalLink, ImagePlus, X } from "lucide-react";
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
import {
  ARTICLE_TYPE_TO_CATEGORY_TYPE,
  type AdminArticle,
  type AdminCategory,
  type ArticleType,
  type ContentStatus,
} from "@/lib/admin/types";
import { slugify } from "@/lib/slugify";

type Tab = "content" | "seo" | "publish";

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  coverImageUrl: string;
  type: ArticleType;
  categoryId: string;
  tags: string;
  status: ContentStatus;
  publishedAt: string;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
}

const emptyForm: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  contentHtml: "",
  coverImageUrl: "",
  type: "news",
  categoryId: "",
  tags: "",
  status: "draft",
  publishedAt: "",
  isFeatured: false,
  seoTitle: "",
  seoDescription: "",
};

/** Chuyển chuỗi ISO sang định dạng mà ô datetime-local hiểu được. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ArticleForm({ article }: { article?: AdminArticle }) {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { toast, showSuccess, showError, dismiss } = useToast();

  const [tab, setTab] = useState<Tab>("content");
  const [form, setForm] = useState<FormState>(
    article
      ? {
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt ?? "",
          contentHtml: article.contentHtml ?? "",
          coverImageUrl: article.coverImageUrl ?? "",
          type: article.type,
          categoryId: article.categoryId ?? "",
          tags: article.tags.join(", "),
          status: article.status,
          publishedAt: toLocalInput(article.publishedAt),
          isFeatured: article.isFeatured,
          seoTitle: article.seoTitle ?? "",
          seoDescription: article.seoDescription ?? "",
        }
      : emptyForm,
  );

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  // Người dùng đã tự sửa slug thì không tự sinh lại nữa.
  const [slugTouched, setSlugTouched] = useState(Boolean(article));

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  // Tải danh mục theo đúng loại bài đang chọn.
  useEffect(() => {
    const categoryType = ARTICLE_TYPE_TO_CATEGORY_TYPE[form.type];
    let active = true;

    api
      .get<AdminCategory[]>(`/categories?type=${categoryType}`)
      .then(({ data }) => {
        if (active) setCategories(data);
      })
      .catch(() => {
        if (active) setCategories([]);
      });

    return () => {
      active = false;
    };
  }, [form.type]);

  const validate = (): boolean => {
    const found: Partial<Record<keyof FormState, string>> = {};

    if (!form.title.trim()) found.title = "Vui lòng nhập tiêu đề";
    else if (form.title.trim().length < 3) found.title = "Tiêu đề quá ngắn";

    if (form.excerpt.length > 500) found.excerpt = "Mô tả ngắn tối đa 500 ký tự";
    if (form.seoDescription.length > 320)
      found.seoDescription = "Mô tả SEO tối đa 320 ký tự";

    if (form.status === "scheduled" && !form.publishedAt) {
      found.publishedAt = "Chọn thời điểm xuất bản khi đặt lịch";
    }

    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Lỗi có thể nằm ở tab khác — mở đúng tab chứa lỗi đầu tiên.
      if (found.title || found.excerpt) setTab("content");
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
        excerpt: form.excerpt.trim() || null,
        contentHtml: form.contentHtml || null,
        content: {},
        coverImageUrl: form.coverImageUrl.trim() || null,
        type: form.type,
        categoryId: form.categoryId || null,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        status: form.status,
        publishedAt: form.publishedAt
          ? new Date(form.publishedAt).toISOString()
          : null,
        isFeatured: form.isFeatured,
        seoTitle: form.seoTitle.trim() || null,
        seoDescription: form.seoDescription.trim() || null,
      };

      if (article) {
        await api.patch(`/admin/articles/${article.id}`, payload);
        showSuccess("Đã lưu thay đổi");
      } else {
        const { data } = await api.post<AdminArticle>("/admin/articles", payload);
        showSuccess("Đã tạo bài viết");
        router.replace(`/admin/articles/${data.id}/edit`);
        return;
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

  const publicPath =
    form.type === "culture"
      ? `/van-hoa/${form.slug}`
      : form.type === "guide"
        ? `/cam-nang/${form.slug}`
        : `/tin-tuc/${form.slug}`;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-line transition-colors hover:border-ink"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            <span className="sr-only">Quay lại danh sách</span>
          </Link>
          <h1 className="text-[24px] font-bold">
            {article ? "Sửa bài viết" : "Soạn bài mới"}
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          {article && article.status === "published" ? (
            <Link
              href={publicPath}
              target="_blank"
              className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-line px-4 text-[14.5px] font-semibold transition-colors hover:border-ink"
            >
              <ExternalLink size={15} aria-hidden="true" />
              Xem trên website
            </Link>
          ) : null}
          <AdminButton type="submit" loading={saving}>
            {saving ? "Đang lưu" : article ? "Lưu thay đổi" : "Tạo bài viết"}
          </AdminButton>
        </div>
      </div>

      <div className="flex gap-1 border-b border-line">
        {(
          [
            ["content", "Nội dung"],
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
            <Field label="Tiêu đề" htmlFor="article-title" error={errors.title} required>
              <input
                id="article-title"
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
              htmlFor="article-slug"
              hint="Để trống thì hệ thống tự sinh từ tiêu đề. Đổi đường dẫn của bài đã xuất bản sẽ làm hỏng các liên kết cũ."
            >
              <input
                id="article-slug"
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
              htmlFor="article-excerpt"
              error={errors.excerpt}
              hint={`Hiện trên card ở trang danh sách. ${form.excerpt.length}/500 ký tự.`}
            >
              <textarea
                id="article-excerpt"
                rows={3}
                value={form.excerpt}
                onChange={(event) => setField("excerpt", event.target.value)}
                aria-invalid={Boolean(errors.excerpt)}
                className={textareaClass}
              />
            </Field>

            <div>
              <p className="mb-1.5 text-[14px] font-semibold">Nội dung</p>
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
              ) : (
                <button
                  type="button"
                  onClick={() => setCoverPickerOpen(true)}
                  className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed border-silver text-muted transition-colors hover:border-ink hover:text-ink"
                >
                  <ImagePlus size={20} aria-hidden="true" />
                  <span className="text-[13.5px]">Chọn ảnh bìa</span>
                </button>
              )}

              {form.coverImageUrl ? (
                <AdminButton
                  variant="ghost"
                  className="mt-3 w-full"
                  onClick={() => setCoverPickerOpen(true)}
                >
                  Đổi ảnh khác
                </AdminButton>
              ) : null}
            </div>

            <div className="flex flex-col gap-5 rounded-[12px] border border-line bg-surface p-5">
              <Field label="Loại bài" htmlFor="article-type">
                <select
                  id="article-type"
                  value={form.type}
                  onChange={(event) => {
                    setField("type", event.target.value as ArticleType);
                    // Danh mục cũ không còn hợp với loại bài mới.
                    setField("categoryId", "");
                  }}
                  className={inputClass}
                >
                  <option value="news">Tin tức</option>
                  <option value="culture">Văn hóa</option>
                  <option value="guide">Cẩm nang</option>
                </select>
              </Field>

              <Field label="Chuyên mục" htmlFor="article-category">
                <select
                  id="article-category"
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
                label="Từ khóa"
                htmlFor="article-tags"
                hint="Cách nhau bằng dấu phẩy."
              >
                <input
                  id="article-tags"
                  value={form.tags}
                  onChange={(event) => setField("tags", event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "seo" ? (
        <div className="flex max-w-[720px] flex-col gap-5">
          <Field
            label="Tiêu đề SEO"
            htmlFor="article-seo-title"
            hint="Để trống thì dùng tiêu đề bài. Nên dưới 60 ký tự để Google không cắt."
          >
            <input
              id="article-seo-title"
              value={form.seoTitle}
              onChange={(event) => setField("seoTitle", event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field
            label="Mô tả SEO"
            htmlFor="article-seo-description"
            error={errors.seoDescription}
            hint={`Hiện dưới tiêu đề trên Google và khi chia sẻ Facebook. ${form.seoDescription.length}/320 ký tự, nên viết khoảng 150.`}
          >
            <textarea
              id="article-seo-description"
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
            <p className="text-[13px] text-muted">
              nguoiquangbinh.vn{publicPath}
            </p>
            <p className="mt-1 text-[18px] font-medium text-deep">
              {form.seoTitle || form.title || "Tiêu đề bài viết"}
            </p>
            <p className="mt-1 max-w-[60ch] text-[14px] leading-relaxed text-muted">
              {form.seoDescription ||
                form.excerpt ||
                "Mô tả sẽ hiện ở đây. Chưa điền thì Google tự lấy một đoạn trong bài."}
            </p>
          </div>
        </div>
      ) : null}

      {tab === "publish" ? (
        <div className="flex max-w-[640px] flex-col gap-5">
          <Field label="Trạng thái" htmlFor="article-status">
            <select
              id="article-status"
              value={form.status}
              onChange={(event) => setField("status", event.target.value as ContentStatus)}
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
            htmlFor="article-published-at"
            error={errors.publishedAt}
            hint="Để trống thì lấy thời điểm bấm Xuất bản. Đặt ngày giờ tương lai kèm trạng thái Lên lịch thì bài tự hiện khi tới giờ."
          >
            <input
              id="article-published-at"
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
                <span className="block text-[14.5px] font-semibold">Bài nổi bật</span>
                <span className="mt-0.5 block text-[13.5px] leading-relaxed text-muted">
                  Được ưu tiên hiện ở trang chủ và đầu danh sách.
                </span>
              </span>
            </label>
          ) : null}
        </div>
      ) : null}

      <MediaPicker
        open={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        onSelect={(media) => {
          setField("coverImageUrl", media.url);
          setCoverPickerOpen(false);
          showSuccess("Đã chọn ảnh bìa");
        }}
      />

      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onDismiss={dismiss} />
      ) : null}
    </form>
  );
}
