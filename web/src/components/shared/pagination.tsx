import Link from "next/link";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Phân trang bằng liên kết thật (không phải nút JavaScript), để trang nào
 * cũng có URL riêng — cần cho SEO và để người dùng gửi link cho nhau.
 */
export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages);

  const itemClass =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-[8px] px-3 text-[15px] font-semibold transition-colors";

  return (
    <nav aria-label="Phân trang" className="flex flex-wrap justify-center gap-2">
      {page > 1 ? (
        <Link
          href={buildHref(page - 1)}
          className={clsx(itemClass, "border border-line text-ink hover:border-ink")}
          aria-label="Trang trước"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </Link>
      ) : null}

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`gap-${i}`}
            className={clsx(itemClass, "text-muted")}
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === page ? "page" : undefined}
            className={clsx(
              itemClass,
              p === page
                ? "bg-ink text-white"
                : "border border-line text-ink hover:border-ink",
            )}
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={buildHref(page + 1)}
          className={clsx(itemClass, "border border-line text-ink hover:border-ink")}
          aria-label="Trang sau"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
      ) : null}
    </nav>
  );
}

/** Dãy số trang rút gọn: 1 … 4 5 6 … 20 */
function pageWindow(page: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const result: (number | "...")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);

  if (start > 2) result.push("...");
  for (let p = start; p <= end; p += 1) result.push(p);
  if (end < total - 1) result.push("...");
  result.push(total);

  return result;
}
