import type { Metadata } from "next";
import { UpcomingPage } from "@/components/shared/upcoming-page";

const title = "Cẩm nang du lịch";
const description = "Thời điểm đi, cách di chuyển, chỗ ở và lịch trình gợi ý.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/cam-nang" },
};

export default function Page() {
  return (
    <UpcomingPage
      title={title}
      breadcrumbLabel={"Cẩm nang"}
      description={description}
    />
  );
}
