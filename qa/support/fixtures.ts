import { test as base, expect, type Page } from "@playwright/test";
import { env } from "./env";

export { expect };

/* ---------- Đánh dấu trạng thái ---------- */

/**
 * Dừng case với trạng thái BLOCKED: không chạy được vì thiếu điều kiện
 * (server tắt, thiếu tài khoản, thiếu cấu hình…), không phải do lỗi web.
 */
export function blocked(reason: string): never {
  const info = base.info();
  info.annotations.push({ type: "blocked", description: reason });
  info.skip(true, `BLOCKED: ${reason}`);
  throw new Error("unreachable");
}

/** Case làm tốn hạn mức của server — chỉ chạy khi QA_ALLOW_RATE_LIMITED=1. */
export function requireRateLimitedRun(what: string) {
  if (!env.allowRateLimited) {
    blocked(`${what} — đặt QA_ALLOW_RATE_LIMITED=1 để chạy (sẽ dùng hạn mức của server)`);
  }
}

/** Dữ liệu test luôn có tiền tố này để dễ nhận ra và dọn. */
export function qaName(label: string) {
  return `[QA] ${label} ${Date.now().toString(36)}`;
}

/* ---------- Kiểm tra môi trường ---------- */

async function reachable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5_000) });
    return response.status < 500;
  } catch {
    return false;
  }
}

interface Health {
  web: boolean;
  api: boolean;
}

/* ---------- Gọi API trực tiếp (chuẩn bị và dọn dữ liệu) ---------- */

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: string; fullName: string };
}

export async function apiLogin(email: string, password: string): Promise<Session> {
  const response = await fetch(`${env.apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Đăng nhập API thất bại (${response.status}): ${payload?.error?.message ?? ""}`);
  }
  return payload.data as Session;
}

export class AdminApi {
  private created: string[] = [];

  constructor(private session: Session) {}

  get user() {
    return this.session.user;
  }

  async request<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${env.apiUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.session.accessToken}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(`${method} ${path} → ${response.status}: ${payload?.error?.message ?? ""}`);
    }
    return payload?.data as T;
  }

  /** Tạo bản ghi và tự xóa (mềm) khi case kết thúc. */
  async create<T extends { id: string }>(endpoint: string, body: unknown): Promise<T> {
    const record = await this.request<T>("POST", endpoint, body);
    this.created.push(`${endpoint}/${record.id}`);
    return record;
  }

  async cleanup() {
    for (const path of this.created.reverse()) {
      await this.request("DELETE", path).catch(() => undefined);
    }
    this.created = [];
  }
}

/** Mở web ở trạng thái đã đăng nhập bằng cách đặt sẵn token như khi đăng nhập thật. */
export async function signInPage(page: Page, session: Session) {
  await page.addInitScript(
    ({ access, refresh }) => {
      window.localStorage.setItem("nqb.accessToken", access);
      window.localStorage.setItem("nqb.refreshToken", refresh);
    },
    { access: session.accessToken, refresh: session.refreshToken },
  );
}

/* ---------- Fixture ---------- */

type TestFixtures = {
  /** Tự chạy trước mọi case: web không truy cập được thì BLOCKED. */
  guard: void;
  /** Gọi trong case cần API (trang công khai cũng lấy dữ liệu từ API). */
  needApi: () => void;
  /** Phiên super_admin đăng nhập qua API (đăng nhập đúng không tính vào hạn mức). */
  adminSession: Session;
  adminApi: AdminApi;
  /** Trang đã đăng nhập quản trị. */
  adminPage: Page;
};

type WorkerFixtures = { health: Health };

export const test = base.extend<TestFixtures, WorkerFixtures>({
  health: [
    async ({}, use) => {
      const [web, api] = await Promise.all([
        reachable(env.webUrl),
        reachable(`${env.apiUrl}/settings`),
      ]);
      await use({ web, api });
    },
    { scope: "worker" },
  ],

  guard: [
    async ({ health }, use) => {
      if (!health.web) blocked(`Không truy cập được web tại ${env.webUrl}`);
      await use();
    },
    { auto: true },
  ],

  needApi: async ({ health }, use) => {
    await use(() => {
      if (!health.api) blocked(`Không truy cập được API tại ${env.apiUrl}`);
    });
  },

  adminSession: async ({ needApi }, use) => {
    needApi();
    if (!env.adminEmail || !env.adminPassword) {
      blocked("Thiếu QA_ADMIN_EMAIL / QA_ADMIN_PASSWORD trong qa/.env");
    }
    let session: Session;
    try {
      session = await apiLogin(env.adminEmail, env.adminPassword);
    } catch (error) {
      blocked(`Không đăng nhập được tài khoản test: ${(error as Error).message}`);
    }
    await use(session);
  },

  adminApi: async ({ adminSession }, use) => {
    const api = new AdminApi(adminSession);
    await use(api);
    await api.cleanup();
  },

  adminPage: async ({ page, adminSession }, use) => {
    await signInPage(page, adminSession);
    await use(page);
  },
});
