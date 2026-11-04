import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { generalLimiter } from "./middleware/rate-limit";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { publicRouter } from "./routes/public";
import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/admin/auth";
import { seoRouter } from "./routes/seo";

export function createApp() {
  const app = express();

  // Render đứng sau proxy; cần dòng này để req.ip và rate limit đọc đúng IP thật.
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Không có origin: gọi từ Postman, curl hoặc server-side render.
        if (!origin || env.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        // Lúc phát triển, cho phép mọi cổng trên localhost. Next.js tự nhảy
        // sang 3001 khi 3000 bị chiếm, và khi đó trình duyệt chặn request
        // với một lỗi rất khó đoán ra nguyên nhân. Ở production thì chỉ
        // đúng danh sách trong CORS_ORIGIN mới được vào.
        if (!env.isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} không được phép truy cập API này`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(pinoHttp({ logger }));

  /*
    Kiểm tra sống — Render dùng để biết service đã sẵn sàng chưa.

    Đặt trước rate limiter, không phải sau: nếu limiter chặn đường này thì
    Render tưởng service chết và khởi động lại, càng restart càng dồn request
    vào một IP, càng bị chặn. Health check cũng không cần giới hạn vì nó
    không chạm database.
  */
  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok", time: new Date().toISOString() } });
  });

  app.use(generalLimiter);

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1", publicRouter);
  app.use(seoRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
