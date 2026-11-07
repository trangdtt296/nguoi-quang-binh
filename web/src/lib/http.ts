/**
 * Phần dùng chung khi gọi API từ trình duyệt: địa chỉ API, kiểu lỗi và
 * cách đọc phản hồi. Khu quản trị (cần token) và form công khai (không cần
 * token) đều đi qua đây để lỗi được báo cùng một kiểu.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PageMeta;
}

/** Lỗi có mã, để phần gọi phân biệt được hết phiên với lỗi dữ liệu. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * fetch ném cùng một lỗi cho nhiều nguyên nhân khác nhau — server không
 * chạy, sai địa chỉ, hoặc bị chặn vì khác origin — nên không đoán được
 * chính xác. Nêu cả ba khả năng kèm địa chỉ đang gọi để người dùng tự
 * đối chiếu, thay vì chỉ nói "không kết nối được".
 */
export function networkError(): ApiError {
  return new ApiError(
    0,
    "NETWORK_ERROR",
    `Không gọi được API tại ${API_URL}. Kiểm tra: backend đã chạy chưa, ` +
      `địa chỉ trong NEXT_PUBLIC_API_URL có đúng không, và mở Console của ` +
      `trình duyệt xem có bị chặn vì khác origin (CORS) không.`,
  );
}

/** Đọc phản hồi theo định dạng `{ success, data, meta, error }` của backend. */
export async function parseResponse<T>(
  response: Response,
  fallbackMessage = "Có lỗi xảy ra, vui lòng thử lại",
): Promise<ApiResponse<T>> {
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      response.status,
      payload?.error?.code ?? "UNKNOWN",
      payload?.error?.message ?? fallbackMessage,
      payload?.error?.details,
    );
  }

  return { data: payload?.data as T, meta: payload?.meta as PageMeta | undefined };
}

/** Câu báo lỗi cho người dùng, kèm chi tiết từng trường nếu server có gửi. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback;
  if (!error.details?.length) return error.message;
  return `${error.message}: ${error.details.map((detail) => detail.message).join(", ")}`;
}
