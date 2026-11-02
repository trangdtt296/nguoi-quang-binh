import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../utils/api";

type Source = "body" | "query" | "params";

/**
 * Validate dữ liệu vào bằng Zod và ghi đè bằng dữ liệu đã chuẩn hóa, nên
 * phần xử lý phía sau luôn nhận đúng kiểu đã khai báo.
 */
export function validate(schema: ZodSchema, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      if (source === "body") req.body = parsed;
      else Object.assign(req[source], parsed);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          ApiError.badRequest(
            "Dữ liệu gửi lên không hợp lệ",
            error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          ),
        );
        return;
      }
      next(error);
    }
  };
}
