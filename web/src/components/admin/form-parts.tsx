"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft, ExternalLink, ImagePlus, X } from "lucide-react";
import { AdminButton, Field, inputClass, textareaClass } from "./ui";
import { MediaPicker } from "./media-picker";
import type { ContentStatus } from "@/lib/admin/types";

/**
 * Các mảnh dùng chung cho form nội dung.
 *
 * Bài viết, điểm đến, ẩm thực, sự kiện, khóa học và album đều có cùng một
 * bộ phần: thanh đầu trang, tab, ảnh bìa, SEO, xuất bản. Tách ra để sửa
 * một lần là tất cả đổi theo, nhưng vẫn để mỗi form tự lắp theo nhu cầu
 * riêng thay vì nhét hết vào một component vạn năng.
 */

export function FormHeader({
  title,
  backHref,
  previewHref,
  saving,
  saveLabel,
}: {
  title: string;
  backHref: string;
  /** Có liên kết này thì hiện nút xem trên website. */
  previewHref?: string;
  saving: boolean;
  saveLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-line transition-colors hover:border-ink"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          <span className="sr-only">Quay lại danh sách</span>
        </Link>
        <h1 className="text-[24px] font-bold">{title}</h1>
      </div>

      <div className="flex flex-wrap gap-3">
        {previewHref ? (
          <Link
            href={previewHref}
            target="_blank"
            className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-line px-4 text-[14.5px] font-semibold transition-colors hover:border-ink"
          >
            <ExternalLink size={15} aria-hidden="true" />
            Xem trên website
          </Link>
        ) : null}
        <AdminButton type="submit" loading={saving}>
          {saving ? "Đang lưu" : saveLabel}
        </AdminButton>
      </div>
    </div>
  );
}

