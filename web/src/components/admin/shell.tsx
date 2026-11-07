"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import { AdminSidebar } from "./sidebar";
import { AdminLoading } from "./ui";
import { useAuth } from "@/lib/admin/auth-context";
import { USER_ROLE_LABELS } from "@/lib/admin/types";

/**
 * Khung của khu quản trị: chặn truy cập khi chưa đăng nhập, sidebar, header.
 *
 * Việc chặn ở đây là chặn phía giao diện, cốt để người dùng không nhìn thấy
 * màn hình trống. Bảo vệ thật nằm ở backend: mọi API quản trị đều kiểm tra
 * token và vai trò, nên dù có vào được màn hình cũng không lấy được dữ liệu.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/admin/login");
  }, [loading, user, router]);

  // Đổi trang thì đóng menu trên điện thoại.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-alt">
        <AdminLoading label="Đang kiểm tra phiên đăng nhập" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-surface-alt">
      {/* Sidebar cố định trên màn hình rộng */}
      <aside className="hidden w-[248px] shrink-0 bg-ink lg:block">
        <div className="sticky top-0 h-screen">
          <AdminSidebar />
        </div>
      </aside>

      {/* Sidebar trượt ra trên điện thoại */}
      {menuOpen ? (
        <div
          className="fixed inset-0 z-40 bg-abyss/60 lg:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <aside
            className="h-full w-[260px] bg-ink"
            onClick={(event) => event.stopPropagation()}
          >
            <AdminSidebar onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-[68px] flex-wrap items-center gap-4 border-b border-line bg-surface px-5 md:px-7">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[8px] border border-line lg:hidden"
          >
            {menuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
            <span className="sr-only">Mở menu quản trị</span>
          </button>

          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="inline-flex min-h-10 items-center gap-2 rounded-[8px] border border-line px-3 text-[13.5px] font-medium transition-colors hover:border-ink"
            >
              <ExternalLink size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Xem website</span>
            </Link>

            <div className="flex items-center gap-3 border-l border-line pl-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-[13px] font-bold">
                {initials(user.fullName)}
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-[13.5px] font-semibold">{user.fullName}</span>
                <span className="block text-[12px] text-muted">
                  {USER_ROLE_LABELS[user.role]}
                </span>
              </span>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-[8px] text-muted transition-colors hover:bg-primary-50 hover:text-ink"
              >
                <LogOut size={17} aria-hidden="true" />
                <span className="sr-only">Đăng xuất</span>
              </button>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-5 md:p-7">{children}</main>
      </div>
    </div>
  );
}

/** Lấy chữ cái đầu của tên để làm ảnh đại diện tạm. */
function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
