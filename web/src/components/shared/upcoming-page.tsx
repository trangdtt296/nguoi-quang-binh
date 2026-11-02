import { Breadcrumb, ButtonLink } from "@/components/ui";

/**
 * Trang chưa dựng xong.
 *
 * Dùng tạm cho các mục sẽ làm ở lượt sau của Giai đoạn 2. Nói thẳng là chưa
 * có nội dung thay vì dựng giao diện giả — người xem biết chính xác mình
 * đang đứng ở đâu, và link trên menu không dẫn tới trang lỗi 404.
 */
export function UpcomingPage({
  title,
  description,
  breadcrumbLabel,
}: {
  title: string;
  description: string;
  breadcrumbLabel: string;
}) {
  return (
    <div className="bg-surface-alt pb-24">
      <div className="container-page pt-7">
        <Breadcrumb
          items={[{ label: "Trang chủ", href: "/" }, { label: breadcrumbLabel }]}
        />
      </div>
      <div className="container-page pt-16 pb-10">
        <h1 className="text-[32px] font-bold leading-tight tracking-[-0.01em] md:text-[40px]">
          {title}
        </h1>
        <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-muted">
          {description}
        </p>
        <div className="mt-8 rounded-[12px] border border-dashed border-silver bg-surface px-6 py-10">
          <p className="text-[16px] font-semibold">Mục này đang được dựng</p>
          <p className="mt-2 max-w-[58ch] text-[15px] leading-relaxed text-muted">
            Giai đoạn 2 đang làm theo thứ tự: nền giao diện, Trang chủ và Điểm đến
            trước, các mục còn lại ở lượt tiếp theo. Cấu trúc dữ liệu và thiết kế của
            mục này đã có sẵn trong tài liệu, chỉ còn phần dựng màn hình.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/diem-den">Xem Điểm đến</ButtonLink>
            <ButtonLink href="/" variant="ghost">
              Về trang chủ
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
