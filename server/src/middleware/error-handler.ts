import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { env } from "../config/env";
import { ApiError } from "../utils/api";
import { logger } from "../config/logger";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Không có endpoint ${req.method} ${req.path}`,
    },
  });
}

/**
 * Bắt lỗi tập trung. Mọi lỗi đều ra cùng một khuôn phản hồi, và chi tiết kỹ
 * thuật chỉ lộ ra ở môi trường dev — ở production chỉ ghi vào log.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: vi phạm ràng buộc duy nhất (slug trùng, email trùng...)
    if (error.code === "P2002") {
      const fields = (error.meta?.target as string[] | undefined)?.join(", ") ?? "dữ liệu";
      res.status(409).json({
        success: false,
        error: { code: "DUPLICATE", message: `Đã tồn tại bản ghi khác có ${fields}` },
      });
      return;
    }
    // P2025: không tìm thấy bản ghi cần sửa hoặc xóa
    if (error.code === "P2025") {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Không tìm thấy nội dung" },
      });
      return;
    }
  }

  logger.error({ err: error }, "Lỗi không lường trước");

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Có lỗi xảy ra phía máy chủ",
      ...(env.isProduction
        ? {}
        : { details: error instanceof Error ? error.message : String(error) }),
    },
  });
}
