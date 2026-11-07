"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  AdminButton,
  ConfirmDialog,
  DialogHeader,
  IconButton,
  Modal,
  PageHeader,
  QueryState,
  useToast,
} from "@/components/admin/ui";
import { AdminForm, FormCheckbox, FormInput, FormSelect } from "@/components/admin/form-fields";
import { api } from "@/lib/admin/api-client";
import { useAuth } from "@/lib/admin/auth-context";
import { requiredText, tooLong, type FieldLimits } from "@/lib/admin/form-utils";
import { queryKeys, useDeleteMutation } from "@/lib/admin/queries";
import {
  USER_ROLE_HINTS,
  USER_ROLE_LABELS,
  type AdminAccount,
  type UserRole,
} from "@/lib/admin/types";
import { formatDate } from "@/lib/format";
import { FIELD_LIMITS as F } from "@/lib/field-limits";
import { getErrorMessage } from "@/lib/http";

const ENDPOINT = "/admin/users";

const ROLES = ["editor", "admin", "super_admin"] as const satisfies readonly UserRole[];

const ROLE_OPTIONS = ROLES.map((role) => ({ value: role, label: USER_ROLE_LABELS[role] }));

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [dialog, setDialog] = useState<{ account: AdminAccount | null } | null>(null);
  const [deleting, setDeleting] = useState<AdminAccount | null>(null);

  const query = useQuery({
    queryKey: queryKeys.list(ENDPOINT),
    queryFn: async () => (await api.get<AdminAccount[]>(ENDPOINT)).data,
  });
  const remove = useDeleteMutation(ENDPOINT);

  const confirmDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting.id, {
      onSuccess: () => {
        showSuccess(`Đã xóa tài khoản ${deleting.email}`);
        setDeleting(null);
      },
      onError: (error) => showError(getErrorMessage(error, "Không xóa được tài khoản")),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tài khoản"
        description="Ai được vào khu quản trị và làm được những gì. Chỉ quản trị cấp cao thấy được trang này."
        actions={
          <AdminButton onClick={() => setDialog({ account: null })}>
            <Plus size={16} aria-hidden="true" />
            Thêm tài khoản
          </AdminButton>
        }
      />

      <QueryState
        query={query}
        loadingLabel="Đang tải tài khoản"
        errorMessage="Không tải được danh sách tài khoản"
      >
        {(accounts) => (
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
                            <span className="ml-2 text-[12.5px] font-normal text-muted">· bạn</span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3.5 text-[14px] text-muted">{account.email}</td>
                        <td className="px-4 py-3.5 text-[14px]">{USER_ROLE_LABELS[account.role]}</td>
                        <td className="px-4 py-3.5 text-[14px] text-muted">
                          {account.isActive ? "Đang hoạt động" : "Đã khóa"}
                        </td>
                        <td className="px-4 py-3.5 text-[14px] text-muted">
                          {account.lastLoginAt ? formatDate(account.lastLoginAt) : "Chưa đăng nhập"}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex justify-end gap-1">
                            <IconButton
                              label={`Sửa ${account.email}`}
                              title="Sửa tài khoản"
                              onClick={() => setDialog({ account })}
                            >
                              <Pencil size={15} aria-hidden="true" />
                            </IconButton>
                            {!isSelf ? (
                              <IconButton
                                label={`Xóa ${account.email}`}
                                title="Xóa tài khoản"
                                onClick={() => setDeleting(account)}
                              >
                                <Trash2 size={15} aria-hidden="true" />
                              </IconButton>
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
      </QueryState>

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

      {dialog ? (
        <AccountDialog
          account={dialog.account}
          isSelf={dialog.account?.id === currentUser?.id}
          onClose={() => setDialog(null)}
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
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

/** Khớp userCreateSchema / userUpdateSchema ở server. */
const ACCOUNT_LIMITS = {
  fullName: F.personName,
  email: F.email,
  password: F.password,
} satisfies FieldLimits;

const { password: PASSWORD } = ACCOUNT_LIMITS;

/** Tạo mới thì bắt buộc email và mật khẩu; sửa thì mật khẩu để trống là giữ nguyên. */
function accountSchema(isCreate: boolean) {
  return z.object({
    fullName: requiredText("Họ tên phải dài ít nhất 2 ký tự", ACCOUNT_LIMITS.fullName),
    email: isCreate
      ? z
          .string()
          .trim()
          .toLowerCase()
          .email("Email không hợp lệ")
          .max(ACCOUNT_LIMITS.email.max, tooLong(ACCOUNT_LIMITS.email.max))
      : z.string(),
    // Không cắt khoảng trắng: khoảng trắng là một phần của mật khẩu.
    password: isCreate
      ? z
          .string()
          .min(PASSWORD.min, `Mật khẩu phải dài ít nhất ${PASSWORD.min} ký tự`)
          .max(PASSWORD.max, tooLong(PASSWORD.max))
      : z
          .string()
          .refine(
            (value) => !value || value.length >= PASSWORD.min,
            `Mật khẩu mới phải dài ít nhất ${PASSWORD.min} ký tự`,
          )
          .refine((value) => value.length <= PASSWORD.max, tooLong(PASSWORD.max)),
    role: z.enum(ROLES),
    isActive: z.boolean(),
  });
}

type AccountValues = z.infer<ReturnType<typeof accountSchema>>;

function AccountDialog({
  account,
  isSelf,
  onClose,
}: {
  account: AdminAccount | null;
  /** Đang sửa chính mình: server không cho tự đổi quyền hay tự khóa. */
  isSelf: boolean;
  onClose: () => void;
}) {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AccountValues>({
    resolver: zodResolver(accountSchema(!account)),
    defaultValues: {
      fullName: account?.fullName ?? "",
      email: account?.email ?? "",
      password: "",
      role: account?.role ?? "editor",
      isActive: account?.isActive ?? true,
    },
  });
  const role = useWatch({ control: form.control, name: "role" });

  const save = useMutation({
    mutationFn: (values: AccountValues) =>
      account
        ? api.patch(`${ENDPOINT}/${account.id}`, {
            fullName: values.fullName,
            ...(isSelf ? {} : { role: values.role, isActive: values.isActive }),
            ...(values.password ? { password: values.password } : {}),
          })
        : api.post(ENDPOINT, values),
    onSuccess: async () => {
      showSuccess(account ? "Đã lưu tài khoản" : "Đã thêm tài khoản");
      onClose();
      await queryClient.invalidateQueries({ queryKey: queryKeys.resource(ENDPOINT) });
    },
    onError: (error) => showError(getErrorMessage(error, "Không lưu được tài khoản")),
  });

  return (
    <Modal onClose={onClose} labelledBy="account-dialog-title" align="top" className="max-w-[520px]">
      <AdminForm
        form={form}
        idPrefix="account"
        limits={ACCOUNT_LIMITS}
        onSubmit={(values) => save.mutate(values)}
        className="flex flex-col gap-5"
      >
        <DialogHeader
          id="account-dialog-title"
          title={account ? "Sửa tài khoản" : "Thêm tài khoản"}
          onClose={onClose}
        />

        <FormInput name="fullName" label="Họ tên" required />

        <FormInput
          name="email"
          type="email"
          label="Email"
          required={!account}
          disabled={Boolean(account)}
          hint={account ? "Email đã tạo thì không đổi được." : undefined}
        />

        <FormInput
          name="password"
          type="password"
          autoComplete="new-password"
          label={account ? "Mật khẩu mới" : "Mật khẩu"}
          required={!account}
          hint={
            account
              ? "Để trống nếu không đổi mật khẩu."
              : "Ít nhất 10 ký tự. Người dùng tự đổi được sau khi đăng nhập."
          }
        />

        <FormSelect
          name="role"
          label="Vai trò"
          options={ROLE_OPTIONS}
          disabled={isSelf}
          hint={isSelf ? "Không tự đổi được vai trò của chính mình." : USER_ROLE_HINTS[role]}
        />

        {!isSelf ? (
          <FormCheckbox
            name="isActive"
            label="Cho phép đăng nhập"
            hint="Bỏ dấu tích là khóa tài khoản mà không xóa."
          />
        ) : null}

        <div className="flex justify-end gap-3">
          <AdminButton variant="ghost" onClick={onClose} disabled={save.isPending}>
            Hủy
          </AdminButton>
          <AdminButton type="submit" loading={save.isPending}>
            {account ? "Lưu tài khoản" : "Thêm tài khoản"}
          </AdminButton>
        </div>
      </AdminForm>
    </Modal>
  );
}
