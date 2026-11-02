import type { Metadata } from "next";
import { UpcomingPage } from "@/components/shared/upcoming-page";

const title = "Văn hóa & con người";
const description = "Lễ hội, nghề truyền thống và những câu chuyện về người Quảng Bình.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/van-hoa" },
};

export default function Page() {
  return (
    <UpcomingPage
      title={title}
      breadcrumbLabel={"Văn hóa"}
      description={description}
    />
  );
}
