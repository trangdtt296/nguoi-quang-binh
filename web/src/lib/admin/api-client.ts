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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

const ACCESS_KEY = "nqb.accessToken";
const REFRESH_KEY = "nqb.refreshToken";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: "editor" | "admin" | "super_admin";
  avatarUrl?: string | null;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Lỗi có mã, để phần gọi phân biệt được hết phiên với lỗi dữ liệu. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/* ---------- Token ---------- */

export const tokenStore = {
  get access() {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(ACCESS_KEY);
    } catch {
      return null;
    }
  },
  get refresh() {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
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

async function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing;

  refreshing = (async () => {
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

      const payload = await response.json();
      const { accessToken, refreshToken: nextRefresh } = payload.data;
      tokenStore.save(accessToken, nextRefresh);
      return accessToken as string;
    } catch {
      return null;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

/* ---------- Gọi API ---------- */

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** Dùng nội bộ: đánh dấu đây là lần thử lại sau khi làm mới token. */
  retried?: boolean;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; meta?: PageMeta }> {
  const { method = "GET", body, retried = false } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const accessToken = tokenStore.access;
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    /*
      fetch ném cùng một lỗi cho nhiều nguyên nhân khác nhau — server không
      chạy, sai địa chỉ, hoặc bị chặn vì khác origin — nên không đoán được
      chính xác. Nêu cả ba khả năng kèm địa chỉ đang gọi để người dùng tự
      đối chiếu, thay vì chỉ nói "không kết nối được".
    */
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      `Không gọi được API tại ${API_URL}. Kiểm tra: backend đã chạy chưa, ` +
        `địa chỉ trong NEXT_PUBLIC_API_URL có đúng không, và mở Console của ` +
        `trình duyệt xem có bị chặn vì khác origin (CORS) không.`,
    );
  }

  // Token hết hạn: làm mới rồi thử lại đúng một lần.
  if (response.status === 401 && !retried && tokenStore.refresh) {
    const fresh = await refreshAccessToken();
    if (fresh) return request<T>(path, { ...options, retried: true });
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      response.status,
      payload?.error?.code ?? "UNKNOWN",
      payload?.error?.message ?? "Có lỗi xảy ra, vui lòng thử lại",
      payload?.error?.details,
    );
  }

  return { data: payload.data as T, meta: payload.meta as PageMeta | undefined };
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  /** Upload ảnh: dùng FormData nên không đi qua `request`. */
  async upload(file: File, altText?: string) {
    const form = new FormData();
    form.append("file", file);
    if (altText) form.append("altText", altText);

    const headers: Record<string, string> = {};
    const accessToken = tokenStore.access;
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const response = await fetch(`${API_URL}/admin/media/upload`, {
      method: "POST",
      headers,
      body: form,
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.success === false) {
      throw new ApiError(
        response.status,
        payload?.error?.code ?? "UPLOAD_FAILED",
        payload?.error?.message ?? "Tải ảnh lên thất bại",
      );
    }

    return payload.data as { id: string; url: string; thumbnailUrl?: string };
  },
};

/* ---------- Đăng nhập ---------- */

export async function login(email: string, password: string): Promise<AdminUser> {
  const { data } = await request<{
    accessToken: string;
    refreshToken: string;
    user: AdminUser;
  }>("/auth/login", { method: "POST", body: { email, password } });

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
