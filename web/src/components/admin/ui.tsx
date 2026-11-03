"use client";

import { useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

/* ---------- Nút ---------- */

type Variant = "primary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-primary-500 disabled:opacity-50",
  ghost: "border border-line text-ink hover:border-ink disabled:opacity-50",
  danger: "border border-ink bg-surface text-ink hover:bg-ink hover:text-white",
};

export function AdminButton({
  variant = "primary",
  loading = false,
  className,
  children,
  ...rest
}: {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] px-4 text-[14.5px] font-semibold transition-colors",
        variants[variant],
        className,
      )}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

/* ---------- Ô nhập ---------- */

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[14px] font-semibold">
        {label} {required ? <span className="text-muted">*</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-[13.5px] font-medium text-ink">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "min-h-11 w-full rounded-[8px] border border-line bg-surface px-3.5 text-[15px] outline-none transition-colors focus:border-ink";

export const textareaClass =
  "w-full rounded-[8px] border border-line bg-surface px-3.5 py-2.5 text-[15px] leading-relaxed outline-none transition-colors focus:border-ink";

/* ---------- Nhãn trạng thái ---------- */

/**
 * Trạng thái phân biệt bằng kiểu nền chứ không bằng màu, vì bảng màu chỉ có
 * các sắc độ xám — chỉ dựa vào màu thì người khó phân biệt màu sẽ không đọc
 * được. Chữ luôn ghi rõ.
 */
const statusStyles: Record<string, string> = {
  published: "bg-ink text-white",
  draft: "bg-primary-50 text-deep",
  scheduled: "border border-dashed border-muted bg-surface text-ink",
  archived: "border border-line bg-surface text-muted",
};

const statusLabels: Record<string, string> = {
  published: "Đã xuất bản",
  draft: "Bản nháp",
  scheduled: "Lên lịch",
  archived: "Lưu trữ",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold",
        statusStyles[status] ?? statusStyles.archived,
      )}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

/* ---------- Thông báo ---------- */

export type ToastKind = "success" | "error";

export function Toast({
  kind,
  message,
  onDismiss,
}: {
  kind: ToastKind;
  message: string;
  onDismiss: () => void;
}) {
  // Tự ẩn sau 4 giây; lỗi để lâu hơn một chút vì cần đọc kỹ hơn.
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, kind === "error" ? 7000 : 4000);
    return () => window.clearTimeout(timer);
  }, [kind, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex max-w-[400px] items-start gap-3 rounded-[10px] border border-line bg-surface px-4 py-3.5 shadow-[0_12px_32px_rgba(13,17,20,0.16)]"
    >
      {kind === "success" ? (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      )}
      <p className="text-[14.5px] leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-1 shrink-0 text-muted hover:text-ink"
      >
        <X size={16} aria-hidden="true" />
        <span className="sr-only">Đóng thông báo</span>
      </button>
    </div>
  );
}

/** Quản lý một thông báo tại một thời điểm — đủ cho nhu cầu của CMS. */
export function useToast() {
  const [toast, setToast] = useState<{ kind: ToastKind; message: string } | null>(null);

  return {
    toast,
    showSuccess: (message: string) => setToast({ kind: "success", message }),
    showError: (message: string) => setToast({ kind: "error", message }),
    dismiss: () => setToast(null),
  };
}

/* ---------- Hộp thoại xác nhận ---------- */

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-abyss/60 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-[460px] rounded-[12px] bg-surface p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-[19px] font-semibold">
          {title}
        </h2>
        <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{description}</p>
        <div className="mt-7 flex justify-end gap-3">
          <AdminButton variant="ghost" onClick={onCancel} disabled={loading}>
            Hủy
          </AdminButton>
          <AdminButton variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

/* ---------- Trạng thái tải và rỗng ---------- */

export function AdminLoading({ label = "Đang tải" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-muted">
      <Loader2 size={20} className="animate-spin" aria-hidden="true" />
      <span className="text-[15px]">{label}</span>
    </div>
  );
}

export function AdminEmpty({
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
      <p className="text-[17px] font-semibold">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-[48ch] text-[14.5px] leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function AdminError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-[12px] border border-line bg-surface-alt px-6 py-12 text-center"
    >
      <AlertCircle size={24} className="mx-auto" aria-hidden="true" />
      <p className="mx-auto mt-3 max-w-[52ch] text-[15px] leading-relaxed">{message}</p>
      {onRetry ? (
        <AdminButton variant="ghost" className="mt-5" onClick={onRetry}>
          Thử lại
        </AdminButton>
      ) : null}
    </div>
  );
}
