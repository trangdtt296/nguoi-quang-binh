import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";
import { ApiError } from "../utils/api";

/**
 * Phân quyền theo vai trò.
 *
 *   editor      — đọc tất cả; tạo và sửa nội dung do mình tạo; không xuất
 *                 bản, không xóa
 *   admin       — toàn quyền nội dung, media, banner, danh mục, SEO
 *   super_admin — như admin, thêm quản lý tài khoản và cấu hình website
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };
}

export const requireAdmin = requireRole("admin", "super_admin");
export const requireSuperAdmin = requireRole("super_admin");

/** Editor không được tự xuất bản — phải để admin duyệt. */
export function canPublish(role: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}

/** Editor chỉ được sửa nội dung do chính mình tạo. */
export function canEditContent(
  role: UserRole,
  authorId: string | null | undefined,
  userId: string,
): boolean {
  if (role === "admin" || role === "super_admin") return true;
  return Boolean(authorId) && authorId === userId;
}
