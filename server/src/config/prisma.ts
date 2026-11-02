import { PrismaClient } from "@prisma/client";
import { env } from "./env";

/**
 * Một PrismaClient dùng chung cho cả tiến trình.
 *
 * Ở chế độ dev, tsx watch nạp lại module mỗi lần sửa file; giữ client trên
 * globalThis để không mở thêm connection pool mới sau mỗi lần nạp lại — nếu
 * không, Neon sẽ nhanh chóng hết số kết nối cho phép.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isProduction ? ["error"] : ["query", "warn", "error"],
  });

if (!env.isProduction) globalForPrisma.prisma = prisma;
