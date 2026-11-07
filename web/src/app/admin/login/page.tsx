"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { LogoMark } from "@/components/layout/logo";
import { AdminButton } from "@/components/admin/ui";
import { AdminForm, FormInput } from "@/components/admin/form-fields";
import { useAuth } from "@/lib/admin/auth-context";
import { FIELD_LIMITS as F } from "@/lib/field-limits";
import { getErrorMessage } from "@/lib/http";

const schema = z.object({
  email: z.string().trim().min(1, "Vui lòng nhập email"),
  // Không cắt khoảng trắng: khoảng trắng là một phần của mật khẩu.
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginValues = z.infer<typeof schema>;

const LOGIN_LIMITS = { email: F.email, password: { max: F.password.max } };

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn } = useAuth();

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  // Đã đăng nhập rồi thì không cần ở lại trang này.
  useEffect(() => {
    if (!loading && user) router.replace("/admin");
  }, [loading, user, router]);

  const submit = async ({ email, password }: LoginValues) => {
    try {
      await signIn(email, password);
      router.replace("/admin");
    } catch (error) {
      form.resetField("password");
      form.setError("root", {
        message: getErrorMessage(error, "Không đăng nhập được, vui lòng thử lại"),
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-abyss p-5">
      <div className="w-full max-w-[420px]">
        <div className="mb-7 flex flex-col items-center text-center text-white">
          <LogoMark size={44} />
          <h1 className="mt-4 text-[20px] font-bold tracking-[0.02em]">NGƯỜI QUẢNG BÌNH</h1>
          <p className="mt-1 text-[14px] text-silver">Quản trị nội dung</p>
        </div>

        <AdminForm
          form={form}
          idPrefix="login"
          limits={LOGIN_LIMITS}
          onSubmit={submit}
          className="flex flex-col gap-5 rounded-[12px] bg-surface p-7"
        >
          {errors.root?.message ? (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-[8px] border border-line bg-surface-alt px-4 py-3"
            >
              <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-[14px] leading-relaxed">{errors.root.message}</p>
            </div>
          ) : null}

          <FormInput name="email" type="email" autoComplete="username" label="Email" required />
          <FormInput
            name="password"
            type="password"
            autoComplete="current-password"
            label="Mật khẩu"
            required
          />

          <AdminButton type="submit" loading={isSubmitting} className="mt-1 min-h-12">
            {isSubmitting ? "Đang đăng nhập" : "Đăng nhập"}
          </AdminButton>

          <p className="text-[13px] leading-relaxed text-muted">
            Sai quá 5 lần, hệ thống sẽ tạm khóa đăng nhập trong 15 phút để chặn dò mật khẩu.
          </p>
        </AdminForm>

        <p className="mt-6 text-center text-[13.5px] text-silver">
          <Link href="/" className="underline underline-offset-4 hover:text-white">
            Quay về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
