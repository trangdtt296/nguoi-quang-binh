"use client";

import { useState } from "react";
import clsx from "clsx";
import { Copy, ExternalLink, Loader2, Trash2, Upload } from "lucide-react";
import {
  AdminEmpty,
  ConfirmDialog,
  IconButton,
  PageHeader,
  Pager,
  QueryState,
  SearchBox,
  useToast,
} from "@/components/admin/ui";
import { useAuth } from "@/lib/admin/auth-context";
import {
  MEDIA_ENDPOINT,
  useDeleteMutation,
  useListQuery,
  useUploadMedia,
} from "@/lib/admin/queries";
import type { AdminMedia, MediaListResponse } from "@/lib/admin/types";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/http";

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<AdminMedia | null>(null);
  // Tải nhiều file thì cho biết đang ở file thứ mấy, nếu không người dùng
  // không biết còn bao lâu nữa và tưởng bị treo.
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const query = useListQuery<MediaListResponse>(MEDIA_ENDPOINT, { page, limit: 24, q: search });
  const upload = useUploadMedia();
  const remove = useDeleteMutation(MEDIA_ENDPOINT);

  const totalBytes = Number(query.data?.data.totalBytes) || 0;

  const uploadFiles = (files: File[]) => {
    setProgress({ done: 0, total: files.length });
    upload.mutate(
      { files, onProgress: (done) => setProgress({ done, total: files.length }) },
      {
        onSuccess: ({ succeeded, lastError }) => {
          if (succeeded > 0) {
            showSuccess(`Đã tải lên ${succeeded} ảnh`);
            setPage(1);
          }
          if (lastError) showError(getErrorMessage(lastError, "Không tải được ảnh lên"));
        },
        onSettled: () => setProgress(null),
      },
    );
  };

  const confirmDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting.id, {
      onSuccess: () => {
        showSuccess("Đã xóa ảnh khỏi thư viện");
        setDeleting(null);
      },
      onError: (error) => showError(getErrorMessage(error, "Không xóa được ảnh")),
    });
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
      <PageHeader
        title="Thư viện media"
        description={
          <>
            Ảnh dùng chung cho toàn bộ nội dung. Đã dùng{" "}
            <strong className="text-ink">{formatBytes(totalBytes)}</strong>.
          </>
        }
        actions={
          <label
            className={clsx(
              "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[8px] bg-ink px-4 text-[14.5px] font-semibold text-white transition-colors hover:bg-primary-500",
              upload.isPending && "pointer-events-none opacity-60",
            )}
          >
            {upload.isPending ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Upload size={16} aria-hidden="true" />
            )}
            {upload.isPending
              ? progress
                ? `Đang tải ${progress.done + 1}/${progress.total}`
                : "Đang tải lên"
              : "Tải ảnh lên"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                if (files.length > 0) uploadFiles(files);
                event.target.value = "";
              }}
            />
          </label>
        }
      />

      <div className="max-w-[460px] rounded-[12px] border border-line bg-surface p-4">
        <SearchBox
          placeholder="Tìm theo tên file hoặc mô tả ảnh"
          onSearch={(keyword) => {
            setPage(1);
            setSearch(keyword);
          }}
        />
      </div>

      <QueryState query={query} loadingLabel="Đang tải thư viện" errorMessage="Không tải được thư viện ảnh">
        {({ data, meta }) =>
          data.items.length === 0 ? (
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
                {data.items.map((media) => (
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
                        {media.width && media.height ? `${media.width}×${media.height} · ` : ""}
                        {formatBytes(Number(media.sizeBytes) || 0)}
                      </p>
                      <p className="mt-0.5 text-[12.5px] text-muted">
                        {formatDate(media.createdAt)}
                        {media.uploadedBy ? ` · ${media.uploadedBy.fullName}` : ""}
                      </p>

                      <div className="mt-3 flex gap-1">
                        <IconButton label="Chép địa chỉ ảnh" onClick={() => copyUrl(media.url)}>
                          <Copy size={15} aria-hidden="true" />
                        </IconButton>
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
                          <IconButton
                            label="Xóa ảnh"
                            className="ml-auto"
                            onClick={() => setDeleting(media)}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </IconButton>
                        ) : null}
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>

              <Pager meta={meta} unit="ảnh" onPageChange={setPage} />
            </>
          )
        }
      </QueryState>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa ảnh này khỏi thư viện?"
        description={
          `"${deleting?.fileName ?? "Ảnh"}" sẽ bị xóa khỏi Cloudinary và không khôi phục được. ` +
          "Bài viết nào đang dùng ảnh này sẽ bị mất ảnh."
        }
        confirmLabel="Xóa vĩnh viễn"
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
