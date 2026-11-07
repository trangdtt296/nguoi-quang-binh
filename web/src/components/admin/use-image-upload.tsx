"use client";

import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./ui";
import { api } from "@/lib/admin/api-client";
import { MEDIA_ENDPOINT, queryKeys } from "@/lib/admin/queries";
import { getErrorMessage } from "@/lib/http";

/** Khớp với giới hạn ở backend (server/src/routes/admin/media.ts). */
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_BYTES = 8 * 1024 * 1024;

type UploadedImage = Awaited<ReturnType<typeof api.upload>>;

function validate(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "Chỉ nhận ảnh JPG, PNG, WebP, GIF hoặc AVIF";
  if (file.size > MAX_BYTES) return "Ảnh quá lớn, tối đa 8 MB";
  return null;
}

/**
 * Chọn ảnh từ máy rồi tải lên ngay, không mở thư viện media.
 *
 * Mở thư viện nghĩa là tải cả danh sách ảnh, chậm và nặng máy khi thư viện
 * lớn — trong khi lúc soạn bài, người dùng gần như luôn dùng ảnh mới. Ảnh
 * tải lên vẫn vào thư viện như thường để dùng lại về sau.
 *
 * Trả về `input` (ô chọn file ẩn, đặt ở đâu cũng được) và `pick()` để mở nó.
 */
export function useImageUpload(onUploaded: (image: UploadedImage, file: File) => void) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { showError } = useToast();
  const queryClient = useQueryClient();

  const upload = useMutation({
    mutationFn: (file: File) => api.upload(file, file.name),
    onSuccess: (image, file) => onUploaded(image, file),
    onError: (error) => showError(getErrorMessage(error, "Không tải được ảnh lên")),
    // Chỉ đánh dấu cũ: trang thư viện mở lần sau sẽ tự tải lại, còn ở đây
    // không có query thư viện nào đang chạy nên không tốn thêm request.
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.resource(MEDIA_ENDPOINT) }),
  });

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={ALLOWED_TYPES.join(",")}
      className="sr-only"
      tabIndex={-1}
      aria-hidden="true"
      onChange={(event) => {
        const file = event.target.files?.[0];
        // Xóa giá trị để chọn lại đúng file đó lần nữa vẫn kích hoạt onChange.
        event.target.value = "";
        if (!file) return;
        const problem = validate(file);
        if (problem) {
          showError(problem);
          return;
        }
        upload.mutate(file);
      }}
    />
  );

  return {
    pick: () => inputRef.current?.click(),
    uploading: upload.isPending,
    input,
  };
}
