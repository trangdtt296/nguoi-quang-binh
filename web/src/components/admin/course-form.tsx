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
import {
  CoverImagePanel,
  FormHeader,
  FormTabs,
  PublishTab,
  SeoTab,
  toLocalInput,
} from "@/components/admin/form-parts";
import { CourseLessons } from "@/components/admin/course-lessons";
import { api, ApiError } from "@/lib/admin/api-client";
import { useAuth } from "@/lib/admin/auth-context";
import type { AdminCategory, AdminCourse, ContentStatus } from "@/lib/admin/types";
import { slugify } from "@/lib/slugify";

type Tab = "info" | "lessons" | "seo" | "publish";

interface FormState {
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string;
  categoryId: string;
  status: ContentStatus;
  publishedAt: string;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
}

const emptyForm: FormState = {
  title: "",
  slug: "",
  description: "",
  coverImageUrl: "",
  categoryId: "",
  status: "draft",
  publishedAt: "",
  isFeatured: false,
  seoTitle: "",
  seoDescription: "",
};

export function CourseForm({ course }: { course?: AdminCourse }) {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { toast, showSuccess, showError, dismiss } = useToast();

  const [tab, setTab] = useState<Tab>("info");
  const [form, setForm] = useState<FormState>(
    course
      ? {
          title: course.title,
          slug: course.slug,
          description: course.description ?? "",
          coverImageUrl: course.coverImageUrl ?? "",
          categoryId: course.categoryId ?? "",
          status: course.status,
          publishedAt: toLocalInput(course.publishedAt),
          isFeatured: course.isFeatured,
          seoTitle: course.seoTitle ?? "",
          seoDescription: course.seoDescription ?? "",
        }
      : emptyForm,
  );

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(course));

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  useEffect(() => {
    let active = true;
    api
      .get<AdminCategory[]>("/categories?type=learning")
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

    if (!form.title.trim()) found.title = "Vui lòng nhập tên khóa học";
    else if (form.title.trim().length < 3) found.title = "Tên quá ngắn";

    if (form.description.length > 1000)
      found.description = "Giới thiệu tối đa 1000 ký tự";
    if (form.seoDescription.length > 320)
      found.seoDescription = "Mô tả SEO tối đa 320 ký tự";

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
        categoryId: form.categoryId || null,
        status: form.status,
        publishedAt: form.publishedAt
          ? new Date(form.publishedAt).toISOString()
          : null,
        isFeatured: form.isFeatured,
        seoTitle: form.seoTitle.trim() || null,
        seoDescription: form.seoDescription.trim() || null,
      };

      if (course) {
        await api.patch(`/admin/courses/${course.id}`, payload);
        showSuccess("Đã lưu thay đổi");
      } else {
        const { data } = await api.post<AdminCourse>("/admin/courses", payload);
        showSuccess("Đã tạo khóa học, giờ thêm bài học vào");
        router.replace(`/admin/courses/${data.id}/edit`);
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
        title={course ? "Sửa khóa học" : "Thêm khóa học"}
        backHref="/admin/courses"
        previewHref={
          course && course.status === "published"
            ? `/goc-hoc-tap/${form.slug}`
            : undefined
        }
        saving={saving}
        saveLabel={course ? "Lưu thay đổi" : "Tạo khóa học"}
      />

      <FormTabs<Tab>
        active={tab}
        onChange={setTab}
        tabs={[
          ["info", "Thông tin"],
          [
            "lessons",
            course ? `Bài học (${course.lessonCount})` : "Bài học",
          ],
          ["seo", "SEO"],
          ["publish", "Xuất bản"],
        ]}
      />

      {tab === "info" ? (
        <div className="flex flex-wrap gap-6">
          <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-5">
            <Field
              label="Tên khóa học"
              htmlFor="course-title"
              error={errors.title}
              required
            >
              <input
                id="course-title"
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
              htmlFor="course-slug"
              hint="Để trống thì hệ thống tự sinh từ tên khóa học."
            >
              <input
                id="course-slug"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setField("slug", event.target.value);
                }}
                className={inputClass}
              />
            </Field>

            <Field
              label="Giới thiệu khóa học"
              htmlFor="course-description"
              error={errors.description}
              hint={`Học xong biết làm gì, phù hợp với ai. ${form.description.length}/1000 ký tự.`}
            >
              <textarea
                id="course-description"
                rows={6}
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
                aria-invalid={Boolean(errors.description)}
                className={textareaClass}
              />
            </Field>
          </div>

          <div className="flex min-w-0 flex-1 basis-[280px] flex-col gap-5">
            <CoverImagePanel
              value={form.coverImageUrl}
              onChange={(url) => setField("coverImageUrl", url)}
            />

            <div className="rounded-[12px] border border-line bg-surface p-5">
              <Field
                label="Lĩnh vực"
                htmlFor="course-category"
                hint="Lập trình, tiếng Anh, tiếng Nhật… Người học vào một lĩnh vực là thấy toàn bộ khóa trong đó."
              >
                <select
                  id="course-category"
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
            </div>
          </div>
        </div>
      ) : null}

      {tab === "lessons" ? (
        course ? (
          <CourseLessons courseId={course.id} />
        ) : (
          <p className="max-w-[60ch] rounded-[8px] border border-line bg-surface-alt px-4 py-3 text-[14px] leading-relaxed text-muted">
            Lưu khóa học trước đã. Có khóa rồi mới thêm bài vào được.
          </p>
        )
      ) : null}

      {tab === "seo" ? (
        <SeoTab
          idPrefix="course"
          title={form.title}
          seoTitle={form.seoTitle}
          seoDescription={form.seoDescription}
          fallbackDescription={form.description}
          publicPath={`/goc-hoc-tap/${form.slug}`}
          error={errors.seoDescription}
          onChange={setField}
        />
      ) : null}

      {tab === "publish" ? (
        <PublishTab
          idPrefix="course"
          status={form.status}
          publishedAt={form.publishedAt}
          isFeatured={form.isFeatured}
          featuredLabel="Khóa học nổi bật"
          featuredHint="Được ưu tiên hiện ở khối Góc học tập trên trang chủ."
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
