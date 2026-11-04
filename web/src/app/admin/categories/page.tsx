"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import clsx from "clsx";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import {
  AdminButton,
  AdminEmpty,
  AdminError,
  AdminLoading,
  ConfirmDialog,
  Field,
  Toast,
  inputClass,
  textareaClass,
  useToast,
} from "@/components/admin/ui";
import { api, ApiError } from "@/lib/admin/api-client";
import { useAuth } from "@/lib/admin/auth-context";
import { slugify } from "@/lib/slugify";

/** Các loại danh mục, khớp với enum CategoryType ở backend. */
const CATEGORY_TYPES = [
  { key: "article", label: "Tin tức" },
  { key: "culture", label: "Văn hóa" },
  { key: "guide", label: "Cẩm nang" },
  { key: "destination", label: "Điểm đến" },
  { key: "food", label: "Ẩm thực" },
  { key: "event", label: "Sự kiện" },
  { key: "learning", label: "Góc học tập" },
] as const;

type CategoryType = (typeof CATEGORY_TYPES)[number]["key"];

interface Category {
  id: string;
  type: CategoryType;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function CategoriesPage() {
  return (
    <AdminShell>
      <CategoriesContent />
    </AdminShell>
  );
}

function CategoriesContent() {
  const { isAdmin } = useAuth();
  const { toast, showSuccess, showError, dismiss } = useToast();

  const [active, setActive] = useState<CategoryType>("article");
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // API quản trị chưa lọc theo type, nên lấy hết rồi lọc tại đây.
      // Số danh mục rất ít nên không đáng để thêm tham số cho backend.
      const { data } = await api.get<Category[]>("/admin/categories?limit=50");
      setItems(data.filter((item) => item.type === active));
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Không tải được danh mục",
      );
    } finally {
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    void load();
  }, [load]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await api.del(`/admin/categories/${deleting.id}`);
      showSuccess(`Đã xóa danh mục "${deleting.name}"`);
      setDeleting(null);
      await load();
    } catch (caught) {
      showError(caught instanceof ApiError ? caught.message : "Không xóa được");
    } finally {
      setDeletePending(false);
    }
  };

  const activeLabel =
    CATEGORY_TYPES.find((type) => type.key === active)?.label ?? "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold">Danh mục</h1>
          <p className="mt-1.5 max-w-[70ch] text-[14.5px] text-muted">
            Mỗi loại nội dung có bộ danh mục riêng. Danh mục dùng để phân loại bài
            và để lọc ở trang danh sách.
          </p>
        </div>
        <AdminButton onClick={() => setCreating(true)}>
          <Plus size={16} aria-hidden="true" />
          Thêm danh mục
        </AdminButton>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-line">
        {CATEGORY_TYPES.map((type) => (
          <button
            key={type.key}
            type="button"
            onClick={() => setActive(type.key)}
            aria-current={active === type.key ? "true" : undefined}
            className={clsx(
              "min-h-11 border-b-2 px-4 text-[14.5px] font-semibold transition-colors",
              active === type.key
                ? "border-ink text-ink"
                : "border-transparent text-muted hover:text-ink",
            )}
          >
            {type.label}
          </button>
        ))}
      </div>

      {loading ? (
        <AdminLoading />
      ) : error ? (
        <AdminError message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <AdminEmpty
          title={`Chưa có danh mục nào cho ${activeLabel}`}
          action={
            <AdminButton onClick={() => setCreating(true)}>
              <Plus size={16} aria-hidden="true" />
              Thêm danh mục
            </AdminButton>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-line bg-surface">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-alt">
                {["Tên", "Đường dẫn", "Mô tả", ""].map((heading, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-[12.5px] font-semibold uppercase tracking-[0.05em] text-muted"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-line">
                  <td className="px-4 py-3.5 text-[14.5px] font-medium">
                    {item.name}
                    {!item.isActive ? (
                      <span className="ml-2 text-[12.5px] text-muted">· Đang tắt</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5 text-[14px] text-muted">{item.slug}</td>
                  <td className="px-4 py-3.5 text-[14px] text-muted">
                    {item.description || "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(item)}
                        title="Sửa danh mục"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink"
                      >
                        <Pencil size={15} aria-hidden="true" />
                        <span className="sr-only">Sửa {item.name}</span>
                      </button>
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => setDeleting(item)}
                          title="Xóa danh mục"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink"
                        >
                          <Trash2 size={15} aria-hidden="true" />
                          <span className="sr-only">Xóa {item.name}</span>
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating || editing ? (
        <CategoryDialog
          type={active}
          typeLabel={activeLabel}
          category={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={async (message) => {
            setCreating(false);
            setEditing(null);
            showSuccess(message);
            await load();
          }}
          onError={showError}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa danh mục này?"
        description={
          `Danh mục "${deleting?.name}" sẽ bị gỡ. Nội dung đang thuộc danh mục ` +
          "này không bị xóa, chỉ chuyển thành chưa phân loại."
        }
        confirmLabel="Xóa danh mục"
        loading={deletePending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />

      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onDismiss={dismiss} />
      ) : null}
    </div>
  );
}

function CategoryDialog({
  type,
  typeLabel,
  category,
  onClose,
  onSaved,
  onError,
}: {
  type: CategoryType;
  typeLabel: string;
  category: Category | null;
  onClose: () => void;
  onSaved: (message: string) => void | Promise<void>;
  onError: (message: string) => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      setNameError("Vui lòng nhập tên danh mục");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        type,
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || null,
      };

      if (category) {
        await api.patch(`/admin/categories/${category.id}`, payload);
        await onSaved("Đã lưu danh mục");
      } else {
        await api.post("/admin/categories", payload);
        await onSaved("Đã thêm danh mục");
      }
    } catch (error) {
      onError(error instanceof ApiError ? error.message : "Không lưu được danh mục");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-abyss/60 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        noValidate
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[480px] flex-col gap-5 rounded-[12px] bg-surface p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[19px] font-semibold">
            {category ? "Sửa danh mục" : `Thêm danh mục ${typeLabel}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] text-muted hover:bg-primary-50 hover:text-ink"
          >
            <X size={18} aria-hidden="true" />
            <span className="sr-only">Đóng</span>
          </button>
        </div>

        <Field label="Tên danh mục" htmlFor="category-name" error={nameError} required>
          <input
            id="category-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setNameError("");
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
            aria-invalid={Boolean(nameError)}
            className={inputClass}
          />
        </Field>

        <Field
          label="Đường dẫn"
          htmlFor="category-slug"
          hint="Dùng trong địa chỉ khi lọc. Để trống thì tự sinh từ tên."
        >
          <input
            id="category-slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            className={inputClass}
          />
        </Field>

        <Field label="Mô tả" htmlFor="category-description">
          <textarea
            id="category-description"
            rows={2}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={textareaClass}
          />
        </Field>

        <div className="flex justify-end gap-3">
          <AdminButton variant="ghost" onClick={onClose} disabled={saving}>
            Hủy
          </AdminButton>
          <AdminButton type="submit" loading={saving}>
            {category ? "Lưu thay đổi" : "Thêm danh mục"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
