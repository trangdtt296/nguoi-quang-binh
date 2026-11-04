"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import {
  AdminButton,
  AdminEmpty,
  AdminError,
  AdminLoading,
  Toast,
  useToast,
} from "./ui";
import { MediaPicker } from "./media-picker";
import { api, ApiError } from "@/lib/admin/api-client";
import type { AdminMedia } from "@/lib/admin/types";

/** Ảnh trong album — API chỉ trả những trường cần để hiện lưới. */
type AlbumPhoto = Pick<
  AdminMedia,
  "id" | "url" | "thumbnailUrl" | "altText" | "fileName"
>;

/**
 * Chọn và sắp xếp ảnh trong album.
 *
 * Mỗi thay đổi lưu ngay lên server bằng cách gửi lại cả danh sách. Album
 * thường vài chục ảnh nên gửi cả danh sách rẻ hơn là theo dõi từng thao tác
 * thêm, bớt, đổi chỗ.
 */
export function AlbumPhotos({ albumId }: { albumId: string }) {
  const { toast, showSuccess, showError, dismiss } = useToast();

  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<AlbumPhoto[]>(`/admin/albums/${albumId}/items`);
      setPhotos(data);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Không tải được ảnh của album",
      );
    } finally {
      setLoading(false);
    }
  }, [albumId]);

  useEffect(() => {
    void load();
  }, [load]);

  const persist = async (next: AlbumPhoto[], message: string) => {
    const previous = photos;
    setPhotos(next);
    setSaving(true);
    try {
      await api.patch(`/admin/albums/${albumId}/items`, {
        mediaIds: next.map((photo) => photo.id),
      });
      showSuccess(message);
    } catch (caught) {
      // Trả giao diện về trạng thái cũ để người dùng không tưởng đã lưu được.
      setPhotos(previous);
      showError(caught instanceof ApiError ? caught.message : "Không lưu được album");
    } finally {
      setSaving(false);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    void persist(next, "Đã lưu thứ tự ảnh");
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold">Ảnh trong album</h2>
          <p className="mt-1 max-w-[70ch] text-[14px] leading-relaxed text-muted">
            Thứ tự ở đây là thứ tự người xem lật ảnh trên website. Mọi thay đổi được
            lưu ngay.
          </p>
        </div>
        <AdminButton onClick={() => setPickerOpen(true)} disabled={saving}>
          <ImagePlus size={16} aria-hidden="true" />
          Thêm ảnh
        </AdminButton>
      </div>

      {loading ? (
        <AdminLoading label="Đang tải ảnh" />
      ) : error ? (
        <AdminError message={error} onRetry={load} />
      ) : photos.length === 0 ? (
        <AdminEmpty
          title="Album chưa có ảnh nào"
          description="Chọn ảnh từ thư viện, hoặc tải ảnh mới lên ngay trong hộp chọn."
          action={
            <AdminButton onClick={() => setPickerOpen(true)}>
              <ImagePlus size={16} aria-hidden="true" />
              Thêm ảnh
            </AdminButton>
          }
        />
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
          {photos.map((photo, index) => (
            <li
              key={photo.id}
              className="overflow-hidden rounded-[8px] border border-line bg-surface"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbnailUrl || photo.url}
                alt={photo.altText || photo.fileName || `Ảnh ${index + 1}`}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                <span className="text-[12.5px] text-muted">{index + 1}</span>
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || saving}
                    title="Chuyển lên trước"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink disabled:opacity-40"
                  >
                    <ArrowLeft size={14} aria-hidden="true" />
                    <span className="sr-only">Chuyển ảnh {index + 1} lên trước</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === photos.length - 1 || saving}
                    title="Chuyển xuống sau"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink disabled:opacity-40"
                  >
                    <ArrowRight size={14} aria-hidden="true" />
                    <span className="sr-only">Chuyển ảnh {index + 1} xuống sau</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void persist(
                        photos.filter((item) => item.id !== photo.id),
                        "Đã bỏ ảnh khỏi album",
                      )
                    }
                    disabled={saving}
                    title="Bỏ khỏi album"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink disabled:opacity-40"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    <span className="sr-only">Bỏ ảnh {index + 1} khỏi album</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[13px] text-muted">
        Bỏ ảnh khỏi album không xóa ảnh khỏi thư viện media.
      </p>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media) => {
          setPickerOpen(false);
          if (photos.some((photo) => photo.id === media.id)) {
            showError("Ảnh này đã có trong album");
            return;
          }
          void persist([...photos, media], "Đã thêm ảnh vào album");
        }}
      />

      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onDismiss={dismiss} />
      ) : null}
    </div>
  );
}
