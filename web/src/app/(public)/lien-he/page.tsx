import type { Metadata } from "next";
import { Facebook, Mail, MapPin } from "lucide-react";
import { Breadcrumb } from "@/components/ui";
import { ContactForm } from "@/components/shared/contact-form";
import { getSiteSettings } from "@/lib/queries";

const title = "Liên hệ";
const description =
  "Gửi câu hỏi, góp ý, hoặc chia sẻ câu chuyện và hình ảnh về Quảng Bình của bạn.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/lien-he" },
};

export default async function Page() {
  const settings = await getSiteSettings();

  return (
    <div className="bg-surface-alt pb-20">
      <div className="container-page pt-7">
        <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Liên hệ" }]} />
      </div>

      <div className="container-page pt-6">
        <h1 className="text-[32px] font-bold leading-tight tracking-[-0.01em] md:text-[40px]">
          {title}
        </h1>
        <p className="mt-3 max-w-[58ch] text-[17px] leading-relaxed text-muted">
          {description}
        </p>
      </div>

      <div className="container-page mt-10 flex flex-wrap items-start gap-10">
        <div className="min-w-0 flex-[999_1_480px] rounded-[12px] border border-line bg-surface p-6 md:p-8">
          <h2 className="text-[20px] font-semibold">Gửi tin nhắn</h2>
          <p className="mt-2 mb-7 text-[15px] leading-relaxed text-muted">
            Điền vào form dưới đây. Những ô có dấu <span className="text-ink">*</span> là
            bắt buộc.
          </p>
          <ContactForm />
        </div>

        <aside className="min-w-0 flex-1 basis-[300px]">
          <div className="rounded-[12px] border border-line bg-surface p-6">
            <h2 className="text-[16px] font-semibold">Cách khác để liên hệ</h2>

            <ul className="mt-5 flex flex-col gap-5 text-[14.5px]">
              <li className="flex items-start gap-3">
                <Facebook size={17} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
                <span>
                  <span className="block font-semibold">Fanpage Facebook</span>
                  <a
                    href={settings.facebookPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-block text-muted underline underline-offset-4 hover:text-ink"
                  >
                    Người Quảng Bình
                  </a>
                  <span className="mt-1 block text-[13.5px] text-muted">
                    Nhắn tin trực tiếp, thường trả lời nhanh nhất.
                  </span>
                </span>
              </li>

              <li className="flex items-start gap-3">
                <Mail size={17} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
                <span>
                  <span className="block font-semibold">Email</span>
                  <span className="mt-0.5 block text-muted">
                    {settings.email ?? "[CHƯA CẬP NHẬT EMAIL]"}
                  </span>
                </span>
              </li>

              <li className="flex items-start gap-3">
                <MapPin size={17} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
                <span>
                  <span className="block font-semibold">Địa bàn</span>
                  <span className="mt-0.5 block text-muted">
                    Quảng Bình, nay thuộc tỉnh Quảng Trị
                  </span>
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-5 rounded-[12px] border border-dashed border-silver bg-surface p-5">
            <h2 className="text-[15px] font-semibold">Gửi ảnh hoặc bài viết</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              Form này chỉ nhận chữ. Nếu bạn muốn gửi ảnh hoặc bài dài, nhắn qua
              Fanpage sẽ tiện hơn.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
