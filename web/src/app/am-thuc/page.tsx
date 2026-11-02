import type { Metadata } from "next";
import { UpcomingPage } from "@/components/shared/upcoming-page";

const title = "Ẩm thực quê hương";
const description = "Món ăn, đặc sản và câu chuyện đằng sau mỗi món.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/am-thuc" },
};

export default function Page() {
  return (
    <UpcomingPage
      title={title}
      breadcrumbLabel={"Ẩm thực"}
      description={description}
    />
  );
}
