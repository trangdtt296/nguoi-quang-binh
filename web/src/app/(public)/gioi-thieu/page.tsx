import type { Metadata } from "next";
import { Breadcrumb, ButtonLink } from "@/components/ui";
import { ContentImage } from "@/components/shared/content-image";
import { Prose } from "@/components/shared/prose";
import { getSiteSettings } from "@/lib/queries";

const title = "Giới thiệu";
const description =
  "Về vùng đất Quảng Bình và về trang Người Quảng Bình — chúng mình làm gì và vì sao.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/gioi-thieu" },
};

const aboutLand = [
  "<p>Quảng Bình nằm nơi khúc ruột miền Trung, chỗ hẹp nhất chỉ hơn 40 cây số từ biển lên tới biên giới. Vậy mà trong dải đất ấy có vườn quốc gia được UNESCO công nhận, hang động lớn nhất hành tinh, những bãi cát trắng trải dài và một nền ẩm thực mặn mòi vị biển.</p>",
  "<p>Đây cũng là vùng đất của gió Lào và bão. Thời tiết khắc nghiệt làm nên tính cách người ở đây: chịu khó, ít nói, và rất thương quê.</p>",
  "<h2>Về mặt hành chính</h2>",
  "<p>Từ ngày 1/7/2025, theo Nghị quyết 202/2025/QH15, tỉnh Quảng Bình hợp nhất với tỉnh Quảng Trị thành tỉnh Quảng Trị, trung tâm hành chính đặt tại Đồng Hới. Tên tỉnh đổi, nhưng đất và người thì vẫn vậy — và cái tên Quảng Bình vẫn là thứ ai cũng nhận ra.</p>",
].join("");

const aboutSite = [
  "<p>Trang này mở rộng từ Fanpage Facebook <strong>Người Quảng Bình</strong>. Fanpage hợp để chia sẻ nhanh, nhưng bài viết trôi đi và người mới khó tìm lại. Website giữ nội dung ở một chỗ, sắp xếp theo chủ đề, và ai tìm trên Google cũng ra.</p>",
  "<h2>Chúng mình làm gì</h2>",
  "<p>Giới thiệu điểm đến, kể chuyện văn hóa và con người, viết về món ăn quê, và làm cẩm nang cho người lần đầu tới Quảng Bình. Ngoài ra có Góc học tập — nơi chia sẻ kiến thức miễn phí cho người quê mình.</p>",
  "<h2>Chúng mình không làm gì</h2>",
  "<p>Đây không phải trang bán tour. Không có đặt chỗ, không có giỏ hàng, không có thanh toán. Toàn bộ nội dung phi lợi nhuận.</p>",
  "<h2>Về hình ảnh và nội dung</h2>",
  "<p>Chúng mình chỉ dùng ảnh tự chụp, ảnh được cộng đồng gửi tặng, hoặc ảnh có giấy phép sử dụng tự do. Nếu bạn thấy nội dung nào thuộc về mình mà chưa được ghi nguồn đúng, xin báo để chúng mình sửa hoặc gỡ.</p>",
].join("");

export default async function Page() {
  const settings = await getSiteSettings();

  return (
    <div className="pb-20">
      <div className="container-page pt-7">
        <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Giới thiệu" }]} />
      </div>

      <div className="container-page mt-6 max-w-[760px]">
        <h1 className="font-serif text-[34px] font-semibold leading-tight tracking-[-0.015em] md:text-[46px]">
          {settings.slogan}
        </h1>
        <p className="mt-5 text-[19px] leading-relaxed text-muted">
          {settings.aboutShort}
        </p>
      </div>

      <div className="container-page mt-10">
        <ContentImage
          alt="Ảnh toàn cảnh vùng đất Quảng Bình"
          ratio="16/9"
          className="max-h-[440px] rounded-[12px]"
          sizes="100vw"
        />
      </div>

      <div className="container-page mt-12 max-w-[760px]">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-deep">
          Về quê hương
        </h2>
        <Prose html={aboutLand} className="mt-4" />

        <h2 className="mt-14 text-[13px] font-semibold uppercase tracking-[0.14em] text-deep">
          Về trang này
        </h2>
        <Prose html={aboutSite} className="mt-4" />
      </div>

      <section className="container-page mt-16">
        <div className="rounded-[12px] bg-abyss px-6 py-12 text-center text-white md:px-12">
          <h2 className="text-[26px] font-bold leading-tight md:text-[32px]">
            Cùng kể chuyện quê mình
          </h2>
          <p className="mx-auto mt-3 max-w-[52ch] text-[17px] leading-relaxed text-silver">
            Bạn có một tấm ảnh đẹp, một câu chuyện cũ, hay chỉ muốn góp ý — cứ gửi cho
            chúng mình.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href={settings.facebookPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-[8px] bg-white px-5 text-[15px] font-semibold text-ink transition-colors hover:bg-silver-50"
            >
              Theo dõi Fanpage
            </a>
            <ButtonLink
              href="/lien-he"
              variant="ghost"
              className="border-white/45 text-white hover:border-white"
            >
              Gửi góp ý
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
