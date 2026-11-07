"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  AdminEmpty,
  ButtonLink,
  ConfirmDialog,
  IconButton,
  IconLink,
  PageHeader,
  Pager,
  QueryState,
  STATUS_LABELS,
  SearchBox,
  StatusBadge,
  inputClass,
  useToast,
} from "./ui";
import { formatDate, formatNumber } from "@/lib/format";
import { useAuth } from "@/lib/admin/auth-context";
import { useDeleteMutation, useListQuery } from "@/lib/admin/queries";
import { getErrorMessage } from "@/lib/http";

/**
 * Khung này chỉ cần biết bản ghi có `id` để dựng liên kết và gọi API xóa.
 * Các trường khác do từng màn hình tự đọc trong hàm render của cột, nên
 * không ràng buộc gì thêm — ràng buộc thừa chỉ làm interface cụ thể như
 * AdminDestination không khớp được.
 */
export interface ResourceRecord {
  id: string;
}

export interface Column<T> {
  header: string;
  /** Nội dung ô. Trả về chuỗi hoặc JSX đều được. */
  render: (item: T) => ReactNode;
  /** Ô được bọc trong liên kết tới trang sửa. */
  primary?: boolean;
}

export interface ListFilter<T = unknown> {
  /** Tên tham số gửi lên API. */
  param: string;
  label: string;
  options: { label: string; value: string }[];
  /**
   * Lọc ngay trên trang hiện tại thay vì gửi lên API — dùng khi API chưa
   * hỗ trợ tham số này. Khi danh sách dài thì nên chuyển xuống backend.
   */
  match?: (item: T, value: string) => boolean;
}

export const statusFilter: ListFilter = {
  param: "status",
  label: "Tất cả trạng thái",
  options: (["published", "draft", "scheduled", "archived"] as const).map((status) => ({
    label: STATUS_LABELS[status],
    value: status,
  })),
};

export function categoryFilter(
  label: string,
  categories: readonly { name: string; slug: string }[],
): ListFilter {
  return {
    param: "category",
    label,
    options: categories.map((category) => ({ label: category.name, value: category.slug })),
  };
}

/** Chữ phụ trong ô bảng; hiện "—" khi không có giá trị. */
export function Muted({ children }: { children: ReactNode }) {
  const empty = children === null || children === undefined || children === "";
  return <span className="text-muted">{empty ? "—" : children}</span>;
}

/* ---------- Cột dùng chung ---------- */

export const statusColumn: Column<{ status: string }> = {
  header: "Trạng thái",
  render: (item) => <StatusBadge status={item.status} />,
};

export const publishedAtColumn: Column<{ publishedAt: string | null }> = {
  header: "Ngày đăng",
  render: (item) => <Muted>{item.publishedAt ? formatDate(item.publishedAt) : null}</Muted>,
};

export const viewCountColumn: Column<{ viewCount: number }> = {
  header: "Lượt xem",
  render: (item) => <Muted>{item.viewCount ? formatNumber(item.viewCount) : null}</Muted>,
};

export const categoryColumn = (header: string): Column<{ category: { name: string } | null }> => ({
  header,
  render: (item) => <Muted>{item.category?.name}</Muted>,
});

/**
 * Khung danh sách cho các màn hình quản trị.
 *
 * Mọi loại nội dung đều có cùng một luồng: tìm kiếm, lọc, phân trang, sửa,
 * xóa mềm. Gom vào đây để mỗi màn hình chỉ cần khai báo cột và bộ lọc —
 * sửa bố cục hay sửa lỗi một lần là tất cả đổi theo.
 */
