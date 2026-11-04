/**
 * Gọi API công khai từ phía server.
 *
 * Khác với lớp gọi API của khu quản trị: ở đây không cần token, và chạy
 * trong Server Component nên dùng được biến môi trường không có tiền tố
 * NEXT_PUBLIC_.
 */

const API_URL =
  process.env.API_URL_INTERNAL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api/v1";

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResult<T> {
  data: T;
  meta?: ApiMeta;
}

/**
 * Lấy dữ liệu từ API.
 *
 * Trả về null khi gọi hỏng hoặc không tìm thấy, thay vì ném lỗi. Lý do:
 * một mục nội dung lỗi không nên làm sập cả trang — trang vẫn hiện được
 * phần còn lại, và chỗ thiếu hiện trạng thái rỗng.
 */
export async function apiGet<T>(path: string): Promise<ApiResult<T> | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      // Nội dung thay đổi mỗi khi quản trị viên xuất bản, nên không cache.
      // Khi nào lượng truy cập lớn thì đổi sang revalidate theo giây.
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const payload = await response.json();
    if (payload?.success === false) return null;

    return { data: payload.data as T, meta: payload.meta as ApiMeta | undefined };
  } catch {
    // Backend chưa chạy hoặc không kết nối được.
    return null;
  }
}
