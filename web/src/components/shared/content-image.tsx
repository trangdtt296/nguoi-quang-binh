import Image from "next/image";
import clsx from "clsx";

/**
 * Ảnh nội dung.
 *
 * Khi chưa có ảnh thật (admin chưa tải lên qua CMS), hiện ô giữ chỗ màu bạc
 * kèm mô tả, thay vì ô trống hoặc ảnh vỡ. Khung có kích thước cố định để
 * layout không nhảy khi ảnh tải xong.
 *
 * Hai cách định kích thước, dùng một trong hai:
 *
 * - `ratio` — giữ tỉ lệ khung hình, chiều cao tự tính theo chiều rộng.
 *   Dùng cho card trong lưới, nơi mọi ảnh cần cao bằng nhau.
 *
 * - `height` — đặt chiều cao bằng class Tailwind, chiều rộng luôn chiếm
 *   trọn khung chứa. Dùng cho ảnh bìa lớn đầu trang.
 *
 * Đừng chặn chiều cao bằng `max-h-*` khi đang dùng `ratio`: trình duyệt
 * phải giữ tỉ lệ nên nó co luôn chiều rộng lại, và ảnh nằm nép sang trái
 * chừa khoảng trắng bên phải.
 */
export function ContentImage({
  src,
  alt,
  ratio = "16/10",
  height,
  fit = "cover",
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px",
  priority = false,
}: {
  src?: string;
  alt: string;
  ratio?: "16/9" | "16/10" | "4/3" | "1/1" | "3/2";
  /** Class chiều cao Tailwind, ví dụ "h-[300px] md:h-[460px]". Ghi đè `ratio`. */
  height?: string;
  /**
   * `cover` cắt bớt cho đầy khung — dùng cho card và ảnh bìa, nơi khung
   * phải đều nhau. `contain` hiện trọn tấm ảnh, chừa viền — dùng khi
   * người xem cần nhìn đủ cả ảnh, như lúc mở ảnh lớn trong thư viện.
   */
  fit?: "cover" | "contain";
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const ratioClass = {
    "16/9": "aspect-video",
    "16/10": "aspect-[16/10]",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
    "3/2": "aspect-[3/2]",
  }[ratio];

  const sizeClass = height ? clsx("w-full", height) : ratioClass;

  if (!src) {
    return (
      <div
        className={clsx(
          "relative flex items-end overflow-hidden bg-gradient-to-br from-silver-50 to-silver",
          sizeClass,
          className,
        )}
      >
        <span className="m-2 rounded bg-white/85 px-2 py-1 text-[11px] text-muted">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className={clsx("relative overflow-hidden bg-silver-50", sizeClass, className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={fit === "contain" ? "object-contain" : "object-cover"}
      />
    </div>
  );
}
