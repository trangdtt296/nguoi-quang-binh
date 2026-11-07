"use client";

import type { ComponentProps } from "react";
import clsx from "clsx";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { FIELD_LIMITS as F } from "@/lib/field-limits";
import { API_URL, getErrorMessage, networkError, parseResponse } from "@/lib/http";

/** Số điện thoại Việt Nam: 10 số, bắt đầu bằng 0. Khoảng trắng và dấu chấm được bỏ qua. */
const PHONE_PATTERN = /^0\d{9}$/;

const LIMITS = {
  fullName: F.personName,
  email: F.email,
  phone: F.phone,
  subject: F.contactSubject,
  message: F.contactMessage,
};

const schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ tên")
    .min(LIMITS.fullName.min, "Họ tên quá ngắn")
    .max(LIMITS.fullName.max, "Họ tên quá dài"),
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ")
    .max(LIMITS.email.max, "Email quá dài"),
  phone: z
    .string()
    .transform((value) => value.replace(/[\s.]/g, ""))
    .refine(
      (value) => !value || PHONE_PATTERN.test(value),
      "Số điện thoại phải có 10 chữ số, bắt đầu bằng 0",
    ),
  subject: z.string().trim().max(LIMITS.subject.max, "Tiêu đề quá dài"),
  message: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập nội dung")
    .min(LIMITS.message.min, "Nội dung cần ít nhất 10 ký tự")
    .max(LIMITS.message.max, "Nội dung quá dài"),
});

type ContactValues = z.infer<typeof schema>;

/** Thuộc tính minLength/maxLength cho từng ô, lấy từ LIMITS. */
const LIMIT_PROPS = {
  fullName: { minLength: LIMITS.fullName.min, maxLength: LIMITS.fullName.max },
  email: { maxLength: LIMITS.email.max },
  phone: { maxLength: LIMITS.phone.max },
  subject: { maxLength: LIMITS.subject.max },
};

const EMPTY: ContactValues = { fullName: "", email: "", phone: "", subject: "", message: "" };

const FALLBACK_ERROR = "Không gửi được, bạn thử lại sau ít phút nhé";

async function sendContactMessage(values: ContactValues) {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        phone: values.phone || undefined,
        subject: values.subject || undefined,
      }),
    });
  } catch {
    throw networkError();
  }
  return parseResponse(response, FALLBACK_ERROR);
}

/**
 * Form liên hệ.
 *
 * Validate hai lần: ở đây để báo lỗi ngay cho người dùng, và ở server để
 * chặn dữ liệu xấu — người ta có thể gửi thẳng vào API mà không qua form này.
 *
 * Tin nhắn được lưu vào database cho quản trị viên đọc trong CMS, không gửi
 * email, vì Render gói free chặn cổng SMTP (xem docs/02-kien-truc.md).
 */
export function ContactForm() {
  // react-hook-form tự đưa con trỏ về ô lỗi đầu tiên khi bấm gửi.
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ContactValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  const send = useMutation({
    mutationFn: sendContactMessage,
    onSuccess: () => reset(EMPTY),
  });

  const messageLength = useWatch({ control, name: "message" }).trim().length;
  const sending = send.isPending;

  if (send.isSuccess) {
    return (
      <div className="rounded-[12px] border border-line bg-surface-alt p-8 text-center">
        <CheckCircle2 size={36} className="mx-auto text-ink" aria-hidden="true" />
        <p className="mt-4 text-[18px] font-semibold">Đã nhận được tin nhắn của bạn</p>
        <p className="mx-auto mt-2 max-w-[44ch] text-[15px] leading-relaxed text-muted">
          Cảm ơn bạn đã gửi. Chúng mình sẽ đọc và phản hồi qua email khi cần.
        </p>
        <button
          type="button"
          onClick={() => send.reset()}
          className="mt-6 inline-flex min-h-11 items-center rounded-[8px] border border-line px-5 text-[14.5px] font-semibold transition-colors hover:border-ink"
        >
          Gửi tin nhắn khác
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((values) => send.mutate(values))}
      noValidate
      className="flex flex-col gap-5"
    >
      {send.isError ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[10px] border border-line bg-surface-alt px-4 py-3.5"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-[14.5px] leading-relaxed">
            {getErrorMessage(send.error, FALLBACK_ERROR)}
          </p>
        </div>
      ) : null}

      <TextField
        id="contact-fullName"
        label="Họ và tên"
        required
        error={errors.fullName?.message}
        disabled={sending}
        registration={register("fullName")}
        {...LIMIT_PROPS.fullName}
      />

      <div className="flex flex-wrap gap-5">
        <div className="min-w-[220px] flex-1">
          <TextField
            id="contact-email"
            label="Email"
            type="email"
            required
            error={errors.email?.message}
            disabled={sending}
            registration={register("email")}
            {...LIMIT_PROPS.email}
          />
        </div>
        <div className="min-w-[220px] flex-1">
          <TextField
            id="contact-phone"
            label="Số điện thoại"
            type="tel"
            hint="Không bắt buộc"
            error={errors.phone?.message}
            disabled={sending}
            registration={register("phone")}
            {...LIMIT_PROPS.phone}
          />
        </div>
      </div>

      <TextField
        id="contact-subject"
        label="Tiêu đề"
        hint="Không bắt buộc"
        error={errors.subject?.message}
        disabled={sending}
        registration={register("subject")}
        {...LIMIT_PROPS.subject}
      />

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-[14px] font-semibold">
          Nội dung <span className="text-muted">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={6}
          disabled={sending}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={clsx(
            "w-full rounded-[8px] border bg-surface px-4 py-3 text-[15px] leading-relaxed outline-none transition-colors",
            errors.message ? "border-ink" : "border-line focus:border-ink",
            sending && "opacity-60",
          )}
          minLength={LIMITS.message.min}
          maxLength={LIMITS.message.max}
          {...register("message")}
        />
        <div className="mt-1.5 flex justify-between gap-4">
          {errors.message ? (
            <p id="contact-message-error" className="text-[13.5px] font-medium text-ink">
              {errors.message.message}
            </p>
          ) : (
            <span />
          )}
          <span className="shrink-0 text-[13px] text-muted">{messageLength} / {LIMITS.message.max}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-ink px-6 text-[15px] font-semibold text-white transition-colors hover:bg-primary-500 disabled:opacity-60 sm:w-auto sm:self-start"
      >
        {sending ? (
          <>
            <Loader2 size={17} className="animate-spin" aria-hidden="true" />
            Đang gửi
          </>
        ) : (
          "Gửi tin nhắn"
        )}
      </button>

      <p className="text-[13.5px] leading-relaxed text-muted">
        Chúng mình chỉ dùng thông tin bạn gửi để trả lời đúng tin nhắn này, không dùng vào việc
        gì khác và không chia sẻ cho bên thứ ba.
      </p>
    </form>
  );
}

function TextField({
  id,
  label,
  error,
  required = false,
  hint,
  registration,
  ...inputProps
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  registration: UseFormRegisterReturn;
} & Pick<ComponentProps<"input">, "type" | "disabled" | "minLength" | "maxLength">) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-semibold">
        {label}{" "}
        {required ? (
          <span className="text-muted">*</span>
        ) : hint ? (
          <span className="font-normal text-muted">({hint})</span>
        ) : null}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={clsx(
          "min-h-12 w-full rounded-[8px] border bg-surface px-4 text-[15px] outline-none transition-colors",
          error ? "border-ink" : "border-line focus:border-ink",
          inputProps.disabled && "opacity-60",
        )}
        {...inputProps}
        {...registration}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[13.5px] font-medium text-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}
