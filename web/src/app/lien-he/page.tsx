import type { Metadata } from "next";
import { UpcomingPage } from "@/components/shared/upcoming-page";

const title = "Liên hệ";
const description = "Gửi câu hỏi, góp ý hoặc câu chuyện của bạn.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/lien-he" },
};

export default function Page() {
  return (
    <UpcomingPage
      title={title}
      breadcrumbLabel={"Liên hệ"}
      description={description}
    />
  );
}
