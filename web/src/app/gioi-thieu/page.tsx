import type { Metadata } from "next";
import { UpcomingPage } from "@/components/shared/upcoming-page";

const title = "Giới thiệu";
const description = "Về vùng đất Quảng Bình và về trang Người Quảng Bình.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/gioi-thieu" },
};

export default function Page() {
  return (
    <UpcomingPage
      title={title}
      breadcrumbLabel={"Giới thiệu"}
      description={description}
    />
  );
}
