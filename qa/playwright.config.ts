import { defineConfig, devices } from "@playwright/test";
import { env } from "./support/env";

/**
 * Chạy tuần tự (1 worker): các case dùng chung một database và server có
 * giới hạn tần suất (đăng nhập, form liên hệ) — chạy song song sẽ làm case
 * này ảnh hưởng case kia.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  outputDir: "./test-results",
  reporter: [["list"], ["./support/status-reporter.ts"]],
  use: {
    baseURL: env.webUrl,
    locale: "vi-VN",
    timezoneId: "Asia/Ho_Chi_Minh",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
