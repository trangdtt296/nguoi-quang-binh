import type { Metadata } from "next";
import { UpcomingPage } from "@/components/shared/upcoming-page";

const title = "Góc học tập";
const description = "Các khóa học miễn phí: lập trình, tiếng Anh, tiếng Nhật và kỹ năng mềm.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/goc-hoc-tap" },
};

export default function Page() {
  return (
    <UpcomingPage
      title={title}
      breadcrumbLabel={"Góc học tập"}
      description={description}
    />
  );
}
