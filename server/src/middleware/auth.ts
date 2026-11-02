import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
}

export function signAccessToken(user: { id: string; role: UserRole }) {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  } as jwt.SignOptions);
}

export function signRefreshToken(user: { id: string }) {
  return jwt.sign({ sub: user.id }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
  } as jwt.SignOptions);
}

/**
 * Bắt buộc đăng nhập.
 *
 * Mỗi request đều đọc lại user từ database thay vì tin hoàn toàn vào token:
 * nếu tài khoản bị khóa hoặc đổi vai trò, thay đổi có hiệu lực ngay, không
 * phải đợi token hết hạn.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw ApiError.unauthorized();

    const token = header.slice(7);
    let payload: AccessTokenPayload;
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    } catch {
      throw ApiError.unauthorized("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    }

    const user = await prisma.user.findFirst({
      where: { id: payload.sub, isActive: true, deletedAt: null },
      select: { id: true, email: true, role: true, fullName: true },
    });

    if (!user) throw ApiError.unauthorized("Tài khoản không còn hiệu lực");

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
