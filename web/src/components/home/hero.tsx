import { ButtonLink } from "@/components/ui";

/**
 * Hero trang chủ. Nền là tranh vẽ bằng SVG (không phải ảnh) nên tải tức thì
 * và không phụ thuộc vào việc admin đã tải ảnh bìa lên hay chưa.
 */
export function Hero({ slogan }: { slogan: string }) {
  return (
    <section className="relative overflow-hidden bg-abyss text-white">
      <svg
        viewBox="0 0 1440 620"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d1114" />
            <stop offset="60%" stopColor="#1b2227" />
            <stop offset="100%" stopColor="#2b3339" />
          </linearGradient>
        </defs>
        <rect width="1440" height="620" fill="url(#hero-sky)" />
        <circle cx="1180" cy="130" r="48" fill="#c3ccd2" opacity="0.26" />
        <path d="M0 430 L170 300 L300 400 L430 268 L600 430 Z" fill="#0d1114" opacity="0.75" />
        <path d="M360 460 L540 300 L700 420 L860 250 L1040 460 Z" fill="#15191d" opacity="0.85" />
        <path
          d="M900 470 L1080 330 L1240 440 L1440 320 L1440 620 L900 620 Z"
          fill="#1c2126"
          opacity="0.9"
        />
        <path
          d="M0 520 Q360 490 720 520 T1440 520 L1440 620 L0 620 Z"
          fill="#39454d"
          opacity="0.6"
        />
      </svg>

      <div className="container-page relative py-24 md:py-32">
        <p className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-silver">
          Vương quốc hang động · Biển Nhật Lệ · Phong Nha — Kẻ Bàng
        </p>
        <h1 className="max-w-[16ch] font-serif text-[40px] font-semibold leading-[1.08] tracking-[-0.015em] md:text-[62px]">
          {slogan}
        </h1>
        <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-silver md:text-[19px]">
          Nơi lưu giữ và lan tỏa hình ảnh Quảng Bình — từ lòng hang sâu nhất thế giới
          đến bát cháo hàu bên sông Nhật Lệ.
        </p>
        <div className="mt-8 flex flex-wrap gap-3.5">
          <ButtonLink href="/diem-den" variant="light">
            Khám phá điểm đến
          </ButtonLink>
          <ButtonLink
            href="/van-hoa"
            variant="ghost"
            className="border-white/45 text-white hover:border-white"
          >
            Đọc câu chuyện
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
