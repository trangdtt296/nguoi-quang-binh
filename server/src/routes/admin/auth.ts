import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { ApiError, sendData, serialize } from "../../utils/api";
import { validate } from "../../middleware/validate";
import { loginLimiter } from "../../middleware/rate-limit";
import { requireAuth, signAccessToken, signRefreshToken } from "../../middleware/auth";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ"),
  password: z.string().min(1, "Chưa nhập mật khẩu"),
});

authRouter.post("/login", loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });

    // Cùng một thông báo cho cả hai trường hợp sai email và sai mật khẩu,
    // để không tiết lộ email nào đang tồn tại trong hệ thống.
    const invalid = new ApiError(401, "INVALID_CREDENTIALS", "Email hoặc mật khẩu không đúng");

    if (!user) {
      // Vẫn băm một lần để thời gian phản hồi không khác biệt rõ rệt.
      await bcrypt.compare(password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidin");
      throw invalid;
    }
    if (!user.isActive) throw ApiError.forbidden("Tài khoản đã bị khóa");

    const matched = await bcrypt.compare(password, user.passwordHash);
    if (!matched) throw invalid;

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    sendData(res, {
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

const refreshSchema = z.object({ refreshToken: z.string().min(1) });

authRouter.post("/refresh", validate(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body as z.infer<typeof refreshSchema>;

    let payload: { sub: string };
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string };
    } catch {
      throw ApiError.unauthorized("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    }

    const user = await prisma.user.findFirst({
      where: { id: payload.sub, isActive: true, deletedAt: null },
    });
    if (!user) throw ApiError.unauthorized("Tài khoản không còn hiệu lực");

    sendData(res, {
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Đăng xuất. Token hiện được cấp không trạng thái nên server không thu hồi
 * được; client phải xóa token đã lưu. Nếu sau này cần thu hồi ngay lập tức
 * thì phải thêm bảng lưu refresh token.
 */
authRouter.post("/logout", (_req, res) => {
  sendData(res, { loggedOut: true });
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        lastLoginAt: true,
      },
    });
    sendData(res, serialize(user));
  } catch (error) {
    next(error);
  }
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Chưa nhập mật khẩu hiện tại"),
  newPassword: z
    .string()
    .min(10, "Mật khẩu mới phải dài ít nhất 10 ký tự")
    .max(128),
});

authRouter.patch(
  "/password",
  requireAuth,
  validate(passwordSchema),
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body as z.infer<typeof passwordSchema>;

      const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
      const matched = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!matched) throw ApiError.badRequest("Mật khẩu hiện tại không đúng");

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await bcrypt.hash(newPassword, 12) },
      });

      sendData(res, { changed: true });
    } catch (error) {
      next(error);
    }
  },
);
