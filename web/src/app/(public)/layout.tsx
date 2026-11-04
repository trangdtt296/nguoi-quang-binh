import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getSiteSettings } from "@/lib/queries";

/**
 * Layout của phần công khai.
 *
 * Tách khỏi layout gốc để khu quản trị (/admin) không bị gắn Header và
 * Footer của trang công khai. Tên thư mục đặt trong ngoặc đơn nên không ảnh
 * hưởng tới đường dẫn: (public)/diem-den vẫn là /diem-den.
 */
/**
 * Render theo từng yêu cầu thay vì dựng sẵn lúc build.
 *
 * Nội dung do quản trị viên đăng, nên phải lấy mới mỗi lần — xuất bản xong
 * là thấy ngay, không phải chờ build lại. Cũng nhờ vậy mà lúc build không
 * cần gọi API, nên deploy được cả khi backend chưa sẵn sàng.
 */
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Bỏ qua phần đầu trang
      </a>
      <Header facebookPageUrl={settings.facebookPageUrl} />
      <main id="main-content">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
