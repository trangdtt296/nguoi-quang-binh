"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  AdminButton,
  AdminEmpty,
  AdminError,
  AdminLoading,
  ConfirmDialog,
  Toast,
  inputClass,
  useToast,
} from "./ui";
import { api, ApiError, type PageMeta } from "@/lib/admin/api-client";
import { useAuth } from "@/lib/admin/auth-context";

/** Mọi bản ghi quản trị đều có id; phần còn lại tùy từng loại nội dung. */
export interface ResourceRecord {
  id: string;
  [key: string]: unknown;
}

export interface Column<T> {
  header: string;
  /** Nội dung ô. Trả về chuỗi hoặc JSX đều được. */
  render: (item: T) => ReactNode;
  /** Ô đầu tiên được bọc trong liên kết tới trang sửa. */
  primary?: boolean;
}

export interface ListFilter {
  /** Tên tham số gửi lên API. */
  param: string;
  label: string;
  options: { label: string; value: string }[];
}

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
  basePath,
  columns,
  filters = [],
  searchPlaceholder = "Tìm kiếm",
  createLabel = "Thêm mới",
  getLabel,
  emptyTitle = "Chưa có nội dung nào",
  pageSize = 20,
}: {
  title: string;
  description?: string;
  /** Đường dẫn API, ví dụ "/admin/destinations". */
  endpoint: string;
  /** Đường dẫn trang, ví dụ "/admin/destinations". */
  basePath: string;
  columns: Column<T>[];
  filters?: ListFilter[];
  searchPlaceholder?: string;
  createLabel?: string;
  /** Tên bản ghi, dùng trong thông báo và hộp xác nhận. */
  getLabel: (item: T) => string;
  emptyTitle?: string;
  pageSize?: number;
}) {
  const { isAdmin } = useAuth();
  const { toast, showSuccess, showError, dismiss } = useToast();

  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const [deleting, setDeleting] = useState<T | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      if (search) params.set("q", search);
      for (const [key, value] of Object.entries(filterValues)) {
        if (value) params.set(key, value);
      }

      const { data, meta: pageMeta } = await api.get<T[]>(`${endpoint}?${params}`);
      setItems(data);
      setMeta(pageMeta ?? null);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Không tải được danh sách",
      );
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, pageSize, search, filterValues]);

  useEffect(() => {
    void load();
  }, [load]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await api.del(`${endpoint}/${deleting.id}`);
      showSuccess(`Đã chuyển "${getLabel(deleting)}" vào thùng rác`);
      setDeleting(null);
      await load();
    } catch (caught) {
      showError(caught instanceof ApiError ? caught.message : "Không xóa được");
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold">{title}</h1>
          {description ? (
            <p className="mt-1.5 max-w-[70ch] text-[14.5px] text-muted">{description}</p>
          ) : null}
        </div>
        <Link
          href={`${basePath}/new`}
          className="inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-ink px-4 text-[14.5px] font-semibold text-white transition-colors hover:bg-primary-500"
        >
          <Plus size={16} aria-hidden="true" />
          {createLabel}
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-[12px] border border-line bg-surface p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch(keyword.trim());
          }}
          className="min-w-[220px] flex-[2_1_260px]"
          role="search"
        >
          <label htmlFor="resource-search" className="sr-only">
            {searchPlaceholder}
          </label>
          <div className="flex min-h-11 items-center gap-2.5 rounded-[8px] border border-line px-3.5 focus-within:border-ink">
            <Search size={16} className="shrink-0 text-muted" aria-hidden="true" />
            <input
              id="resource-search"
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={searchPlaceholder}
              className="min-h-10 w-full bg-transparent text-[15px] outline-none"
            />
          </div>
        </form>

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
                setFilterValues((current) => ({
                  ...current,
                  [filter.param]: event.target.value,
                }));
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

      {loading ? (
        <AdminLoading />
      ) : error ? (
        <AdminError message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <AdminEmpty
          title={emptyTitle}
          description="Thử bỏ bớt bộ lọc, hoặc thêm nội dung mới."
          action={
            <Link
              href={`${basePath}/new`}
              className="inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-ink px-4 text-[14.5px] font-semibold text-white"
            >
              <Plus size={16} aria-hidden="true" />
              {createLabel}
            </Link>
          }
        />
      ) : (
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
                            href={`${basePath}/${item.id}/edit`}
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
                        <Link
                          href={`${basePath}/${item.id}/edit`}
                          title="Sửa"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink"
                        >
                          <Pencil size={15} aria-hidden="true" />
                          <span className="sr-only">Sửa {getLabel(item)}</span>
                        </Link>
                        {isAdmin ? (
                          <button
                            type="button"
                            onClick={() => setDeleting(item)}
                            title="Chuyển vào thùng rác"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink"
                          >
                            <Trash2 size={15} aria-hidden="true" />
                            <span className="sr-only">Xóa {getLabel(item)}</span>
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-4 py-3">
              <p className="text-[13.5px] text-muted">
                Trang {meta.page} / {meta.totalPages} · {meta.total} mục
              </p>
              <div className="flex gap-2">
                <AdminButton
                  variant="ghost"
                  disabled={meta.page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  <ChevronLeft size={15} aria-hidden="true" />
                  Trước
                </AdminButton>
                <AdminButton
                  variant="ghost"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Sau
                  <ChevronRight size={15} aria-hidden="true" />
                </AdminButton>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Chuyển vào thùng rác?"
        description={
          deleting
            ? `"${getLabel(deleting)}" sẽ biến khỏi website nhưng vẫn khôi phục được từ mục Thùng rác.`
            : ""
        }
        confirmLabel="Chuyển vào thùng rác"
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
