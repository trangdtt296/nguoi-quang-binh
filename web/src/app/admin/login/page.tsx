"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { LogoMark } from "@/components/layout/logo";
import { AdminButton, Field, inputClass } from "@/components/admin/ui";
import { useAuth } from "@/lib/admin/auth-context";
import { ApiError } from "@/lib/admin/api-client";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [failMessage, setFailMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Đã đăng nhập rồi thì không cần ở lại trang này.
  useEffect(() => {
    if (!loading && user) router.replace("/admin");
  }, [loading, user, router]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFailMessage("");

    const found: typeof errors = {};
    if (!email.trim()) found.email = "Vui lòng nhập email";
    if (!password) found.password = "Vui lòng nhập mật khẩu";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/admin");
    } catch (error) {
      setFailMessage(
        error instanceof ApiError
          ? error.message
          : "Không đăng nhập được, vui lòng thử lại",
      );
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-abyss p-5">
      <div className="w-full max-w-[420px]">
        <div className="mb-7 flex flex-col items-center text-center text-white">
          <LogoMark size={44} />
          <h1 className="mt-4 text-[20px] font-bold tracking-[0.02em]">
            NGƯỜI QUẢNG BÌNH
          </h1>
          <p className="mt-1 text-[14px] text-silver">Quản trị nội dung</p>
        </div>

        <form
          onSubmit={submit}
          noValidate
          className="flex flex-col gap-5 rounded-[12px] bg-surface p-7"
        >
          {failMessage ? (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-[8px] border border-line bg-surface-alt px-4 py-3"
            >
              <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-[14px] leading-relaxed">{failMessage}</p>
            </div>
          ) : null}

          <Field label="Email" htmlFor="login-email" error={errors.email} required>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((current) => ({ ...current, email: undefined }));
              }}
              aria-invalid={Boolean(errors.email)}
              className={inputClass}
            />
          </Field>

          <Field
            label="Mật khẩu"
            htmlFor="login-password"
            error={errors.password}
            required
          >
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((current) => ({ ...current, password: undefined }));
              }}
              aria-invalid={Boolean(errors.password)}
              className={inputClass}
            />
          </Field>

          <AdminButton type="submit" loading={submitting} className="mt-1 min-h-12">
            {submitting ? "Đang đăng nhập" : "Đăng nhập"}
          </AdminButton>

          <p className="text-[13px] leading-relaxed text-muted">
            Sai quá 5 lần, hệ thống sẽ tạm khóa đăng nhập trong 15 phút để chặn dò
            mật khẩu.
          </p>
        </form>

        <p className="mt-6 text-center text-[13.5px] text-silver">
          <Link href="/" className="underline underline-offset-4 hover:text-white">
            Quay về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
