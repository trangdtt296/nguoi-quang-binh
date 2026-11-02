import type { Metadata } from "next";
import { UpcomingPage } from "@/components/shared/upcoming-page";

const title = "Thư viện ảnh & video";
const description = "Album ảnh và video về Quảng Bình.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/thu-vien" },
};

export default function Page() {
  return (
    <UpcomingPage
      title={title}
      breadcrumbLabel={"Thư viện"}
      description={description}
    />
  );
}
