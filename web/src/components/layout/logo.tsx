import Link from "next/link";
import clsx from "clsx";

/**
 * Biểu trưng: vòm hang mở ra đường chân trời biển, vẽ bằng nét liền một màu
 * để chạy tốt ở cả kích thước avatar Facebook lẫn header website.
 */
export function LogoMark({
  size = 34,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 34"
      className={className}
      role="img"
      aria-label="Biểu trưng Người Quảng Bình"
    >
      <circle cx="17" cy="17" r="16" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 22 Q11 9 17 17 Q23 25 29 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path d="M5 26 H29" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({
  className,
  markSize = 34,
}: {
  className?: string;
  markSize?: number;
}) {
  return (
    <Link href="/" className={clsx("flex items-center gap-2.5", className)}>
      <LogoMark size={markSize} />
      <span className="text-[17px] font-bold leading-tight tracking-[0.02em]">
        NGƯỜI QUẢNG BÌNH
      </span>
    </Link>
  );
}
