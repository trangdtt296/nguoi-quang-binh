import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** Đọc qa/.env nếu có (Node ≥ 20.12 có sẵn loadEnvFile). */
const envFile = fileURLToPath(new URL("../.env", import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);

const trimSlash = (value: string) => value.replace(/\/+$/, "");

export const env = {
  webUrl: trimSlash(process.env.QA_WEB_URL ?? "http://localhost:3000"),
  apiUrl: trimSlash(process.env.QA_API_URL ?? "http://localhost:5000/api/v1"),

  /** Tài khoản super_admin (thường là tài khoản seed). */
  adminEmail: process.env.QA_ADMIN_EMAIL ?? "",
  adminPassword: process.env.QA_ADMIN_PASSWORD ?? "",

  /** Tài khoản vai trò editor, dùng cho case phân quyền. Không bắt buộc. */
  editorEmail: process.env.QA_EDITOR_EMAIL ?? "",
  editorPassword: process.env.QA_EDITOR_PASSWORD ?? "",

  /**
   * Cho phép chạy case làm "tốn" hạn mức của server: đăng nhập sai nhiều
   * lần (khóa 15 phút), gửi form liên hệ (5 tin/giờ). Mặc định tắt.
   */
  allowRateLimited: process.env.QA_ALLOW_RATE_LIMITED === "1",
};