export function ResourceList<T extends ResourceRecord>({
  title,
  description,
  endpoint,
  columns,
  filters = [],
  searchPlaceholder = "Tìm kiếm",
  createLabel = "Thêm mới",
  getLabel,
  emptyTitle = "Chưa có nội dung nào",
  unit = "mục",
  pageSize = 20,
}: {
  title: string;
  description?: string;
  /** Đường dẫn API, đồng thời là đường dẫn trang, ví dụ "/admin/destinations". */
  endpoint: string;
  columns: Column<T>[];
  filters?: ListFilter<T>[];
  searchPlaceholder?: string;
  createLabel?: string;
  /** Tên bản ghi, dùng trong thông báo và hộp xác nhận. */
  getLabel: (item: T) => string;
  emptyTitle?: string;
  /** Đơn vị đếm ở thanh phân trang. */
  unit?: string;
  pageSize?: number;
}) {
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<T | null>(null);

  const serverFilters = Object.fromEntries(
    filters.filter((filter) => !filter.match).map((filter) => [filter.param, filterValues[filter.param]]),
  );
  const query = useListQuery<T[]>(endpoint, {
    page,
    limit: pageSize,
    q: search,
    ...serverFilters,
  });
  const remove = useDeleteMutation(endpoint);

  const applyClientFilters = (items: T[]) =>
    filters.reduce(
      (current, filter) => {
        const value = filterValues[filter.param];
        return filter.match && value
          ? current.filter((item) => filter.match!(item, value))
          : current;
      },
      items,
    );

  const confirmDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting.id, {
      onSuccess: () => {
        showSuccess(`Đã chuyển "${getLabel(deleting)}" vào thùng rác`);
        setDeleting(null);
      },
      onError: (error) => showError(getErrorMessage(error, "Không xóa được")),
    });
  };

  const createLink = (
    <ButtonLink href={`${endpoint}/new`}>
      <Plus size={16} aria-hidden="true" />
      {createLabel}
    </ButtonLink>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} description={description} actions={createLink} />

      <div className="flex flex-wrap items-end gap-3 rounded-[12px] border border-line bg-surface p-4">
        <SearchBox
          placeholder={searchPlaceholder}
          className="min-w-[220px] flex-[2_1_260px]"
          onSearch={(keyword) => {
            setPage(1);
            setSearch(keyword);
          }}
        />

        {filters.map((filter) => (
          <div key={filter.param} className="min-w-[160px] flex-1">
            <label htmlFor={`filter-${filter.param}`} className="sr-only">
              {filter.label}
            </label>
            <select
              id={`filter-${filter.param}`}
              value={filterValues[filter.param] ?? ""}
              onChange={(event) => {
                setPage(1);
                setFilterValues((current) => ({ ...current, [filter.param]: event.target.value }));
              }}
              className={inputClass}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <QueryState query={query} errorMessage="Không tải được danh sách">
        {({ data, meta }) => {
          const items = applyClientFilters(data);

          if (items.length === 0) {
            return (
              <AdminEmpty
                title={emptyTitle}
                description="Thử bỏ bớt bộ lọc, hoặc thêm nội dung mới."
                action={createLink}
              />
            );
          }

          return (
            <div className="overflow-hidden rounded-[12px] border border-line bg-surface">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse">
                  <thead>
                    <tr className="bg-surface-alt">
                      {columns.map((column) => (
                        <th
                          key={column.header}
                          className="px-4 py-3 text-left text-[12.5px] font-semibold uppercase tracking-[0.05em] text-muted"
                        >
                          {column.header}
                        </th>
                      ))}
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t border-line">
                        {columns.map((column) => (
                          <td key={column.header} className="px-4 py-3.5 text-[14px]">
                            {column.primary ? (
                              <Link
                                href={`${endpoint}/${item.id}/edit`}
                                className="text-[14.5px] font-medium hover:underline"
                              >
                                {column.render(item)}
                              </Link>
                            ) : (
                              column.render(item)
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-3.5">
                          <div className="flex justify-end gap-1">
                            <IconLink
                              href={`${endpoint}/${item.id}/edit`}
                              label={`Sửa ${getLabel(item)}`}
                              title="Sửa"
                            >
                              <Pencil size={15} aria-hidden="true" />
                            </IconLink>
                            {isAdmin ? (
                              <IconButton
                                label={`Xóa ${getLabel(item)}`}
                                title="Chuyển vào thùng rác"
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

              <Pager
                meta={meta}
                unit={unit}
                onPageChange={setPage}
                className="border-t border-line px-4 py-3"
              />
            </div>
          );
        }}
      </QueryState>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Chuyển vào thùng rác?"
        description={
          deleting
            ? `"${getLabel(deleting)}" sẽ biến khỏi website nhưng vẫn khôi phục được từ mục Thùng rác.`
            : ""
        }
        confirmLabel="Chuyển vào thùng rác"
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
