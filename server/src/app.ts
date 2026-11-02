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
        if (!origin || env.corsOrigins.includes(origin)) callback(null, true);
        else callback(new Error("Origin không được phép truy cập API này"));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(pinoHttp({ logger }));
  app.use(generalLimiter);

  // Kiểm tra sống — Render dùng để biết service đã sẵn sàng chưa.
  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok", time: new Date().toISOString() } });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1", publicRouter);
  app.use(seoRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
