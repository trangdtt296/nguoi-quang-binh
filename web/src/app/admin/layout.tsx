import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/admin/auth-context";

export const metadata: Metadata = {
  title: {
    default: "Quản trị nội dung",
    template: "%s — Quản trị Người Quảng Bình",
  },
  // Khu quản trị không bao giờ nên xuất hiện trên công cụ tìm kiếm.
  robots: { index: false, follow: false },
};

/**
 * Layout của khu quản trị.
 *
 * Chỉ bọc AuthProvider ở đây; khung giao diện nằm trong AdminShell và được
 * gọi ở từng trang, để riêng trang đăng nhập không bị bọc trong khung đó.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
