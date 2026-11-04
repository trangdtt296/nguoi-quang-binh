"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { Copy, ExternalLink, Loader2, Search, Trash2, Upload } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import {
  AdminButton,
  AdminEmpty,
  AdminError,
  AdminLoading,
  ConfirmDialog,
  Toast,
  useToast,
} from "@/components/admin/ui";
import { api, ApiError, type PageMeta } from "@/lib/admin/api-client";
import { useAuth } from "@/lib/admin/auth-context";
import type { AdminMedia, MediaListResponse } from "@/lib/admin/types";
import { formatDate, formatNumber } from "@/lib/format";

export default function MediaPage() {
  return (
    <AdminShell>
      <MediaContent />
    </AdminShell>
  );
}

function MediaContent() {
  const { isAdmin } = useAuth();
  const { toast, showSuccess, showError, dismiss } = useToast();

  const [items, setItems] = useState<AdminMedia[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [totalBytes, setTotalBytes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [uploading, setUploading] = useState(false);
  // Tải nhiều file thì cho biết đang ở file thứ mấy, nếu không người dùng
  // không biết còn bao lâu nữa và tưởng bị treo.
  const [uploadProgress, setUploadProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [deleting, setDeleting] = useState<AdminMedia | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "24" });
      if (search) params.set("q", search);

      const { data, meta: pageMeta } = await api.get<MediaListResponse>(
        `/admin/media?${params}`,
      );
      setItems(data.items);
      setTotalBytes(Number(data.totalBytes) || 0);
      setMeta(pageMeta ?? null);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Không tải được thư viện ảnh",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const uploadFiles = async (files: FileList) => {
    const list = Array.from(files);
    setUploading(true);
    setUploadProgress({ done: 0, total: list.length });

    let succeeded = 0;
    let lastError = "";

    // Tải lần lượt chứ không song song: gói Cloudinary miễn phí dễ bị chặn
    // khi có quá nhiều request cùng lúc.
    for (const [index, file] of list.entries()) {
      setUploadProgress({ done: index, total: list.length });
      try {
        await api.upload(file, file.name);
        succeeded += 1;
      } catch (caught) {
        lastError =
          caught instanceof ApiError ? caught.message : "Không tải được ảnh lên";
      }
    }

    setUploading(false);
    setUploadProgress(null);

    if (succeeded > 0) {
      showSuccess(`Đã tải lên ${succeeded} ảnh`);
      setPage(1);
      await load();
    }
    if (lastError) showError(lastError);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await api.del(`/admin/media/${deleting.id}`);
      showSuccess("Đã xóa ảnh khỏi thư viện");
      setDeleting(null);
      await load();
    } catch (caught) {
      showError(caught instanceof ApiError ? caught.message : "Không xóa được ảnh");
    } finally {
      setDeletePending(false);
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showSuccess("Đã chép địa chỉ ảnh");
    } catch {
      showError("Trình duyệt không cho chép tự động, bạn copy tay nhé");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold">Thư viện media</h1>
          <p className="mt-1.5 text-[14.5px] text-muted">
            Ảnh dùng chung cho toàn bộ nội dung. Đã dùng{" "}
            <strong className="text-ink">{formatBytes(totalBytes)}</strong>.
          </p>
        </div>

        <label
          className={clsx(
            "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[8px] bg-ink px-4 text-[14.5px] font-semibold text-white transition-colors hover:bg-primary-500",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          {uploading ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <Upload size={16} aria-hidden="true" />
          )}
          {uploading
            ? uploadProgress
              ? `Đang tải ${uploadProgress.done + 1}/${uploadProgress.total}`
              : "Đang tải lên"
            : "Tải ảnh lên"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => {
              const files = event.target.files;
              if (files && files.length > 0) void uploadFiles(files);
              event.target.value = "";
            }}
          />
        </label>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setSearch(keyword.trim());
        }}
        role="search"
        className="max-w-[460px] rounded-[12px] border border-line bg-surface p-4"
      >
        <label htmlFor="media-library-search" className="sr-only">
          Tìm ảnh
        </label>
        <div className="flex min-h-11 items-center gap-2.5 rounded-[8px] border border-line px-3.5 focus-within:border-ink">
          <Search size={16} className="shrink-0 text-muted" aria-hidden="true" />
          <input
            id="media-library-search"
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo tên file hoặc mô tả ảnh"
            className="min-h-10 w-full bg-transparent text-[15px] outline-none"
          />
        </div>
      </form>

      {loading ? (
        <AdminLoading label="Đang tải thư viện" />
      ) : error ? (
        <AdminError message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <AdminEmpty
          title={search ? "Không tìm thấy ảnh nào" : "Thư viện chưa có ảnh"}
          description={
            search
              ? "Thử từ khóa khác."
              : "Bấm Tải ảnh lên để thêm ảnh đầu tiên. Ảnh ở đây dùng lại được cho mọi bài viết."
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((media) => (
              <figure
                key={media.id}
                className="overflow-hidden rounded-[12px] border border-line bg-surface"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.thumbnailUrl ?? media.url}
                  alt={media.altText ?? media.fileName ?? "Ảnh trong thư viện"}
                  className="aspect-[4/3] w-full bg-silver-50 object-cover"
                />
                <figcaption className="p-4">
                  <p className="truncate text-[14px] font-medium" title={media.fileName ?? ""}>
                    {media.fileName ?? "Không tên"}
                  </p>
                  <p className="mt-1 text-[12.5px] text-muted">
                    {media.width && media.height
                      ? `${media.width}×${media.height} · `
                      : ""}
                    {formatBytes(Number(media.sizeBytes) || 0)}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-muted">
                    {formatDate(media.createdAt)}
                    {media.uploadedBy ? ` · ${media.uploadedBy.fullName}` : ""}
                  </p>

                  <div className="mt-3 flex gap-1">
                    <button
                      type="button"
                      onClick={() => copyUrl(media.url)}
                      title="Chép địa chỉ ảnh"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink"
                    >
                      <Copy size={15} aria-hidden="true" />
                      <span className="sr-only">Chép địa chỉ ảnh</span>
                    </button>
                    <a
                      href={media.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Mở ảnh gốc"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink"
                    >
                      <ExternalLink size={15} aria-hidden="true" />
                      <span className="sr-only">Mở ảnh gốc</span>
                    </a>
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => setDeleting(media)}
                        title="Xóa ảnh"
                        className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        <span className="sr-only">Xóa ảnh</span>
                      </button>
                    ) : null}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          {meta && meta.totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-[13.5px] text-muted">
                Trang {meta.page} / {meta.totalPages} · {formatNumber(meta.total)} ảnh
              </p>
              <div className="flex gap-2">
                <AdminButton
                  variant="ghost"
                  disabled={meta.page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Trước
                </AdminButton>
                <AdminButton
                  variant="ghost"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Sau
                </AdminButton>
              </div>
            </div>
          ) : null}
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa ảnh này khỏi thư viện?"
        description={
          `"${deleting?.fileName ?? "Ảnh"}" sẽ bị xóa khỏi Cloudinary và không khôi phục được. ` +
          "Bài viết nào đang dùng ảnh này sẽ bị mất ảnh."
        }
        confirmLabel="Xóa vĩnh viễn"
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

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
