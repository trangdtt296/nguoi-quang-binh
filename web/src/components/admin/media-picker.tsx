"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { Check, Search, Upload, X } from "lucide-react";
import { AdminButton, AdminEmpty, AdminLoading, inputClass } from "./ui";
import { api, ApiError, type PageMeta } from "@/lib/admin/api-client";
import type { AdminMedia, MediaListResponse } from "@/lib/admin/types";

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
  const [items, setItems] = useState<AdminMedia[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<AdminMedia | null>(null);

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
    if (open) void load();
  }, [open, load]);

  // Đóng bằng phím Esc, và khóa cuộn nền khi hộp thoại đang mở.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      await api.upload(file, file.name);
      setPage(1);
      setSearch("");
      setKeyword("");
      await load();
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Không tải được ảnh lên",
      );
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-abyss/70 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-title"
        className="flex max-h-[88vh] w-full max-w-[900px] flex-col rounded-[12px] bg-surface"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 id="media-picker-title" className="text-[18px] font-semibold">
            Chọn ảnh
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-muted hover:bg-primary-50 hover:text-ink"
          >
            <X size={18} aria-hidden="true" />
            <span className="sr-only">Đóng</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSearch(keyword.trim());
            }}
            className="min-w-[200px] flex-1"
            role="search"
          >
            <label htmlFor="media-search" className="sr-only">
              Tìm ảnh
            </label>
            <div className="flex min-h-11 items-center gap-2.5 rounded-[8px] border border-line px-3.5 focus-within:border-ink">
              <Search size={16} className="shrink-0 text-muted" aria-hidden="true" />
              <input
                id="media-search"
                type="search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm theo tên file hoặc mô tả ảnh"
                className="min-h-10 w-full bg-transparent text-[15px] outline-none"
              />
            </div>
          </form>

          <label
            className={clsx(
              "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[8px] border border-line px-4 text-[14.5px] font-semibold transition-colors hover:border-ink",
              uploading && "pointer-events-none opacity-60",
            )}
          >
            <Upload size={16} aria-hidden="true" />
            {uploading ? "Đang tải lên" : "Tải ảnh mới"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
                event.target.value = "";
              }}
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {error ? (
            <p
              role="alert"
              className="mb-4 rounded-[8px] border border-line bg-surface-alt px-4 py-3 text-[14px] leading-relaxed"
            >
              {error}
            </p>
          ) : null}

          {loading ? (
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
              </>
            ) : null}
            <AdminButton variant="ghost" onClick={onClose}>
              Hủy
            </AdminButton>
            <AdminButton
              disabled={!selected}
              onClick={() => selected && onSelect(selected)}
            >
              Dùng ảnh này
            </AdminButton>
          </div>
        </div>
      </div>
    </div>
  );
}
