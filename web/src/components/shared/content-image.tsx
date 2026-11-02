import Image from "next/image";
import clsx from "clsx";

/**
 * Ảnh nội dung.
 *
 * Khi chưa có ảnh thật (admin chưa tải lên qua CMS), hiện ô giữ chỗ màu bạc
 * kèm mô tả, thay vì ô trống hoặc ảnh vỡ. Tỉ lệ khung cố định để layout
 * không nhảy khi ảnh tải xong.
 */
export function ContentImage({
  src,
  alt,
  ratio = "16/10",
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px",
  priority = false,
}: {
  src?: string;
  alt: string;
  ratio?: "16/9" | "16/10" | "4/3" | "1/1" | "3/2";
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

  if (!src) {
    return (
      <div
        className={clsx(
          "relative flex items-end overflow-hidden bg-gradient-to-br from-silver-50 to-silver",
          ratioClass,
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
    <div className={clsx("relative overflow-hidden bg-silver-50", ratioClass, className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
