"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import {
  AdminButton,
  AdminEmpty,
  AdminError,
  AdminLoading,
  ConfirmDialog,
  StatusBadge,
  Toast,
  inputClass,
  useToast,
} from "@/components/admin/ui";
import { api, ApiError, type PageMeta } from "@/lib/admin/api-client";
import { useAuth } from "@/lib/admin/auth-context";
import {
  ARTICLE_TYPE_LABELS,
  type AdminArticle,
  type ArticleType,
  type ContentStatus,
} from "@/lib/admin/types";
import { formatDate, formatNumber } from "@/lib/format";

export default function ArticlesPage() {
  return (
    <AdminShell>
      <ArticlesContent />
    </AdminShell>
  );
}

const STATUS_OPTIONS: { label: string; value: ContentStatus | "" }[] = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Đã xuất bản", value: "published" },
  { label: "Bản nháp", value: "draft" },
  { label: "Lên lịch", value: "scheduled" },
  { label: "Lưu trữ", value: "archived" },
];

const TYPE_OPTIONS: { label: string; value: ArticleType | "" }[] = [
  { label: "Tất cả loại bài", value: "" },
  { label: "Tin tức", value: "news" },
  { label: "Văn hóa", value: "culture" },
  { label: "Cẩm nang", value: "guide" },
];

function ArticlesContent() {
  const { isAdmin } = useAuth();
  const { toast, showSuccess, showError, dismiss } = useToast();

  const [items, setItems] = useState<AdminArticle[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContentStatus | "">("");
  const [type, setType] = useState<ArticleType | "">("");
  const [page, setPage] = useState(1);

  const [deleting, setDeleting] = useState<AdminArticle | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("q", search);
      if (status) params.set("status", status);

      const { data, meta: pageMeta } = await api.get<AdminArticle[]>(
        `/admin/articles?${params}`,
      );

      // API chưa lọc theo loại bài, nên lọc ở đây. Khi nào danh sách dài
      // thì chuyển việc lọc này xuống backend.
      setItems(type ? data.filter((item) => item.type === type) : data);
      setMeta(pageMeta ?? null);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Không tải được danh sách",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status, type]);

  useEffect(() => {
    void load();
  }, [load]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await api.del(`/admin/articles/${deleting.id}`);
      showSuccess(`Đã chuyển "${deleting.title}" vào thùng rác`);
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
          <h1 className="text-[26px] font-bold">Bài viết</h1>
          <p className="mt-1.5 text-[14.5px] text-muted">
            Tin tức, văn hóa và cẩm nang. Bài học của Góc học tập quản lý ở mục
            Khóa học.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-ink px-4 text-[14.5px] font-semibold text-white transition-colors hover:bg-primary-500"
        >
          <Plus size={16} aria-hidden="true" />
          Soạn bài mới
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
          <label htmlFor="article-search" className="sr-only">
            Tìm bài viết
          </label>
          <div className="flex min-h-11 items-center gap-2.5 rounded-[8px] border border-line px-3.5 focus-within:border-ink">
            <Search size={16} className="shrink-0 text-muted" aria-hidden="true" />
            <input
              id="article-search"
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tiêu đề"
              className="min-h-10 w-full bg-transparent text-[15px] outline-none"
            />
          </div>
        </form>

        <div className="min-w-[160px] flex-1">
          <label htmlFor="article-type" className="sr-only">
            Lọc theo loại bài
          </label>
          <select
            id="article-type"
            value={type}
            onChange={(event) => {
              setPage(1);
              setType(event.target.value as ArticleType | "");
            }}
            className={inputClass}
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[160px] flex-1">
          <label htmlFor="article-status" className="sr-only">
            Lọc theo trạng thái
          </label>
          <select
            id="article-status"
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value as ContentStatus | "");
            }}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <AdminLoading />
      ) : error ? (
        <AdminError message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <AdminEmpty
          title="Chưa có bài viết nào khớp"
          description="Thử bỏ bớt bộ lọc, hoặc soạn bài mới."
          action={
            <Link
              href="/admin/articles/new"
              className="inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-ink px-4 text-[14.5px] font-semibold text-white"
            >
              <Plus size={16} aria-hidden="true" />
              Soạn bài mới
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="bg-surface-alt">
                  {["Tiêu đề", "Loại", "Chuyên mục", "Trạng thái", "Ngày đăng", "Xem", ""].map(
                    (heading, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left text-[12.5px] font-semibold uppercase tracking-[0.05em] text-muted"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-line">
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/admin/articles/${item.id}/edit`}
                        className="text-[14.5px] font-medium hover:underline"
                      >
                        {item.title}
                      </Link>
                      {item.isFeatured ? (
                        <span className="ml-2 text-[12px] text-muted">· Nổi bật</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3.5 text-[14px] text-muted">
                      {ARTICLE_TYPE_LABELS[item.type]}
                    </td>
                    <td className="px-4 py-3.5 text-[14px] text-muted">
                      {item.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3.5 text-[14px] text-muted">
                      {item.publishedAt ? formatDate(item.publishedAt) : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-[14px] text-muted">
                      {item.viewCount ? formatNumber(item.viewCount) : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/admin/articles/${item.id}/edit`}
                          title="Sửa bài"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink"
                        >
                          <Pencil size={15} aria-hidden="true" />
                          <span className="sr-only">Sửa {item.title}</span>
                        </Link>
                        {isAdmin ? (
                          <button
                            type="button"
                            onClick={() => setDeleting(item)}
                            title="Chuyển vào thùng rác"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink"
                          >
                            <Trash2 size={15} aria-hidden="true" />
                            <span className="sr-only">Xóa {item.title}</span>
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
                Trang {meta.page} / {meta.totalPages} · {formatNumber(meta.total)} bài
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
        title="Chuyển bài này vào thùng rác?"
        description={`"${deleting?.title}" sẽ biến khỏi website nhưng vẫn khôi phục được từ mục Thùng rác.`}
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
