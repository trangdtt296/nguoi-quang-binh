import { z } from "zod";
import type { FieldErrors } from "react-hook-form";
import type { ContentStatus } from "./types";
import { FIELD_LIMITS, type Limit } from "@/lib/field-limits";

export type { Limit };

/*
 * Mảnh ghép cho schema zod và cho việc đổi giá trị form thành dữ liệu gửi
 * lên API. Form luôn làm việc với chuỗi (ô nhập trả về chuỗi), còn API cần
 * null, số và ISO — chuyển đổi gom ở đây để các form không tự viết lại.
 */

/* ---------- Schema ---------- */

export const CONTENT_STATUSES = ["draft", "published", "scheduled", "archived"] as const;

/**
 * Bảng giới hạn của một form, theo tên trường. Giá trị lấy từ
 * lib/field-limits.ts và dùng cho cả schema zod lẫn minLength/maxLength
 * của ô nhập.
 */
export type FieldLimits = Record<string, Limit>;

export const tooLong = (max: number) => `Tối đa ${max} ký tự`;

/** Giới hạn SEO dùng chung cho mọi loại nội dung. */
export const SEO_LIMITS = {
  seoTitle: FIELD_LIMITS.seoTitle,
  seoDescription: FIELD_LIMITS.seoDescription,
} satisfies FieldLimits;

/** Chuỗi không bắt buộc, đã cắt khoảng trắng hai đầu, có thể giới hạn độ dài. */
export function text(limit: Limit = {}, message?: string) {
  const base = z.string().trim();
  return limit.max === undefined ? base : base.max(limit.max, message ?? tooLong(limit.max));
}

/** Bắt buộc nhập, với độ dài tối thiểu và tối đa theo `limit`. */
export function requiredText(emptyMessage: string, limit: Limit = {}, shortMessage = emptyMessage) {
  const base = z.string().trim().min(1, emptyMessage).min(limit.min ?? 1, shortMessage);
  return limit.max === undefined ? base : base.max(limit.max, tooLong(limit.max));
}

function isUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function optionalUrl(message: string) {
  return z
    .string()
    .trim()
    .refine((value) => !value || isUrl(value), message);
}

/** Ô số để trống được; nếu điền thì phải là số trong khoảng cho phép. */
export function optionalNumber({
  min,
  max,
  integer = false,
  message,
}: {
  min: number;
  max?: number;
  integer?: boolean;
  message: string;
}) {
  return z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true;
      const parsed = Number(value);
      const isValidNumber = integer ? Number.isInteger(parsed) : Number.isFinite(parsed);
      return isValidNumber && parsed >= min && (max === undefined || parsed <= max);
    }, message);
}

export const seoFields = {
  seoTitle: text(SEO_LIMITS.seoTitle),
  seoDescription: text(SEO_LIMITS.seoDescription),
};

export const publishFields = {
  status: z.enum(CONTENT_STATUSES),
  publishedAt: z.string(),
};

/** Lên lịch thì phải có ngày giờ xuất bản. */
export function refineSchedule(
  values: { status: ContentStatus; publishedAt: string },
  ctx: z.RefinementCtx,
) {
  if (values.status === "scheduled" && !values.publishedAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["publishedAt"],
      message: "Chọn thời điểm xuất bản khi đặt lịch",
    });
  }
}

/** `end` (nếu có) không được trước `start`. */
export function refineDateOrder(
  start: string,
  end: string,
  ctx: z.RefinementCtx,
  { path, message }: { path: string; message: string },
) {
  if (start && end && new Date(end) < new Date(start)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
  }
}

/* ---------- Đổi giá trị form sang dữ liệu API ---------- */

export const orNull = (value: string) => value || null;
export const toNumberOrNull = (value: string) => (value ? Number(value) : null);
export const toIsoOrNull = (local: string) => (local ? new Date(local).toISOString() : null);

/** Chuyển chuỗi ISO sang định dạng mà ô datetime-local hiểu được. */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Các trường SEO và xuất bản có ở hầu hết loại nội dung. */
export function seoPublishPayload(values: {
  status: ContentStatus;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
}) {
  return {
    status: values.status,
    publishedAt: toIsoOrNull(values.publishedAt),
    seoTitle: orNull(values.seoTitle),
    seoDescription: orNull(values.seoDescription),
  };
}

export function seoPublishDefaults(record?: {
  status: ContentStatus;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}) {
  return {
    status: record?.status ?? ("draft" as ContentStatus),
    publishedAt: toLocalInput(record?.publishedAt),
    seoTitle: record?.seoTitle ?? "",
    seoDescription: record?.seoDescription ?? "",
  };
}

/* ---------- Tab ---------- */

/**
 * Lỗi có thể nằm ở tab đang đóng — trả về tab đầu tiên chứa lỗi để mở ra.
 * Tab nào không khai báo trường thì không bao giờ được chọn.
 */
export function firstTabWithError<T extends string>(
  errors: FieldErrors,
  tabFields: Partial<Record<T, readonly string[]>>,
): T | undefined {
  return (Object.keys(tabFields) as T[]).find((tab) =>
    tabFields[tab]?.some((field) => field in errors),
  );
}