export function FormTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: [T, string][];
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
            active === key
              ? "border-ink text-ink"
              : "border-transparent text-muted hover:text-ink",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function CoverImagePanel({
  value,
  onChange,
  label = "Ảnh bìa",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="rounded-[12px] border border-line bg-surface p-5">
      <h2 className="mb-4 text-[15px] font-semibold">{label}</h2>

      {value ? (
        <>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={`${label} đã chọn`}
              className="aspect-video w-full rounded-[8px] object-cover"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-abyss/80 text-white"
            >
              <X size={15} aria-hidden="true" />
              <span className="sr-only">Bỏ {label.toLowerCase()}</span>
            </button>
          </div>
          <AdminButton
            variant="ghost"
            className="mt-3 w-full"
            onClick={() => setPickerOpen(true)}
          >
            Đổi ảnh khác
          </AdminButton>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed border-silver text-muted transition-colors hover:border-ink hover:text-ink"
        >
          <ImagePlus size={20} aria-hidden="true" />
          <span className="text-[13.5px]">Chọn {label.toLowerCase()}</span>
        </button>
      )}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media) => {
          onChange(media.url);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

export function SeoTab({
  idPrefix,
  title,
  seoTitle,
  seoDescription,
  fallbackDescription,
  publicPath,
  error,
  onChange,
}: {
  idPrefix: string;
  /** Tiêu đề thật của nội dung, dùng cho khung xem trước. */
  title: string;
  seoTitle: string;
  seoDescription: string;
  fallbackDescription: string;
  publicPath: string;
  error?: string;
  onChange: (field: "seoTitle" | "seoDescription", value: string) => void;
}) {
  return (
    <div className="flex max-w-[720px] flex-col gap-5">
      <Field
        label="Tiêu đề SEO"
        htmlFor={`${idPrefix}-seo-title`}
        hint="Để trống thì dùng tiêu đề chính. Nên dưới 60 ký tự để Google không cắt."
      >
        <input
          id={`${idPrefix}-seo-title`}
          value={seoTitle}
          onChange={(event) => onChange("seoTitle", event.target.value)}
          className={inputClass}
        />
      </Field>

      <Field
        label="Mô tả SEO"
        htmlFor={`${idPrefix}-seo-description`}
        error={error}
        hint={`Hiện dưới tiêu đề trên Google và khi chia sẻ Facebook. ${seoDescription.length}/320 ký tự, nên viết khoảng 150.`}
      >
        <textarea
          id={`${idPrefix}-seo-description`}
          rows={3}
          value={seoDescription}
          onChange={(event) => onChange("seoDescription", event.target.value)}
          aria-invalid={Boolean(error)}
          className={textareaClass}
        />
      </Field>

      <div className="rounded-[12px] border border-line bg-surface-alt p-5">
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.05em] text-muted">
          Xem trước trên Google
        </p>
        <p className="text-[13px] text-muted">nguoiquangbinh.vn{publicPath}</p>
        <p className="mt-1 text-[18px] font-medium text-deep">
          {seoTitle || title || "Tiêu đề nội dung"}
        </p>
        <p className="mt-1 max-w-[60ch] text-[14px] leading-relaxed text-muted">
          {seoDescription ||
            fallbackDescription ||
            "Mô tả sẽ hiện ở đây. Chưa điền thì Google tự lấy một đoạn trong nội dung."}
        </p>
      </div>
    </div>
  );
}

export function PublishTab({
  idPrefix,
  status,
  publishedAt,
  isFeatured,
  featuredLabel,
  featuredHint,
  isAdmin,
  error,
  onChangeStatus,
  onChangePublishedAt,
  onChangeFeatured,
  children,
}: {
  idPrefix: string;
  status: ContentStatus;
  publishedAt: string;
  /** Bỏ qua phần nổi bật khi loại nội dung không có cờ này. */
  isFeatured?: boolean;
  featuredLabel?: string;
  featuredHint?: string;
  isAdmin: boolean;
  error?: string;
  onChangeStatus: (status: ContentStatus) => void;
  onChangePublishedAt: (value: string) => void;
  onChangeFeatured?: (value: boolean) => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex max-w-[640px] flex-col gap-5">
      <Field label="Trạng thái" htmlFor={`${idPrefix}-status`}>
        <select
          id={`${idPrefix}-status`}
          value={status}
          onChange={(event) => onChangeStatus(event.target.value as ContentStatus)}
          className={inputClass}
        >
          <option value="draft">Bản nháp — chỉ mình thấy</option>
          {isAdmin ? (
            <>
              <option value="published">Xuất bản — hiện trên website</option>
              <option value="scheduled">Lên lịch — tự hiện khi tới giờ</option>
              <option value="archived">Lưu trữ — ẩn khỏi website</option>
            </>
          ) : null}
        </select>
      </Field>

      {!isAdmin ? (
        <p className="rounded-[8px] border border-line bg-surface-alt px-4 py-3 text-[14px] leading-relaxed text-muted">
          Tài khoản cộng tác viên chỉ lưu được bản nháp. Quản trị viên sẽ duyệt và
          xuất bản.
        </p>
      ) : null}

      <Field
        label="Thời điểm xuất bản"
        htmlFor={`${idPrefix}-published-at`}
        error={error}
        hint="Để trống thì lấy thời điểm bấm Xuất bản. Đặt ngày giờ tương lai kèm trạng thái Lên lịch thì nội dung tự hiện khi tới giờ."
      >
        <input
          id={`${idPrefix}-published-at`}
          type="datetime-local"
          value={publishedAt}
          onChange={(event) => onChangePublishedAt(event.target.value)}
          aria-invalid={Boolean(error)}
          className={inputClass}
        />
      </Field>

      {isAdmin && onChangeFeatured ? (
        <label className="flex items-start gap-3 rounded-[8px] border border-line bg-surface p-4">
          <input
            type="checkbox"
            checked={Boolean(isFeatured)}
            onChange={(event) => onChangeFeatured(event.target.checked)}
            className="mt-0.5 h-4 w-4"
          />
          <span>
            <span className="block text-[14.5px] font-semibold">
              {featuredLabel ?? "Nổi bật"}
            </span>
            <span className="mt-0.5 block text-[13.5px] leading-relaxed text-muted">
              {featuredHint ?? "Được ưu tiên hiện ở trang chủ."}
            </span>
          </span>
        </label>
      ) : null}

      {children}
    </div>
  );
}

/** Chuyển chuỗi ISO sang định dạng mà ô datetime-local hiểu được. */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
