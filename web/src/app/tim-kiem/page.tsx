import type { Metadata } from "next";
import { UpcomingPage } from "@/components/shared/upcoming-page";

const title = "Tìm kiếm";
const description = "Tìm bài viết, điểm đến, món ăn và khóa học trên toàn trang.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tim-kiem" },
};

export default function Page() {
  return (
    <UpcomingPage
      title={title}
      breadcrumbLabel={"Tìm kiếm"}
      description={description}
    />
  );
}
