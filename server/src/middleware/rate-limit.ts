import rateLimit from "express-rate-limit";

const message = {
  success: false,
  error: {
    code: "TOO_MANY_REQUESTS",
    message: "Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút",
  },
};

/** Giới hạn chung cho toàn bộ API, chặn quét tự động. */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message,
});

/** Đăng nhập: siết chặt để chặn dò mật khẩu. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_ATTEMPTS",
      message: "Sai quá nhiều lần. Vui lòng thử lại sau 15 phút.",
    },
  },
});

/** Form liên hệ: chặn spam. */
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message,
});

/** Ghi nhận lượt xem: chặn tăng khống. */
export const viewLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message,
});
