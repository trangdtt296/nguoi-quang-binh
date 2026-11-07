import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/admin/auth-context";
import { ToastProvider } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: {
    default: "Quản trị nội dung",
    template: "%s — Quản trị Người Quảng Bình",
  },
  // Khu quản trị không bao giờ nên xuất hiện trên công cụ tìm kiếm.
  robots: { index: false, follow: false },
};

/**
 * Layout của toàn khu quản trị, kể cả trang đăng nhập.
 *
 * Khung giao diện (sidebar, header) nằm ở (protected)/layout.tsx, để riêng
 * trang đăng nhập không bị bọc trong khung đó.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
