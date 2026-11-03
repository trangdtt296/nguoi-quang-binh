"use client";

import { useState, type FormEvent } from "react";
import clsx from "clsx";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type Field = "fullName" | "email" | "phone" | "subject" | "message";
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "sending" | "sent" | "failed";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Số điện thoại Việt Nam: 10 số, bắt đầu bằng 0. Khoảng trắng và dấu chấm được bỏ qua. */
const PHONE_PATTERN = /^0\d{9}$/;

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
  const [values, setValues] = useState<Record<Field, string>>({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failMessage, setFailMessage] = useState("");

  const setField = (field: Field, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    // Xóa lỗi của đúng ô vừa sửa, để người dùng thấy lỗi biến mất ngay.
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = (): Errors => {
    const found: Errors = {};

    const name = values.fullName.trim();
    if (!name) found.fullName = "Vui lòng nhập họ tên";
    else if (name.length < 2) found.fullName = "Họ tên quá ngắn";
    else if (name.length > 150) found.fullName = "Họ tên quá dài";

    const email = values.email.trim();
    if (!email) found.email = "Vui lòng nhập email";
    else if (!EMAIL_PATTERN.test(email)) found.email = "Email không hợp lệ";

    const phone = values.phone.replace(/[\s.]/g, "");
    if (phone && !PHONE_PATTERN.test(phone)) {
      found.phone = "Số điện thoại phải có 10 chữ số, bắt đầu bằng 0";
    }

    if (values.subject.trim().length > 200) found.subject = "Tiêu đề quá dài";

    const message = values.message.trim();
    if (!message) found.message = "Vui lòng nhập nội dung";
    else if (message.length < 10) found.message = "Nội dung cần ít nhất 10 ký tự";
    else if (message.length > 5000) found.message = "Nội dung quá dài";

    return found;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Đưa con trỏ về ô lỗi đầu tiên thay vì bắt người dùng tự tìm.
      const firstField = Object.keys(found)[0];
      document.getElementById(`contact-${firstField}`)?.focus();
      return;
    }

    setStatus("sending");
    setFailMessage("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("Chưa cấu hình địa chỉ API");

      const response = await fetch(`${apiUrl}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          phone: values.phone.replace(/[\s.]/g, "") || undefined,
          subject: values.subject.trim() || undefined,
          message: values.message.trim(),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.error?.message ?? "Không gửi được, bạn thử lại sau ít phút nhé",
        );
      }

      setStatus("sent");
      setValues({ fullName: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      setStatus("failed");
      setFailMessage(
        error instanceof Error
          ? error.message
          : "Không gửi được, bạn thử lại sau ít phút nhé",
      );
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-[12px] border border-line bg-surface-alt p-8 text-center">
        <CheckCircle2 size={36} className="mx-auto text-ink" aria-hidden="true" />
        <p className="mt-4 text-[18px] font-semibold">Đã nhận được tin nhắn của bạn</p>
        <p className="mx-auto mt-2 max-w-[44ch] text-[15px] leading-relaxed text-muted">
          Cảm ơn bạn đã gửi. Chúng mình sẽ đọc và phản hồi qua email khi cần.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 inline-flex min-h-11 items-center rounded-[8px] border border-line px-5 text-[14.5px] font-semibold transition-colors hover:border-ink"
        >
          Gửi tin nhắn khác
        </button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {status === "failed" ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[10px] border border-line bg-surface-alt px-4 py-3.5"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-[14.5px] leading-relaxed">{failMessage}</p>
        </div>
      ) : null}

      <TextField
        field="fullName"
        label="Họ và tên"
        required
        value={values.fullName}
        error={errors.fullName}
        disabled={sending}
        onChange={setField}
      />

      <div className="flex flex-wrap gap-5">
        <div className="min-w-[220px] flex-1">
          <TextField
            field="email"
            label="Email"
            type="email"
            required
            value={values.email}
            error={errors.email}
            disabled={sending}
            onChange={setField}
          />
        </div>
        <div className="min-w-[220px] flex-1">
          <TextField
            field="phone"
            label="Số điện thoại"
            type="tel"
            hint="Không bắt buộc"
            value={values.phone}
            error={errors.phone}
            disabled={sending}
            onChange={setField}
          />
        </div>
      </div>

      <TextField
        field="subject"
        label="Tiêu đề"
        hint="Không bắt buộc"
        value={values.subject}
        error={errors.subject}
        disabled={sending}
        onChange={setField}
      />

      <div>
        <label
          htmlFor="contact-message"
          className="mb-1.5 block text-[14px] font-semibold"
        >
          Nội dung <span className="text-muted">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={6}
          value={values.message}
          disabled={sending}
          onChange={(event) => setField("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={clsx(
            "w-full rounded-[8px] border bg-surface px-4 py-3 text-[15px] leading-relaxed outline-none transition-colors",
            errors.message ? "border-ink" : "border-line focus:border-ink",
            sending && "opacity-60",
          )}
        />
        <div className="mt-1.5 flex justify-between gap-4">
          {errors.message ? (
            <p id="contact-message-error" className="text-[13.5px] font-medium text-ink">
              {errors.message}
            </p>
          ) : (
            <span />
          )}
          <span className="shrink-0 text-[13px] text-muted">
            {values.message.trim().length} / 5000
          </span>
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
        Chúng mình chỉ dùng thông tin bạn gửi để trả lời đúng tin nhắn này, không
        dùng vào việc gì khác và không chia sẻ cho bên thứ ba.
      </p>
    </form>
  );
}

function TextField({
  field,
  label,
  value,
  error,
  type = "text",
  required = false,
  hint,
  disabled,
  onChange,
}: {
  field: Field;
  label: string;
  value: string;
  error?: string;
  type?: string;
  required?: boolean;
  hint?: string;
  disabled?: boolean;
  onChange: (field: Field, value: string) => void;
}) {
  const id = `contact-${field}`;

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
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(field, event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={clsx(
          "min-h-12 w-full rounded-[8px] border bg-surface px-4 text-[15px] outline-none transition-colors",
          error ? "border-ink" : "border-line focus:border-ink",
          disabled && "opacity-60",
        )}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[13.5px] font-medium text-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}
