"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  AdminButton,
  AdminEmpty,
  ConfirmDialog,
  DialogHeader,
  IconButton,
  Modal,
  PageHeader,
  QueryState,
  Tabs,
  useToast,
} from "@/components/admin/ui";
import { AdminForm, FormTextarea, TitleSlugFields } from "@/components/admin/form-fields";
import { api } from "@/lib/admin/api-client";
import { useAuth } from "@/lib/admin/auth-context";
import { orNull, requiredText, text, type FieldLimits } from "@/lib/admin/form-utils";
import { queryKeys, useDeleteMutation, useListQuery } from "@/lib/admin/queries";
import { FIELD_LIMITS as F } from "@/lib/field-limits";
import { getErrorMessage } from "@/lib/http";

/** Các loại danh mục, khớp với enum CategoryType ở backend. */
const CATEGORY_TYPES = [
  ["article", "Tin tức"],
  ["culture", "Văn hóa"],
  ["guide", "Cẩm nang"],
  ["destination", "Điểm đến"],
  ["food", "Ẩm thực"],
  ["event", "Sự kiện"],
  ["learning", "Góc học tập"],
] as const;

type CategoryType = (typeof CATEGORY_TYPES)[number][0];

interface Category {
  id: string;
  type: CategoryType;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

const ENDPOINT = "/admin/categories";

/** Ô chọn danh mục ở các form đọc từ API công khai — cũng phải tải lại. */
function useInvalidateCategories() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.resource(ENDPOINT) }),
      queryClient.invalidateQueries({ queryKey: ["/categories"] }),
    ]);
}

export default function CategoriesPage() {
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const invalidate = useInvalidateCategories();

  const [active, setActive] = useState<CategoryType>("article");
  const [dialog, setDialog] = useState<{ category: Category | null } | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  // API quản trị chưa lọc theo type, nên lấy hết rồi lọc tại đây. Số danh
  // mục rất ít, và nhờ vậy chuyển tab không phải gọi lại API.
  const query = useListQuery<Category[]>(ENDPOINT, { limit: 50 });
  const remove = useDeleteMutation(ENDPOINT);

  const activeLabel = CATEGORY_TYPES.find(([key]) => key === active)![1];

  const confirmDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting.id, {
      onSuccess: () => {
        showSuccess(`Đã xóa danh mục "${deleting.name}"`);
        setDeleting(null);
        void invalidate();
      },
      onError: (error) => showError(getErrorMessage(error, "Không xóa được")),
    });
  };

  const addButton = (
    <AdminButton onClick={() => setDialog({ category: null })}>
      <Plus size={16} aria-hidden="true" />
      Thêm danh mục
    </AdminButton>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Danh mục"
        description="Mỗi loại nội dung có bộ danh mục riêng. Danh mục dùng để phân loại bài và để lọc ở trang danh sách."
        actions={addButton}
      />

      <Tabs tabs={CATEGORY_TYPES} active={active} onChange={setActive} />

      <QueryState query={query} errorMessage="Không tải được danh mục">
        {({ data }) => {
          const items = data.filter((item) => item.type === active);

          if (items.length === 0) {
            return <AdminEmpty title={`Chưa có danh mục nào cho ${activeLabel}`} action={addButton} />;
          }

          return (
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
                          <IconButton
                            label={`Sửa ${item.name}`}
                            title="Sửa danh mục"
                            onClick={() => setDialog({ category: item })}
                          >
                            <Pencil size={15} aria-hidden="true" />
                          </IconButton>
                          {isAdmin ? (
                            <IconButton
                              label={`Xóa ${item.name}`}
                              title="Xóa danh mục"
                              onClick={() => setDeleting(item)}
                            >
                              <Trash2 size={15} aria-hidden="true" />
                            </IconButton>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }}
      </QueryState>

      {dialog ? (
        <CategoryDialog
          type={active}
          typeLabel={activeLabel}
          category={dialog.category}
          onClose={() => setDialog(null)}
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
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

/** Giới hạn theo lib/field-limits.ts. */
const CATEGORY_LIMITS = {
  name: F.categoryName,
  slug: F.categorySlug,
  description: F.categoryDescription,
} satisfies FieldLimits;

const categorySchema = z.object({
  name: requiredText("Vui lòng nhập tên danh mục", CATEGORY_LIMITS.name),
  slug: text(CATEGORY_LIMITS.slug),
  description: text(CATEGORY_LIMITS.description),
});

type CategoryValues = z.infer<typeof categorySchema>;

function CategoryDialog({
  type,
  typeLabel,
  category,
  onClose,
}: {
  type: CategoryType;
  typeLabel: string;
  category: Category | null;
  onClose: () => void;
}) {
  const { showSuccess, showError } = useToast();
  const invalidate = useInvalidateCategories();

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
    },
  });

  const save = useMutation({
    mutationFn: (values: CategoryValues) => {
      const payload = {
        type,
        name: values.name,
        slug: values.slug || undefined,
        description: orNull(values.description),
      };
      return category
        ? api.patch(`${ENDPOINT}/${category.id}`, payload)
        : api.post(ENDPOINT, payload);
    },
    onSuccess: async () => {
      showSuccess(category ? "Đã lưu danh mục" : "Đã thêm danh mục");
      onClose();
      await invalidate();
    },
    onError: (error) => showError(getErrorMessage(error, "Không lưu được danh mục")),
  });

  return (
    <Modal onClose={onClose} labelledBy="category-dialog-title" className="max-w-[480px]">
      <AdminForm
        form={form}
        idPrefix="category"
        limits={CATEGORY_LIMITS}
        onSubmit={(values) => save.mutate(values)}
        className="flex flex-col gap-5"
      >
        <DialogHeader
          id="category-dialog-title"
          title={category ? "Sửa danh mục" : `Thêm danh mục ${typeLabel}`}
          onClose={onClose}
        />

        <TitleSlugFields
          titleName="name"
          titleLabel="Tên danh mục"
          slugHint="Dùng trong địa chỉ khi lọc. Để trống thì tự sinh từ tên."
          autoSlug={!category}
        />
        <FormTextarea name="description" label="Mô tả" rows={2} />

        <div className="flex justify-end gap-3">
          <AdminButton variant="ghost" onClick={onClose} disabled={save.isPending}>
            Hủy
          </AdminButton>
          <AdminButton type="submit" loading={save.isPending}>
            {category ? "Lưu thay đổi" : "Thêm danh mục"}
          </AdminButton>
        </div>
      </AdminForm>
    </Modal>
  );
}
