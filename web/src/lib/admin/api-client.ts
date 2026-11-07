/**
 * Lớp gọi API cho khu quản trị.
 *
 * Khác với phần công khai (chạy phía server, không cần đăng nhập), khu này
 * chạy phía trình duyệt và luôn phải gửi kèm token.
 *
 * Token lưu trong localStorage. Đây là đánh đổi có ý thức: cookie HttpOnly
 * an toàn hơn trước tấn công XSS, nhưng cần backend và frontend cùng tên
 * miền hoặc cấu hình cookie chéo miền — mà bản triển khai hiện tại đặt
 * frontend trên Vercel và backend trên Render, hai tên miền khác nhau.
 * Bù lại, nội dung hiển thị đều do quản trị viên soạn nên bề mặt XSS hẹp.
 */

import {
  API_URL,
  ApiError,
  networkError,
  parseResponse,
  type ApiResponse,
  type PageMeta,
} from "@/lib/http";

export { ApiError, type PageMeta };

const ACCESS_KEY = "nqb.accessToken";
const REFRESH_KEY = "nqb.refreshToken";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: "editor" | "admin" | "super_admin";
  avatarUrl?: string | null;
}

/* ---------- Token ---------- */

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export const tokenStore = {
  get access() {
    return readStorage(ACCESS_KEY);
  },
  get refresh() {
    return readStorage(REFRESH_KEY);
  },
  save(access: string, refresh: string) {
    try {
      window.localStorage.setItem(ACCESS_KEY, access);
      window.localStorage.setItem(REFRESH_KEY, refresh);
    } catch {
      // Trình duyệt chặn localStorage (chế độ ẩn danh): vẫn dùng được trong
      // phiên hiện tại, chỉ là tải lại trang thì phải đăng nhập lại.
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(ACCESS_KEY);
      window.localStorage.removeItem(REFRESH_KEY);
    } catch {
      // Không làm gì — xóa thất bại thì token cũng sẽ hết hạn.
    }
  },
};

/* ---------- Làm mới token ---------- */

/**
 * Giữ một lời hứa duy nhất khi đang làm mới token.
 *
 * Nếu không, mười request cùng hết hạn một lúc sẽ gọi refresh mười lần và
 * chín cái sau nhận token đã bị thay thế.
 */
let refreshing: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  refreshing ??= (async () => {
    const refreshToken = tokenStore.refresh;
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        tokenStore.clear();
        return null;
      }

      const { data } = await parseResponse<{ accessToken: string; refreshToken: string }>(
        response,
      );
      tokenStore.save(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch {
      return null;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

/* ---------- Gọi API ---------- */

type Method = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: Method;
  /** Đối tượng thường được gửi dạng JSON; FormData thì gửi nguyên. */
  body?: unknown;
  fallbackMessage?: string;
}

async function request<T>(
  path: string,
  { method = "GET", body, fallbackMessage }: RequestOptions = {},
  retried = false,
): Promise<ApiResponse<T>> {
  const isForm = body instanceof FormData;
  const headers: Record<string, string> = {};
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";

  const accessToken = tokenStore.access;
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch {
    throw networkError();
  }

  // Token hết hạn: làm mới rồi thử lại đúng một lần.
  if (response.status === 401 && !retried && tokenStore.refresh) {
    const fresh = await refreshAccessToken();
    if (fresh) return request<T>(path, { method, body, fallbackMessage }, true);
  }

  return parseResponse<T>(response, fallbackMessage);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  async upload(file: File, altText?: string) {
    const form = new FormData();
    form.append("file", file);
    if (altText) form.append("altText", altText);

    const { data } = await request<{ id: string; url: string; thumbnailUrl?: string }>(
      "/admin/media/upload",
      { method: "POST", body: form, fallbackMessage: "Tải ảnh lên thất bại" },
    );
    return data;
  },
};

/* ---------- Đăng nhập ---------- */

export async function login(email: string, password: string): Promise<AdminUser> {
  const { data } = await api.post<{
    accessToken: string;
    refreshToken: string;
    user: AdminUser;
  }>("/auth/login", { email, password });

  tokenStore.save(data.accessToken, data.refreshToken);
  return data.user;
}

export async function fetchCurrentUser(): Promise<AdminUser | null> {
  if (!tokenStore.access) return null;
  try {
    const { data } = await api.get<AdminUser>("/auth/me");
    return data;
  } catch {
    return null;
  }
}

export function logout() {
  tokenStore.clear();
}
