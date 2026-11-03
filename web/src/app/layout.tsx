import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getSiteSettings } from "@/lib/queries";

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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();

  return (
    <html lang="vi" className={`${beVietnam.variable} ${lora.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Bỏ qua phần đầu trang
        </a>
        <Header facebookPageUrl={settings.facebookPageUrl} />
        <main id="main-content">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
