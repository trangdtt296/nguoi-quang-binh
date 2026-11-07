"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

const CURRENT_USER_KEY = ["auth", "me"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Lúc mới tải trang, hỏi lại server xem token còn hiệu lực không — thay vì
  // tin vào token đã lưu, vì tài khoản có thể đã bị khóa trong lúc đó.
  const { data: user = null, isPending } = useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: fetchCurrentUser,
    staleTime: Infinity,
    retry: false,
  });

  const signIn = useCallback(
    async (email: string, password: string) => {
      const signedIn = await apiLogin(email, password);
      queryClient.setQueryData(CURRENT_USER_KEY, signedIn);
    },
    [queryClient],
  );

  const signOut = useCallback(() => {
    apiLogout();
    // Xóa sạch cache để người đăng nhập sau không thấy dữ liệu của người trước.
    queryClient.clear();
    queryClient.setQueryData(CURRENT_USER_KEY, null);
    router.push("/admin/login");
  }, [queryClient, router]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading: isPending,
      signIn,
      signOut,
      isAdmin: user?.role === "admin" || user?.role === "super_admin",
      isSuperAdmin: user?.role === "super_admin",
    }),
    [user, isPending, signIn, signOut],
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
