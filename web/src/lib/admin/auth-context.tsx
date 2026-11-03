"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  fetchCurrentUser,
  login as apiLogin,
  logout as apiLogout,
  type AdminUser,
} from "./api-client";

interface AuthState {
  user: AdminUser | null;
  /** Đang kiểm tra token lúc mới tải trang. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  /** Vai trò có đủ quyền xuất bản và xóa không. */
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Lúc mới tải trang, hỏi lại server xem token còn hiệu lực không — thay vì
  // tin vào token đã lưu, vì tài khoản có thể đã bị khóa trong lúc đó.
  useEffect(() => {
    let active = true;
    fetchCurrentUser()
      .then((found) => {
        if (active) setUser(found);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const signedIn = await apiLogin(email, password);
    setUser(signedIn);
  }, []);

  const signOut = useCallback(() => {
    apiLogout();
    setUser(null);
    router.push("/admin/login");
  }, [router]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      signIn,
      signOut,
      isAdmin: user?.role === "admin" || user?.role === "super_admin",
      isSuperAdmin: user?.role === "super_admin",
    }),
    [user, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng bên trong AuthProvider");
  }
  return context;
}
