import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/shell";

/** Mọi trang trong nhóm này cần đăng nhập và dùng chung khung quản trị. */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
