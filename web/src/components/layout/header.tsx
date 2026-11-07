"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { mainNav } from "@/lib/nav";

export function Header({ facebookPageUrl }: { facebookPageUrl: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Đổi trang thì đóng menu, nếu không menu vẫn mở chồng lên trang mới.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-page flex min-h-[76px] items-center gap-6">
        <Logo className="text-ink" />

        {/*
          whitespace-nowrap là chỗ hỏng cũ: thiếu nó thì khi thanh menu chật,
          trình duyệt ngắt chữ giữa tên mục ("Điểm" xuống dòng "đến") thay vì
          để nguyên. Thêm một mục vào menu là hỏng ngay.
        */}
        <nav
          aria-label="Điều hướng chính"
          className="ml-auto hidden items-center gap-5 lg:flex xl:gap-7"
        >
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={clsx(
                "whitespace-nowrap py-2 text-[15px] font-medium transition-colors",
                isActive(item.href) ? "text-ink underline underline-offset-8" : "text-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="main-menu"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[8px] border border-line text-ink lg:hidden"
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            <span className="sr-only">{open ? "Đóng menu" : "Mở menu"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <div id="main-menu" className="border-t border-line bg-white lg:hidden">
          <nav aria-label="Điều hướng chính" className="container-page flex flex-col py-2">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={clsx(
                  "border-b border-line py-3.5 text-[16px] font-medium last:border-b-0",
                  isActive(item.href) ? "text-ink" : "text-muted",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/tim-kiem"
              className="border-b border-line py-3.5 text-[16px] font-medium text-muted"
            >
              Tìm kiếm
            </Link>
            <a
              href={facebookPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 mb-4 inline-flex min-h-11 items-center justify-center rounded-[8px] bg-ink px-4 text-[15px] font-semibold text-white"
            >
              Theo dõi Fanpage
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
