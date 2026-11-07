"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import clsx from "clsx";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { formatNumber } from "@/lib/format";
import { getErrorMessage, type PageMeta } from "@/lib/http";

/* ---------- Nút ---------- */

type Variant = "primary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-primary-500 disabled:opacity-50",
  ghost: "border border-line text-ink hover:border-ink disabled:opacity-50",
  danger: "border border-ink bg-surface text-ink hover:bg-ink hover:text-white",
};

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] px-4 text-[14.5px] font-semibold transition-colors";

export function AdminButton({
  variant = "primary",
  loading = false,
  className,
  children,
  type = "button",
  disabled,
  ...rest
}: {
  variant?: Variant;
  loading?: boolean;
} & ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={clsx(buttonBase, variants[variant], className)}
      disabled={loading || disabled}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

/** Liên kết trông như nút chính — dùng cho "Thêm mới", "Soạn bài mới". */
export function ButtonLink({ className, ...rest }: ComponentProps<typeof Link>) {
  return <Link className={clsx(buttonBase, variants.primary, className)} {...rest} />;
}

const iconButtonClass =
  "inline-flex shrink-0 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink disabled:opacity-40";

/**
 * Nút chỉ có biểu tượng. `label` vừa là tooltip vừa là chữ cho trình đọc
 * màn hình, nên không bao giờ thiếu nhãn.
 */
export function IconButton({
  label,
  title,
  size = "md",
  className,
  children,
  ...rest
}: { label: string; size?: "sm" | "md" } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      title={title ?? label}
      className={clsx(iconButtonClass, size === "sm" ? "h-8 w-8" : "h-9 w-9", className)}
      {...rest}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

export function IconLink({
  label,
  title,
  className,
  children,
  ...rest
}: { label: string } & ComponentProps<typeof Link>) {
  return (
    <Link title={title ?? label} className={clsx(iconButtonClass, "h-9 w-9", className)} {...rest}>
      {children}
      <span className="sr-only">{label}</span>
    </Link>
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
  hint?: ReactNode;
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
  "min-h-11 w-full rounded-[8px] border border-line bg-surface px-3.5 text-[15px] outline-none transition-colors focus:border-ink disabled:opacity-60";

export const textareaClass =
  "w-full rounded-[8px] border border-line bg-surface px-3.5 py-2.5 text-[15px] leading-relaxed outline-none transition-colors focus:border-ink";

/** Ô tích kèm tiêu đề và lời giải thích, dạng thẻ. */
export function CheckboxCard({
  label,
  hint,
  className,
  ...inputProps
}: { label: string; hint?: string } & Omit<ComponentProps<"input">, "type">) {
  return (
    <label
      className={clsx(
        "flex items-start gap-3 rounded-[8px] border border-line bg-surface p-4",
        className,
      )}
    >
      <input type="checkbox" className="mt-0.5 h-4 w-4" {...inputProps} />
      <span>
        <span className="block text-[14.5px] font-semibold">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-[13.5px] leading-relaxed text-muted">{hint}</span>
        ) : null}
      </span>
    </label>
  );
}

/**
 * Ô tìm kiếm: chỉ gửi từ khóa khi bấm Enter, để không gọi API sau mỗi
 * phím gõ.
 */
export function SearchBox({
  placeholder,
  onSearch,
  className,
}: {
  placeholder: string;
  onSearch: (keyword: string) => void;
  className?: string;
}) {
  const id = useId();
  const [keyword, setKeyword] = useState("");

  return (
    <form
      role="search"
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        // Ô tìm trong hộp chọn ảnh nằm bên trong form nội dung trên cây
        // React — không chặn thì Enter ở đây sẽ lưu luôn form bên ngoài.
        event.stopPropagation();
        onSearch(keyword.trim());
      }}
    >
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <div className="flex min-h-11 items-center gap-2.5 rounded-[8px] border border-line px-3.5 focus-within:border-ink">
        <Search size={16} className="shrink-0 text-muted" aria-hidden="true" />
        <input
          id={id}
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder={placeholder}
          className="min-h-10 w-full bg-transparent text-[15px] outline-none"
        />
      </div>
    </form>
  );
}

