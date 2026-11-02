import type { Metadata } from "next";
import { UpcomingPage } from "@/components/shared/upcoming-page";

const title = "Tin tức & sự kiện";
const description = "Tin tức, hoạt động du lịch và sự kiện địa phương.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tin-tuc" },
};

export default function Page() {
  return (
    <UpcomingPage
      title={title}
      breadcrumbLabel={"Tin tức"}
      description={description}
    />
  );
}
