import Link from "next/link";
import clsx from "clsx";
import type { ReactNode } from "react";

/* ---------- Nút ---------- */

type ButtonVariant = "primary" | "ghost" | "light";

const buttonBase =
  "inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-[8px] text-[15px] font-semibold transition-colors";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-primary-500",
  ghost: "border border-line text-ink hover:border-ink",
  light: "bg-white text-ink hover:bg-silver-50",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={clsx(buttonBase, buttonVariants[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link
      href={href}
      className={clsx(buttonBase, buttonVariants[variant], className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

/* ---------- Nhãn ---------- */

export function Tag({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "dark";
}) {
  return (
    <span
      className={clsx(
        "inline-block rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "dark" ? "bg-ink text-white" : "bg-primary-50 text-primary-700",
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Tiêu đề khối ---------- */

export function SectionHeading({
  eyebrow,
  title,
  lede,
  action,
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  action?: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-[62ch] flex-1 basis-[420px]">
        {eyebrow ? (
          <p
            className={clsx(
              "mb-2.5 text-[13px] font-semibold uppercase tracking-[0.14em]",
              tone === "dark" ? "text-silver" : "text-deep",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={clsx(
            "text-[28px] font-bold leading-tight tracking-[-0.01em] md:text-[36px]",
            tone === "dark" ? "text-white" : "text-ink",
          )}
        >
          {title}
        </h2>
        {lede ? (
          <p
            className={clsx(
              "mt-3 text-[17px] leading-relaxed",
              tone === "dark" ? "text-silver" : "text-muted",
            )}
          >
            {lede}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/* ---------- Trạng thái ---------- */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx("animate-pulse rounded-[12px] bg-silver-50", className)}
      aria-hidden="true"
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[12px] border border-dashed border-silver bg-surface-alt px-6 py-16 text-center">
      <p className="text-lg font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-[48ch] text-[15px] leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Không tải được nội dung",
  description = "Có lỗi xảy ra khi lấy dữ liệu. Bạn thử tải lại trang xem sao.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="rounded-[12px] border border-line bg-surface-alt px-6 py-14 text-center"
    >
      <p className="text-lg font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-[48ch] text-[15px] leading-relaxed text-muted">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

/* ---------- Đường dẫn ---------- */

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Đường dẫn" className="text-[13.5px] text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {item.label}
              </span>
            )}
            {index < items.length - 1 ? (
              <span aria-hidden="true">/</span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
