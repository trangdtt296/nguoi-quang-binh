import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});

/*
  Font serif cho tiêu đề. Phải là font có bộ ký tự tiếng Việt — Source Serif 4
  không có subset "vietnamese" nên build hỏng; Lora thì có, và vẫn giữ được
  chất tạp chí cho tiêu đề.
*/
const lora = Lora({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "600"],
  variable: "--font-serif-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Người Quảng Bình — Vẻ đẹp quê hương trong từng câu chuyện",
    template: "%s — Người Quảng Bình",
  },
  description:
    "Trang thông tin cộng đồng giới thiệu điểm đến, văn hóa, ẩm thực và con người Quảng Bình.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Người Quảng Bình",
  },
  robots: { index: true, follow: true },
};

/**
 * Layout gốc: khung HTML, font và provider dùng chung (react-query).
 *
 * Header và Footer nằm ở (public)/layout.tsx, vì khu quản trị có khung
 * riêng và không dùng chúng.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${beVietnam.variable} ${lora.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
