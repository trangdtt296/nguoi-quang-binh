"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "./api-client";
import type { AdminCategory, AdminDestination } from "./types";

/**
 * Query key luôn bắt đầu bằng đường dẫn API của tài nguyên. Nhờ vậy sau khi
 * sửa, xóa hay khôi phục chỉ cần invalidate theo đường dẫn đó là danh sách,
 * thùng rác và trang chi tiết cùng được tải lại.
 */
export const queryKeys = {
  resource: (endpoint: string) => [endpoint] as const,
  list: (endpoint: string, params: QueryParams = {}) => [endpoint, "list", params] as const,
  detail: (endpoint: string, id: string) => [endpoint, "detail", id] as const,
};

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

/** Dựng chuỗi `?a=1&b=2`, bỏ qua giá trị rỗng. */
export function toQueryString(params: QueryParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

/** Danh sách có phân trang. Giữ dữ liệu trang cũ khi chuyển trang để bảng không nháy. */
export function useListQuery<T>(endpoint: string, params: QueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.list(endpoint, params),
    queryFn: () => api.get<T>(`${endpoint}${toQueryString(params)}`),
    placeholderData: keepPreviousData,
  });
}

export function useDetailQuery<T>(endpoint: string, id: string) {
  return useQuery({
    queryKey: queryKeys.detail(endpoint, id),
    queryFn: async () => (await api.get<T>(`${endpoint}/${id}`)).data,
  });
}

/** Tạo mới khi chưa có `id`, sửa khi đã có. */
export function useSaveMutation<TRecord extends { id: string }>(endpoint: string, id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = id
        ? await api.patch<TRecord>(`${endpoint}/${id}`, payload)
        : await api.post<TRecord>(endpoint, payload);
      return data;
    },
    // Không ghi đè cache bằng phản hồi: API sửa trả về bản ghi không kèm
    // quan hệ (category, author…), nên tải lại cho đủ.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.resource(endpoint) }),
  });
}

export function useDeleteMutation(endpoint: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`${endpoint}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.resource(endpoint) }),
  });
}

/* ---------- Thư viện media ---------- */

export const MEDIA_ENDPOINT = "/admin/media";

/**
 * Tải nhiều ảnh lên, báo tiến độ từng file. Một file hỏng không chặn các
 * file sau; kết quả cho biết bao nhiêu file thành công và lỗi cuối cùng.
 */
export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      files,
      onProgress,
    }: {
      files: File[];
      /** Gọi trước mỗi file với số file đã xong. */
      onProgress?: (done: number) => void;
    }) => {
      let succeeded = 0;
      let lastError: unknown = null;

      // Tải lần lượt chứ không song song: gói Cloudinary miễn phí dễ bị chặn
      // khi có quá nhiều request cùng lúc.
      for (const [index, file] of files.entries()) {
        onProgress?.(index);
        try {
          await api.upload(file, file.name);
          succeeded += 1;
        } catch (error) {
          lastError = error;
        }
      }

      return { succeeded, lastError };
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.resource(MEDIA_ENDPOINT) }),
  });
}

/* ---------- Danh sách phụ cho ô chọn ---------- */

/** Danh mục theo loại. Lỗi thì coi như chưa có danh mục — ô chọn vẫn dùng được. */
export function useCategoryOptions(type: string) {
  const { data } = useQuery({
    queryKey: ["/categories", type],
    queryFn: async () => (await api.get<AdminCategory[]>(`/categories?type=${type}`)).data,
    staleTime: 5 * 60_000,
  });
  return data ?? [];
}

/** Điểm đến để gắn sự kiện vào một địa điểm có sẵn. */
export function useDestinationOptions() {
  const { data } = useListQuery<AdminDestination[]>("/admin/destinations", { limit: 100 });
  return data?.data ?? [];
}
