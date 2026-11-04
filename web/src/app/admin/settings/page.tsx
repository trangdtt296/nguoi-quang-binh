"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AdminShell } from "@/components/admin/shell";
import {
  AdminButton,
  AdminError,
  AdminLoading,
  Field,
  Toast,
  inputClass,
  textareaClass,
  useToast,
} from "@/components/admin/ui";
import { api, ApiError } from "@/lib/admin/api-client";
import type { AdminSetting } from "@/lib/admin/types";

/**
 * Các mục cấu hình mà CMS cho sửa.
 *
 * Khai báo tại đây thay vì dựng form từ dữ liệu trả về: như vậy mỗi mục có
 * nhãn tiếng Việt, có lời giải thích, và biết nên là ô một dòng hay nhiều
 * dòng. Khóa nào có trong database mà không có ở đây thì vẫn hiện, ở cuối
 * trang, dạng ô một dòng — để không âm thầm làm mất dữ liệu.
 */
const FIELDS: {
  key: string;
  label: string;
  hint?: string;
  multiline?: boolean;
  group: string;
}[] = [
  {
    key: "site_name",
    label: "Tên website",
    hint: "Hiện ở tiêu đề trình duyệt và khi chia sẻ liên kết.",
    group: "Chung",
  },
  {
    key: "slogan",
    label: "Slogan",
    hint: "Câu định vị dưới tên website.",
    group: "Chung",
  },
  {
    key: "about_short",
    label: "Giới thiệu ngắn",
    hint: "Một đoạn ở chân trang và trang Giới thiệu.",
    multiline: true,
    group: "Chung",
  },
  {
    key: "footer_text",
    label: "Dòng chân trang",
    hint: "Thường là dòng bản quyền.",
    multiline: true,
    group: "Chung",
  },
  {
    key: "email",
    label: "Email liên hệ",
    hint: "Để trống nếu không muốn công khai.",
    group: "Liên hệ",
  },
  {
    key: "hotline",
    label: "Số điện thoại",
    hint: "Để trống nếu không muốn công khai.",
    group: "Liên hệ",
  },
  {
    key: "address",
    label: "Địa chỉ",
    hint: "Để trống nếu không có địa chỉ cố định.",
    group: "Liên hệ",
  },
  {
    key: "facebook_page_url",
    label: "Fanpage Facebook",
    hint: "Liên kết đầy đủ, dạng https://www.facebook.com/…",
    group: "Mạng xã hội",
  },
  {
    key: "youtube_url",
    label: "Kênh YouTube",
    hint: "Để trống nếu chưa có kênh.",
    group: "Mạng xã hội",
  },
  {
    key: "tiktok_url",
    label: "TikTok",
    hint: "Để trống nếu chưa có.",
    group: "Mạng xã hội",
  },
  {
    key: "default_seo_description",
    label: "Mô tả SEO mặc định",
    hint: "Dùng cho những trang chưa có mô tả riêng. Nên khoảng 150 ký tự.",
    multiline: true,
    group: "SEO",
  },
];

const GROUPS = ["Chung", "Liên hệ", "Mạng xã hội", "SEO"];

/** Giá trị trong database là JSON; ở form thì luôn làm việc với chuỗi. */
function asText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

export default function SettingsPage() {
  return (
    <AdminShell>
      <SettingsContent />
    </AdminShell>
  );
}

function SettingsContent() {
  const { toast, showSuccess, showError, dismiss } = useToast();

  const [values, setValues] = useState<Record<string, string>>({});
  const [extraKeys, setExtraKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<AdminSetting[]>("/admin/settings");

      const next: Record<string, string> = {};
      for (const field of FIELDS) next[field.key] = "";
      for (const row of data) next[row.key] = asText(row.value);

      const known = new Set(FIELDS.map((field) => field.key));
      setExtraKeys(data.map((row) => row.key).filter((key) => !known.has(key)));
      setValues(next);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Không tải được cấu hình",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      // Gửi tất cả, kể cả ô để trống: xóa một giá trị cũng là một thay đổi
      // cần lưu, không phải lý do để bỏ qua khóa đó.
      const payload = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, value.trim()]),
      );
      await api.patch("/admin/settings", payload);
      showSuccess("Đã lưu cấu hình");
    } catch (caught) {
      showError(
        caught instanceof ApiError ? caught.message : "Không lưu được cấu hình",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLoading label="Đang tải cấu hình" />;
  if (error) return <AdminError message={error} onRetry={load} />;

  const setValue = (key: string, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold">Cài đặt</h1>
          <p className="mt-1.5 max-w-[70ch] text-[14.5px] text-muted">
            Những thông tin dùng chung cho cả website. Sửa ở đây là đổi trên mọi
            trang.
          </p>
        </div>
        <AdminButton type="submit" loading={saving}>
          {saving ? "Đang lưu" : "Lưu cấu hình"}
        </AdminButton>
      </div>

      {GROUPS.map((group) => {
        const fields = FIELDS.filter((field) => field.group === group);
        if (fields.length === 0) return null;

        return (
          <section
            key={group}
            className="flex max-w-[760px] flex-col gap-5 rounded-[12px] border border-line bg-surface p-5"
          >
            <h2 className="text-[16px] font-semibold">{group}</h2>

            {fields.map((field) => (
              <Field
                key={field.key}
                label={field.label}
                htmlFor={`setting-${field.key}`}
                hint={field.hint}
              >
                {field.multiline ? (
                  <textarea
                    id={`setting-${field.key}`}
                    rows={3}
                    value={values[field.key] ?? ""}
                    onChange={(event) => setValue(field.key, event.target.value)}
                    className={textareaClass}
                  />
                ) : (
                  <input
                    id={`setting-${field.key}`}
                    value={values[field.key] ?? ""}
                    onChange={(event) => setValue(field.key, event.target.value)}
                    className={inputClass}
                  />
                )}
              </Field>
            ))}
          </section>
        );
      })}

      {extraKeys.length > 0 ? (
        <section className="flex max-w-[760px] flex-col gap-5 rounded-[12px] border border-line bg-surface p-5">
          <div>
            <h2 className="text-[16px] font-semibold">Khóa khác</h2>
            <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
              Những khóa có trong database nhưng chưa được khai báo trong CMS. Sửa
              được, nhưng nên hỏi người dựng web trước khi đổi.
            </p>
          </div>

          {extraKeys.map((key) => (
            <Field key={key} label={key} htmlFor={`setting-${key}`}>
              <input
                id={`setting-${key}`}
                value={values[key] ?? ""}
                onChange={(event) => setValue(key, event.target.value)}
                className={inputClass}
              />
            </Field>
          ))}
        </section>
      ) : null}

      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onDismiss={dismiss} />
      ) : null}
    </form>
  );
}
