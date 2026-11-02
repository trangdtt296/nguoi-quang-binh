import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col justify-center py-20">
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
        Lỗi 404
      </p>
      <h1 className="mt-3 font-serif text-[36px] font-semibold leading-tight md:text-[48px]">
        Không tìm thấy trang này
      </h1>
      <p className="mt-4 max-w-[56ch] text-[17px] leading-relaxed text-muted">
        Có thể đường dẫn đã thay đổi, hoặc nội dung đã được gỡ. Bạn thử quay về trang
        chủ hoặc xem danh sách điểm đến.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/">Về trang chủ</ButtonLink>
        <ButtonLink href="/diem-den" variant="ghost">
          Khám phá điểm đến
        </ButtonLink>
      </div>
    </div>
  );
}
