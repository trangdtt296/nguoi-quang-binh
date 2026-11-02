import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`API đang chạy tại http://localhost:${env.PORT}`);
});

/** Đóng kết nối gọn gàng khi Render dừng service. */
async function shutdown(signal: string) {
  logger.info(`Nhận tín hiệu ${signal}, đang dừng server`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  // Nếu sau 10 giây vẫn chưa đóng xong thì thoát cứng.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
