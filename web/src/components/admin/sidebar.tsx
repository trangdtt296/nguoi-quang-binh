"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  FileText,
  MapPin,
  UtensilsCrossed,
  CalendarDays,
  GraduationCap,
  Images,
  Tags,
  ImageIcon,
  LayoutTemplate,
  Mail,
  Trash2,
  Settings,
  Users,
} from "lucide-react";
import { LogoMark } from "@/components/layout/logo";
import { useAuth } from "@/lib/admin/auth-context";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  /** Chỉ hiện với admin trở lên. */
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  /**
   * Màn hình chưa dựng: hiện mờ và không bấm được, thay vì để người dùng
   * bấm vào rồi gặp trang 404.
   */
  upcoming?: boolean;
}

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Tổng quan",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Nội dung",
    items: [
      { label: "Bài viết", href: "/admin/articles", icon: FileText },
      { label: "Điểm đến", href: "/admin/destinations", icon: MapPin },
      { label: "Ẩm thực", href: "/admin/foods", icon: UtensilsCrossed },
      { label: "Sự kiện", href: "/admin/events", icon: CalendarDays },
      { label: "Khóa học", href: "/admin/courses", icon: GraduationCap },
      { label: "Album ảnh", href: "/admin/albums", icon: Images },
      { label: "Danh mục", href: "/admin/categories", icon: Tags },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { label: "Thư viện media", href: "/admin/media", icon: ImageIcon },
      {
        label: "Banner",
        href: "/admin/banners",
        icon: LayoutTemplate,
        adminOnly: true,
      },
      { label: "Tin nhắn", href: "/admin/messages", icon: Mail, adminOnly: true },
      { label: "Thùng rác", href: "/admin/trash", icon: Trash2, adminOnly: true },
      {
        label: "Cài đặt",
        href: "/admin/settings",
        icon: Settings,
        superAdminOnly: true,
      },
      {
        label: "Tài khoản",
        href: "/admin/users",
        icon: Users,
        superAdminOnly: true,
      },
    ],
  },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { isAdmin, isSuperAdmin } = useAuth();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav aria-label="Điều hướng quản trị" className="flex h-full flex-col p-3">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="mb-4 flex items-center gap-2.5 border-b border-white/10 px-3 pb-4 text-white"
      >
        <LogoMark size={28} />
        <span className="text-[13px] font-bold leading-tight">
          NGƯỜI QUẢNG BÌNH
          <span className="block text-[11.5px] font-normal text-silver">
            Quản trị nội dung
          </span>
        </span>
      </Link>

      <div className="scrollbar-hidden flex-1 overflow-y-auto pb-4">
        {groups.map((group) => {
          const visible = group.items.filter((item) => {
            if (item.superAdminOnly) return isSuperAdmin;
            if (item.adminOnly) return isAdmin;
            return true;
          });

          if (visible.length === 0) return null;

          return (
            <div key={group.title} className="mb-1">
              <h2 className="mb-2 mt-5 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-silver/70">
                {group.title}
              </h2>
              <ul className="flex flex-col gap-0.5">
                {visible.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  if (item.upcoming) {
                    return (
                      <li key={item.href}>
                        <span
                          title="Màn hình này đang được dựng"
                          className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-[8px] px-3 text-[14.5px] text-silver/40"
                        >
                          <Icon size={17} aria-hidden="true" />
                          {item.label}
                          <span className="ml-auto text-[10.5px] uppercase tracking-[0.08em]">
                            Sắp có
                          </span>
                        </span>
                      </li>
                    );
                  }

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={clsx(
                          "flex min-h-11 items-center gap-3 rounded-[8px] px-3 text-[14.5px] transition-colors",
                          active
                            ? "bg-primary-500 font-semibold text-white"
                            : "text-silver hover:bg-white/8 hover:text-white",
                        )}
                      >
                        <Icon size={17} aria-hidden="true" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
