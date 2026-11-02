import type { Response } from "express";

/**
 * Khuôn phản hồi chung cho toàn bộ API.
 * Thành công: { success: true, data, meta? }
 * Lỗi:        { success: false, error: { code, message, details? } }
 */

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendData<T>(res: Response, data: T, meta?: PageMeta, status = 200) {
  return res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });
}

/** Lỗi có mã và mã HTTP đi kèm, để errorHandler trả về đúng khuôn. */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, "BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Bạn cần đăng nhập để thực hiện thao tác này") {
    return new ApiError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "Tài khoản của bạn không có quyền thực hiện thao tác này") {
    return new ApiError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Không tìm thấy nội dung") {
    return new ApiError(404, "NOT_FOUND", message);
  }

  static conflict(message: string) {
    return new ApiError(409, "CONFLICT", message);
  }
}

/** Đọc tham số phân trang từ query string, chặn giá trị vô lý. */
export function readPaging(query: Record<string, unknown>, defaultLimit = 12) {
  const rawPage = Number(query.page);
  const rawLimit = Number(query.limit);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), 50)
      : defaultLimit;

  return { page, limit, skip: (page - 1) * limit };
}

export function buildMeta(total: number, page: number, limit: number): PageMeta {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/**
 * BigInt (cột sizeBytes, id của page_views) không serialize được bằng
 * JSON.stringify mặc định, nên chuyển sang chuỗi trước khi trả về.
 */
export function serialize<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, val) => (typeof val === "bigint" ? val.toString() : val)),
  );
}
