"use client";

import { useState } from "react";
import clsx from "clsx";
import { Check, Loader2, Upload } from "lucide-react";
import { AdminButton, AdminEmpty, AdminLoading, DialogHeader, Modal, SearchBox } from "./ui";
import { MEDIA_ENDPOINT, useListQuery, useUploadMedia } from "@/lib/admin/queries";
import type { AdminMedia, MediaListResponse } from "@/lib/admin/types";
import { getErrorMessage } from "@/lib/http";

/**
 * Hộp thoại chọn ảnh.
 *
 * Hai cách dùng trong một chỗ: chọn lại ảnh đã có trong thư viện, hoặc tải
 * ảnh mới lên rồi chọn luôn. Gom vào đây để trình soạn thảo và ô ảnh bìa
 * dùng chung, thay vì mỗi nơi tự làm một kiểu.
 */
export function MediaPicker({
  open,
  onSelect,
  onClose,
}: {
  open: boolean;
  onSelect: (media: AdminMedia) => void;
  onClose: () => void;
}) {
  // Chỉ dựng hộp thoại khi mở, để mỗi lần mở là một lựa chọn mới.
  return open ? <MediaPickerDialog onSelect={onSelect} onClose={onClose} /> : null;
}

function MediaPickerDialog({
  onSelect,
  onClose,
}: {
  onSelect: (media: AdminMedia) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminMedia | null>(null);
  const [uploadError, setUploadError] = useState("");
  // Đổi key để ô tìm kiếm dựng lại, xóa chữ đang gõ.
  const [searchKey, setSearchKey] = useState(0);

  const query = useListQuery<MediaListResponse>(MEDIA_ENDPOINT, { page, limit: 24, q: search });
  const upload = useUploadMedia();

  const items = query.data?.data.items ?? [];
  const meta = query.data?.meta;

  const uploadFile = (file: File) => {
    setUploadError("");
    upload.mutate(
      { files: [file] },
      {
        onSuccess: ({ lastError }) => {
          if (lastError) {
            setUploadError(getErrorMessage(lastError, "Không tải được ảnh lên"));
            return;
          }
          // Ảnh mới nằm đầu trang 1 — quay về đó để người dùng thấy ngay.
          setPage(1);
          setSearch("");
          setSearchKey((current) => current + 1);
        },
      },
    );
  };

  const errorMessage =
    uploadError ||
    (query.isError ? getErrorMessage(query.error, "Không tải được thư viện ảnh") : "");

  return (
    <Modal
      onClose={onClose}
      labelledBy="media-picker-title"
      padded={false}
      className="flex max-h-[88vh] max-w-[900px] flex-col"
    >
      <div className="border-b border-line px-5 py-4">
        <DialogHeader id="media-picker-title" title="Chọn ảnh" onClose={onClose} />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
        <SearchBox
          key={searchKey}
          placeholder="Tìm theo tên file hoặc mô tả ảnh"
          className="min-w-[200px] flex-1"
          onSearch={(keyword) => {
            setPage(1);
            setSearch(keyword);
          }}
        />

        <label
          className={clsx(
            "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[8px] border border-line px-4 text-[14.5px] font-semibold transition-colors hover:border-ink",
            upload.isPending && "pointer-events-none opacity-60",
          )}
        >
          {upload.isPending ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <Upload size={16} aria-hidden="true" />
          )}
          {upload.isPending ? "Đang tải lên" : "Tải ảnh mới"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) uploadFile(file);
              event.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {/*
          Lớp phủ khi đang tải: ảnh lên Cloudinary mất vài giây, không có
          gì báo thì người dùng tưởng bị treo và bấm lại lần nữa.
        */}
        {upload.isPending ? (
          <div
            role="status"
            aria-live="polite"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface/85 backdrop-blur-[2px]"
          >
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            <p className="text-[15px] font-medium">Đang tải ảnh lên</p>
            <p className="max-w-[36ch] text-center text-[13.5px] leading-relaxed text-muted">
              Ảnh lớn có thể mất vài giây. Đừng đóng cửa sổ này.
            </p>
          </div>
        ) : null}

        {errorMessage ? (
          <p
            role="alert"
            className="mb-4 rounded-[8px] border border-line bg-surface-alt px-4 py-3 text-[14px] leading-relaxed"
          >
            {errorMessage}
          </p>
        ) : null}

        {query.isPending ? (
          <AdminLoading label="Đang tải thư viện" />
        ) : items.length === 0 ? (
          <AdminEmpty
            title={search ? "Không tìm thấy ảnh nào" : "Thư viện chưa có ảnh"}
            description={
              search
                ? "Thử từ khóa khác, hoặc tải ảnh mới lên."
                : "Bấm Tải ảnh mới để thêm ảnh đầu tiên."
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((media) => {
              const isSelected = selected?.id === media.id;
              return (
                <button
                  key={media.id}
                  type="button"
                  onClick={() => setSelected(media)}
                  onDoubleClick={() => onSelect(media)}
                  aria-pressed={isSelected}
                  className={clsx(
                    "group relative overflow-hidden rounded-[8px] border-2 text-left transition-colors",
                    isSelected ? "border-ink" : "border-transparent hover:border-silver",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={media.thumbnailUrl ?? media.url}
                    alt={media.altText ?? media.fileName ?? "Ảnh trong thư viện"}
                    className="aspect-[4/3] w-full bg-silver-50 object-cover"
                  />
                  {isSelected ? (
                    <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white">
                      <Check size={15} aria-hidden="true" />
                    </span>
                  ) : null}
                  <span className="block truncate px-2 py-2 text-[12.5px] text-muted">
                    {media.fileName ?? "Không tên"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
        <p className="text-[13.5px] text-muted">
          {meta ? `${meta.total} ảnh trong thư viện` : ""}
          {meta && meta.totalPages > 1 ? ` · Trang ${meta.page}/${meta.totalPages}` : ""}
        </p>

        <div className="flex gap-2">
          {meta && meta.totalPages > 1 ? (
            <>
              <AdminButton
                variant="ghost"
                disabled={meta.page <= 1}
                onClick={() => setPage(meta.page - 1)}
              >
                Trước
              </AdminButton>
              <AdminButton
                variant="ghost"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage(meta.page + 1)}
              >
                Sau
              </AdminButton>
            </>
          ) : null}
          <AdminButton variant="ghost" onClick={onClose}>
            Hủy
          </AdminButton>
          <AdminButton disabled={!selected} onClick={() => selected && onSelect(selected)}>
            Dùng ảnh này
          </AdminButton>
        </div>
      </div>
    </Modal>
  );
}
