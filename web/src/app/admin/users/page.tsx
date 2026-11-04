"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import {
  AdminButton,
  AdminError,
  AdminLoading,
  ConfirmDialog,
  Field,
  Toast,
  inputClass,
  useToast,
} from "@/components/admin/ui";
import { api, ApiError } from "@/lib/admin/api-client";
import { useAuth } from "@/lib/admin/auth-context";
import {
  USER_ROLE_HINTS,
  USER_ROLE_LABELS,
  type AdminAccount,
  type UserRole,
} from "@/lib/admin/types";
import { formatDate } from "@/lib/format";

const ROLES: UserRole[] = ["editor", "admin", "super_admin"];

export default function UsersPage() {
  return (
    <AdminShell>
      <UsersContent />
    </AdminShell>
  );
}

function UsersContent() {
  const { user: currentUser } = useAuth();
  const { toast, showSuccess, showError, dismiss } = useToast();

  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminAccount | null>(null);
  const [deleting, setDeleting] = useState<AdminAccount | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<AdminAccount[]>("/admin/users");
      setAccounts(data);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Không tải được danh sách tài khoản",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await api.del(`/admin/users/${deleting.id}`);
      showSuccess(`Đã xóa tài khoản ${deleting.email}`);
      setDeleting(null);
      await load();
    } catch (caught) {
      showError(
        caught instanceof ApiError ? caught.message : "Không xóa được tài khoản",
      );
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold">Tài khoản</h1>
          <p className="mt-1.5 max-w-[70ch] text-[14.5px] text-muted">
            Ai được vào khu quản trị và làm được những gì. Chỉ quản trị cấp cao thấy
            được trang này.
          </p>
        </div>
        <AdminButton onClick={() => setCreating(true)}>
          <Plus size={16} aria-hidden="true" />
          Thêm tài khoản
        </AdminButton>
      </div>

      {loading ? (
        <AdminLoading label="Đang tải tài khoản" />
      ) : error ? (
        <AdminError message={error} onRetry={load} />
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="bg-surface-alt">
                  {["Họ tên", "Email", "Vai trò", "Trạng thái", "Đăng nhập cuối", ""].map(
                    (heading, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left text-[12.5px] font-semibold uppercase tracking-[0.05em] text-muted"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => {
                  const isSelf = account.id === currentUser?.id;

                  return (
                    <tr key={account.id} className="border-t border-line">
                      <td className="px-4 py-3.5 text-[14.5px] font-medium">
                        {account.fullName}
                        {isSelf ? (
                          <span className="ml-2 text-[12.5px] font-normal text-muted">
                            · bạn
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 text-[14px] text-muted">
                        {account.email}
                      </td>
                      <td className="px-4 py-3.5 text-[14px]">
                        {USER_ROLE_LABELS[account.role]}
                      </td>
                      <td className="px-4 py-3.5 text-[14px] text-muted">
                        {account.isActive ? "Đang hoạt động" : "Đã khóa"}
                      </td>
                      <td className="px-4 py-3.5 text-[14px] text-muted">
                        {account.lastLoginAt ? formatDate(account.lastLoginAt) : "Chưa đăng nhập"}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditing(account)}
                            title="Sửa tài khoản"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink"
                          >
                            <Pencil size={15} aria-hidden="true" />
                            <span className="sr-only">Sửa {account.email}</span>
                          </button>
                          {!isSelf ? (
                            <button
                              type="button"
                              onClick={() => setDeleting(account)}
                              title="Xóa tài khoản"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink"
                            >
                              <Trash2 size={15} aria-hidden="true" />
                              <span className="sr-only">Xóa {account.email}</span>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex max-w-[760px] flex-col gap-2 rounded-[12px] border border-line bg-surface-alt p-5">
        <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-muted">
          Ba mức quyền
        </p>
        {ROLES.map((role) => (
          <p key={role} className="text-[14px] leading-relaxed">
            <span className="font-semibold">{USER_ROLE_LABELS[role]}</span>{" "}
            <span className="text-muted">— {USER_ROLE_HINTS[role]}</span>
          </p>
        ))}
      </div>

      {creating || editing ? (
        <AccountDialog
          account={editing}
          isSelf={editing?.id === currentUser?.id}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={async (message) => {
            setCreating(false);
            setEditing(null);
            showSuccess(message);
            await load();
          }}
          onError={showError}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa tài khoản này?"
        description={
          deleting
            ? `${deleting.email} sẽ không đăng nhập được nữa. Nội dung người này đã viết vẫn còn.`
            : ""
        }
        confirmLabel="Xóa tài khoản"
        loading={deletePending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />

      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onDismiss={dismiss} />
      ) : null}
    </div>
  );
}

function AccountDialog({
  account,
  isSelf,
  onClose,
  onSaved,
  onError,
}: {
  account: AdminAccount | null;
  /** Đang sửa chính mình: server không cho tự đổi quyền hay tự khóa. */
  isSelf?: boolean;
  onClose: () => void;
  onSaved: (message: string) => void | Promise<void>;
  onError: (message: string) => void;
}) {
  const [email, setEmail] = useState(account?.email ?? "");
  const [fullName, setFullName] = useState(account?.fullName ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(account?.role ?? "editor");
  const [isActive, setIsActive] = useState(account?.isActive ?? true);

  const [errors, setErrors] = useState<{
    email?: string;
    fullName?: string;
    password?: string;
  }>({});
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    const found: typeof errors = {};

    if (fullName.trim().length < 2) found.fullName = "Họ tên phải dài ít nhất 2 ký tự";

    if (!account) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        found.email = "Email không hợp lệ";
      }
      if (password.length < 10) {
        found.password = "Mật khẩu phải dài ít nhất 10 ký tự";
      }
    } else if (password && password.length < 10) {
      found.password = "Mật khẩu mới phải dài ít nhất 10 ký tự";
    }

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      if (account) {
        await api.patch(`/admin/users/${account.id}`, {
          fullName: fullName.trim(),
          ...(isSelf ? {} : { role, isActive }),
          ...(password ? { password } : {}),
        });
        await onSaved("Đã lưu tài khoản");
      } else {
        await api.post("/admin/users", {
          email: email.trim().toLowerCase(),
          password,
          fullName: fullName.trim(),
          role,
          isActive,
        });
        await onSaved("Đã thêm tài khoản");
      }
    } catch (caught) {
      if (caught instanceof ApiError && caught.details?.length) {
        onError(`${caught.message}: ${caught.details.map((d) => d.message).join(", ")}`);
      } else {
        onError(
          caught instanceof ApiError ? caught.message : "Không lưu được tài khoản",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-abyss/60 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        noValidate
        onClick={(event) => event.stopPropagation()}
        className="my-8 flex w-full max-w-[520px] flex-col gap-5 rounded-[12px] bg-surface p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[19px] font-semibold">
            {account ? "Sửa tài khoản" : "Thêm tài khoản"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] text-muted hover:bg-primary-50 hover:text-ink"
          >
            <X size={18} aria-hidden="true" />
            <span className="sr-only">Đóng</span>
          </button>
        </div>

        <Field label="Họ tên" htmlFor="account-full-name" error={errors.fullName} required>
          <input
            id="account-full-name"
            value={fullName}
            onChange={(event) => {
              setFullName(event.target.value);
              setErrors((current) => ({ ...current, fullName: undefined }));
            }}
            aria-invalid={Boolean(errors.fullName)}
            className={inputClass}
          />
        </Field>

        <Field
          label="Email"
          htmlFor="account-email"
          error={errors.email}
          required={!account}
          hint={account ? "Email đã tạo thì không đổi được." : undefined}
        >
          <input
            id="account-email"
            type="email"
            value={email}
            disabled={Boolean(account)}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((current) => ({ ...current, email: undefined }));
            }}
            aria-invalid={Boolean(errors.email)}
            className={inputClass}
          />
        </Field>

        <Field
          label={account ? "Mật khẩu mới" : "Mật khẩu"}
          htmlFor="account-password"
          error={errors.password}
          required={!account}
          hint={
            account
              ? "Để trống nếu không đổi mật khẩu."
              : "Ít nhất 10 ký tự. Người dùng tự đổi được sau khi đăng nhập."
          }
        >
          <input
            id="account-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: undefined }));
            }}
            aria-invalid={Boolean(errors.password)}
            className={inputClass}
          />
        </Field>

        <Field
          label="Vai trò"
          htmlFor="account-role"
          hint={isSelf ? "Không tự đổi được vai trò của chính mình." : USER_ROLE_HINTS[role]}
        >
          <select
            id="account-role"
            value={role}
            disabled={isSelf}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className={inputClass}
          >
            {ROLES.map((item) => (
              <option key={item} value={item}>
                {USER_ROLE_LABELS[item]}
              </option>
            ))}
          </select>
        </Field>

        {!isSelf ? (
          <label className="flex items-start gap-3 rounded-[8px] border border-line p-4">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            <span>
              <span className="block text-[14.5px] font-semibold">
                Cho phép đăng nhập
              </span>
              <span className="mt-0.5 block text-[13.5px] leading-relaxed text-muted">
                Bỏ dấu tích là khóa tài khoản mà không xóa.
              </span>
            </span>
          </label>
        ) : null}

        <div className="flex justify-end gap-3">
          <AdminButton variant="ghost" onClick={onClose} disabled={saving}>
            Hủy
          </AdminButton>
          <AdminButton type="submit" loading={saving}>
            {account ? "Lưu tài khoản" : "Thêm tài khoản"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
