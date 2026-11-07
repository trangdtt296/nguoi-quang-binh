"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  useWatch,
  type DefaultValues,
  type FieldValues,
} from "react-hook-form";
import type { z } from "zod";
import { AdminButton, useToast } from "./ui";
import { FormCheckbox, FormInput, FormSelect, FormTextarea } from "./form-fields";
import { useAuth } from "@/lib/admin/auth-context";
import { useSaveMutation } from "@/lib/admin/queries";
import { FIELD_LIMITS as F } from "@/lib/field-limits";
import { getErrorMessage } from "@/lib/http";

/**
 * Các mảnh dùng chung cho form nội dung.
 *
 * Bài viết, điểm đến, ẩm thực, sự kiện, khóa học và album đều có cùng một
 * bộ phần: thanh đầu trang, ảnh bìa, SEO, xuất bản, và cùng một luồng lưu.
 * Tách ra để sửa một lần là tất cả đổi theo, nhưng vẫn để mỗi form tự lắp
 * theo nhu cầu riêng thay vì nhét hết vào một component vạn năng.
 */

/* ---------- Luồng lưu ---------- */

/**
 * Tạo form và luồng lưu chung: tạo mới xong thì chuyển sang trang sửa, sửa
 * xong thì giữ nguyên trang và đánh dấu form là "đã lưu".
 */
export function useResourceForm<TValues extends FieldValues, TRecord extends { id: string }>({
  endpoint,
  record,
  schema,
  defaultValues,
  toPayload,
  createdMessage,
}: {
  /** Đường dẫn API, đồng thời là đường dẫn trang quản trị, ví dụ "/admin/foods". */
  endpoint: string;
  record?: TRecord;
  schema: z.ZodType<TValues, z.ZodTypeDef, TValues>;
  defaultValues: DefaultValues<TValues>;
  toPayload: (values: TValues) => unknown;
  createdMessage: string;
}) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const form = useForm<TValues>({ resolver: zodResolver(schema), defaultValues });
  const save = useSaveMutation<TRecord>(endpoint, record?.id);

  const onSubmit = (values: TValues) =>
    save.mutate(toPayload(values), {
      onSuccess: (saved) => {
        if (record) {
          showSuccess("Đã lưu thay đổi");
          // Giá trị vừa lưu thành mốc mới, để form không còn bị coi là "đã sửa".
          form.reset(values);
        } else {
          showSuccess(createdMessage);
          router.replace(`${endpoint}/${saved.id}/edit`);
        }
      },
      onError: (error) => showError(getErrorMessage(error, "Không lưu được")),
    });

  return { form, onSubmit, saving: save.isPending };
}

/* ---------- Thanh đầu trang ---------- */

export function FormHeader({
  title,
  backHref,
  previewPath,
  saving,
  saveLabel,
}: {
  title: string;
  backHref: string;
  /** Có thì hiện nút xem trên website, dựng từ đường dẫn đang nhập. */
  previewPath?: (slug: string) => string;
  saving: boolean;
  saveLabel: string;
}) {
  const slug = useWatch({ name: "slug", disabled: !previewPath });

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
        {previewPath ? (
          <Link
            href={previewPath(slug ?? "")}
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

/* ---------- Tab SEO ---------- */

export function SeoTab({
  titleField,
  fallbackField,
  publicPath,
}: {
  /** Trường tiêu đề thật của nội dung, dùng cho khung xem trước. */
  titleField: string;
  /** Trường mô tả ngắn, dùng khi chưa điền mô tả SEO. */
  fallbackField: string;
  publicPath: (slug: string) => string;
}) {
  const [title, fallback, slug, seoTitle, seoDescription] = useWatch({
    name: [titleField, fallbackField, "slug", "seoTitle", "seoDescription"],
  }) as string[];

  return (
    <div className="flex max-w-[720px] flex-col gap-5">
      <FormInput
        name="seoTitle"
        label="Tiêu đề SEO"
        hint={`Để trống thì dùng tiêu đề chính. Tối đa ${F.seoTitle.max} ký tự; Google cắt ở khoảng 60.`}
      />

      <FormTextarea
        name="seoDescription"
        label="Mô tả SEO"
        hint={(length) =>
          `Hiện dưới tiêu đề trên Google và khi chia sẻ Facebook. ${length}/${F.seoDescription.max} ký tự, nên viết khoảng 150.`
        }
      />

      <div className="rounded-[12px] border border-line bg-surface-alt p-5">
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.05em] text-muted">
          Xem trước trên Google
        </p>
        <p className="text-[13px] text-muted">nguoiquangbinh.vn{publicPath(slug ?? "")}</p>
        <p className="mt-1 text-[18px] font-medium text-deep">
          {seoTitle || title || "Tiêu đề nội dung"}
        </p>
        <p className="mt-1 max-w-[60ch] text-[14px] leading-relaxed text-muted">
          {seoDescription ||
            fallback ||
            "Mô tả sẽ hiện ở đây. Chưa điền thì Google tự lấy một đoạn trong nội dung."}
        </p>
      </div>
    </div>
  );
}

/* ---------- Tab xuất bản ---------- */

const ADMIN_STATUS_OPTIONS = [
  { value: "draft", label: "Bản nháp — chỉ mình thấy" },
  { value: "published", label: "Xuất bản — hiện trên website" },
  { value: "scheduled", label: "Lên lịch — tự hiện khi tới giờ" },
  { value: "archived", label: "Lưu trữ — ẩn khỏi website" },
];

export function PublishTab({
  featured,
  children,
}: {
  /** Bỏ qua khi loại nội dung không có cờ nổi bật. */
  featured?: { label: string; hint: string };
  children?: ReactNode;
}) {
  const { isAdmin } = useAuth();

  return (
    <div className="flex max-w-[640px] flex-col gap-5">
      <FormSelect
        name="status"
        label="Trạng thái"
        options={isAdmin ? ADMIN_STATUS_OPTIONS : ADMIN_STATUS_OPTIONS.slice(0, 1)}
      />

      {!isAdmin ? (
        <p className="rounded-[8px] border border-line bg-surface-alt px-4 py-3 text-[14px] leading-relaxed text-muted">
          Tài khoản cộng tác viên chỉ lưu được bản nháp. Quản trị viên sẽ duyệt và xuất bản.
        </p>
      ) : null}

      <FormInput
        name="publishedAt"
        type="datetime-local"
        label="Thời điểm xuất bản"
        hint="Để trống thì lấy thời điểm bấm Xuất bản. Đặt ngày giờ tương lai kèm trạng thái Lên lịch thì nội dung tự hiện khi tới giờ."
      />

      {isAdmin && featured ? (
        <FormCheckbox name="isFeatured" label={featured.label} hint={featured.hint} />
      ) : null}

      {children}
    </div>
  );
}

/** Lời nhắn cho tab cần lưu bản ghi trước mới dùng được (bài học, ảnh album). */
export function SaveFirstNote({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-[60ch] rounded-[8px] border border-line bg-surface-alt px-4 py-3 text-[14px] leading-relaxed text-muted">
      {children}
    </p>
  );
}