/* ---------- Bố cục ---------- */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-bold">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-[70ch] text-[14.5px] text-muted">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly (readonly [T, string])[];
  active: T;
  onChange: (tab: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-line">
      {tabs.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-current={active === key ? "true" : undefined}
          className={clsx(
            "min-h-11 border-b-2 px-4 text-[14.5px] font-semibold transition-colors",
            active === key ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Thanh phân trang. Ẩn khi chỉ có một trang. */
export function Pager({
  meta,
  unit,
  onPageChange,
  className,
}: {
  meta: PageMeta | undefined;
  /** Đơn vị đếm, ví dụ "bài", "ảnh". */
  unit: string;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className={clsx("flex flex-wrap items-center justify-between gap-4", className)}>
      <p className="text-[13.5px] text-muted">
        Trang {meta.page} / {meta.totalPages} · {formatNumber(meta.total)} {unit}
      </p>
      <div className="flex gap-2">
        <AdminButton
          variant="ghost"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft size={15} aria-hidden="true" />
          Trước
        </AdminButton>
        <AdminButton
          variant="ghost"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Sau
          <ChevronRight size={15} aria-hidden="true" />
        </AdminButton>
      </div>
    </div>
  );
}

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

export const STATUS_LABELS: Record<string, string> = {
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
      {STATUS_LABELS[status] ?? status}
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
      className="fixed bottom-6 right-6 z-[60] flex max-w-[400px] items-start gap-3 rounded-[10px] border border-line bg-surface px-4 py-3.5 shadow-[0_12px_32px_rgba(13,17,20,0.16)]"
    >
      {kind === "success" ? (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      )}
      <p className="text-[14.5px] leading-relaxed">{message}</p>
      <button type="button" onClick={onDismiss} className="ml-1 shrink-0 text-muted hover:text-ink">
        <X size={16} aria-hidden="true" />
        <span className="sr-only">Đóng thông báo</span>
      </button>
    </div>
  );
}

interface ToastApi {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/**
 * Một thông báo tại một thời điểm, đặt ở layout khu quản trị.
 *
 * Đặt ở layout chứ không ở từng trang để thông báo không mất khi chuyển
 * trang — ví dụ "Đã tạo bài viết" vẫn hiện sau khi chuyển sang trang sửa.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; kind: ToastKind; message: string } | null>(
    null,
  );
  const nextId = useRef(0);

  const show = useCallback((kind: ToastKind, message: string) => {
    nextId.current += 1;
    setToast({ id: nextId.current, kind, message });
  }, []);
  const dismiss = useCallback(() => setToast(null), []);

  const api = useMemo<ToastApi>(
    () => ({
      showSuccess: (message) => show("success", message),
      showError: (message) => show("error", message),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? (
        // key đổi theo từng thông báo để bộ đếm tự ẩn chạy lại từ đầu.
        <Toast key={toast.id} kind={toast.kind} message={toast.message} onDismiss={dismiss} />
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast phải được dùng bên trong ToastProvider");
  return context;
}

/* ---------- Hộp thoại ---------- */

/**
 * Lớp phủ và khung của mọi hộp thoại. Bấm ra ngoài hoặc Esc để đóng, nền
 * phía sau bị khóa cuộn. Nội dung tự lo bố cục bên trong.
 */
export function Modal({
  onClose,
  labelledBy,
  align = "center",
  padded = true,
  className,
  children,
}: {
  onClose: () => void;
  labelledBy?: string;
  /** "top" cho hộp thoại dài, cuộn được cả trang. */
  align?: "center" | "top";
  /** Tắt khi nội dung tự chia vùng có padding riêng. */
  padded?: boolean;
  className?: string;
  children: ReactNode;
}) {
  // Giữ hàm đóng mới nhất trong ref để không phải gắn lại listener mỗi lần render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Render ra body để hộp thoại có form không bị lồng trong form khác trên DOM.
  return createPortal(
    <div
      className={clsx(
        "fixed inset-0 z-50 flex justify-center bg-abyss/60 p-4",
        align === "top" ? "items-start overflow-y-auto" : "items-center",
      )}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={clsx(
          "w-full rounded-[12px] bg-surface",
          padded && "p-6",
          align === "top" && "my-8",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function DialogHeader({
  id,
  title,
  onClose,
}: {
  id?: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <h2 id={id} className="text-[19px] font-semibold">
        {title}
      </h2>
      <IconButton label="Đóng" onClick={onClose}>
        <X size={18} aria-hidden="true" />
      </IconButton>
    </div>
  );
}

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
  if (!open) return null;

  return (
    <Modal onClose={onCancel} labelledBy="confirm-title" className="max-w-[460px]">
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
    </Modal>
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

export function AdminError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-[12px] border border-line bg-surface-alt px-6 py-12 text-center">
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

/**
 * Hiện đang tải / lỗi / nội dung theo trạng thái của một query, để mỗi
 * màn hình không phải tự viết lại chuỗi điều kiện này.
 */
export function QueryState<T>({
  query,
  loadingLabel,
  errorMessage,
  children,
}: {
  query: {
    data: T | undefined;
    isPending: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => unknown;
  };
  loadingLabel?: string;
  /** Câu báo khi lỗi không phải từ API (mất mạng…). */
  errorMessage: string;
  children: (data: T) => ReactNode;
}) {
  if (query.isPending) return <AdminLoading label={loadingLabel} />;
  if (query.isError || query.data === undefined) {
    return (
      <AdminError
        message={getErrorMessage(query.error, errorMessage)}
        onRetry={() => void query.refetch()}
      />
    );
  }
  return <>{children(query.data)}</>;
}
