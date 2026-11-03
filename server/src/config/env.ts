// Nạp file .env trước khi đọc process.env.
// Node không tự đọc .env, và tsx cũng không — chỉ Prisma CLI mới tự nạp,
// nên khi chạy `npm run dev` mà thiếu dòng này thì server chết ngay lúc
// khởi động vì tưởng là thiếu biến môi trường.
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

/**
 * Đọc và kiểm tra biến môi trường ngay khi khởi động.
 *
 * Thà server chết ngay lúc chạy lên vì thiếu biến, còn hơn chạy được rồi mới
 * hỏng giữa chừng khi có người gọi đúng chức năng cần biến đó.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),

  DATABASE_URL: z.string().min(1, "Thiếu DATABASE_URL"),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET phải dài ít nhất 32 ký tự"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET phải dài ít nhất 32 ký tự"),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),

  // Cloudinary là tùy chọn: thiếu thì chỉ mất chức năng upload ảnh,
  // phần còn lại của API vẫn chạy bình thường.
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  /** Danh sách origin được phép, cách nhau bằng dấu phẩy. */
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  SITE_URL: z.string().default("http://localhost:3000"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  // Nguyên nhân hay gặp nhất không phải là điền sai, mà là không có file
  // .env — nó nằm trong .gitignore nên clone về sẽ không có sẵn. Nói thẳng
  // ra để người chạy lần đầu không phải đoán.
  const envPath = path.resolve(process.cwd(), ".env");
  const hint = fs.existsSync(envPath)
    ? `Đã tìm thấy file .env tại ${envPath}, nhưng các biến trên vẫn thiếu hoặc không hợp lệ.`
    : `Không tìm thấy file .env tại ${envPath}.\n` +
      `Tạo nó bằng cách chép từ mẫu: cp .env.example .env (Windows: copy .env.example .env)\n` +
      `rồi điền các giá trị theo hướng dẫn trong README.`;

  throw new Error(`Biến môi trường không hợp lệ:\n${issues}\n\n${hint}`);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean),
  isProduction: parsed.data.NODE_ENV === "production",
  hasCloudinary: Boolean(
    parsed.data.CLOUDINARY_CLOUD_NAME &&
      parsed.data.CLOUDINARY_API_KEY &&
      parsed.data.CLOUDINARY_API_SECRET,
  ),
};
