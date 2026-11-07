"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import { AdminButton, AdminEmpty, IconButton, QueryState, useToast } from "./ui";
import { MediaPicker } from "./media-picker";
import { api } from "@/lib/admin/api-client";
import type { AdminMedia } from "@/lib/admin/types";
import { swap } from "@/lib/array";
import { getErrorMessage } from "@/lib/http";

/** Ảnh trong album — API chỉ trả những trường cần để hiện lưới. */
type AlbumPhoto = Pick<AdminMedia, "id" | "url" | "thumbnailUrl" | "altText" | "fileName">;

/**
 * Chọn và sắp xếp ảnh trong album.
 *
 * Mỗi thay đổi lưu ngay lên server bằng cách gửi lại cả danh sách. Album
 * thường vài chục ảnh nên gửi cả danh sách rẻ hơn là theo dõi từng thao tác
 * thêm, bớt, đổi chỗ.
 */
export function AlbumPhotos({ albumId }: { albumId: string }) {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const [pickerOpen, setPickerOpen] = useState(false);

  const queryKey = ["/admin/albums", albumId, "items"];
  const query = useQuery({
    queryKey,
    queryFn: async () => (await api.get<AlbumPhoto[]>(`/admin/albums/${albumId}/items`)).data,
  });

  const persist = useMutation({
    mutationFn: ({ photos }: { photos: AlbumPhoto[]; message: string }) =>
      api.patch(`/admin/albums/${albumId}/items`, { mediaIds: photos.map((photo) => photo.id) }),
    // Đổi ngay trên giao diện; hỏng thì trả về như cũ để không ai tưởng đã lưu.
    onMutate: async ({ photos }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<AlbumPhoto[]>(queryKey);
      queryClient.setQueryData(queryKey, photos);
      return { previous };
    },
    onSuccess: (_data, { message }) => showSuccess(message),
    onError: (error, _variables, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      showError(getErrorMessage(error, "Không lưu được album"));
    },
  });

  const photos = query.data ?? [];
  const save = (next: AlbumPhoto[], message: string) => persist.mutate({ photos: next, message });

  const addPhotoButton = (
    <AdminButton onClick={() => setPickerOpen(true)} disabled={persist.isPending}>
      <ImagePlus size={16} aria-hidden="true" />
      Thêm ảnh
    </AdminButton>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold">Ảnh trong album</h2>
          <p className="mt-1 max-w-[70ch] text-[14px] leading-relaxed text-muted">
            Thứ tự ở đây là thứ tự người xem lật ảnh trên website. Mọi thay đổi được lưu
            ngay.
          </p>
        </div>
        {addPhotoButton}
      </div>

      <QueryState query={query} loadingLabel="Đang tải ảnh" errorMessage="Không tải được ảnh của album">
        {(items) =>
          items.length === 0 ? (
            <AdminEmpty
              title="Album chưa có ảnh nào"
              description="Chọn ảnh từ thư viện, hoặc tải ảnh mới lên ngay trong hộp chọn."
              action={addPhotoButton}
            />
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
              {items.map((photo, index) => (
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
                      <IconButton
                        label={`Chuyển ảnh ${index + 1} lên trước`}
                        title="Chuyển lên trước"
                        size="sm"
                        disabled={index === 0 || persist.isPending}
                        onClick={() => save(swap(items, index, index - 1), "Đã lưu thứ tự ảnh")}
                      >
                        <ArrowLeft size={14} aria-hidden="true" />
                      </IconButton>
                      <IconButton
                        label={`Chuyển ảnh ${index + 1} xuống sau`}
                        title="Chuyển xuống sau"
                        size="sm"
                        disabled={index === items.length - 1 || persist.isPending}
                        onClick={() => save(swap(items, index, index + 1), "Đã lưu thứ tự ảnh")}
                      >
                        <ArrowRight size={14} aria-hidden="true" />
                      </IconButton>
                      <IconButton
                        label={`Bỏ ảnh ${index + 1} khỏi album`}
                        title="Bỏ khỏi album"
                        size="sm"
                        disabled={persist.isPending}
                        onClick={() =>
                          save(
                            items.filter((item) => item.id !== photo.id),
                            "Đã bỏ ảnh khỏi album",
                          )
                        }
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </IconButton>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )
        }
      </QueryState>

      <p className="text-[13px] text-muted">Bỏ ảnh khỏi album không xóa ảnh khỏi thư viện media.</p>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media) => {
          setPickerOpen(false);
          if (photos.some((photo) => photo.id === media.id)) {
            showError("Ảnh này đã có trong album");
            return;
          }
          save([...photos, media], "Đã thêm ảnh vào album");
        }}
      />
    </div>
  );
}
