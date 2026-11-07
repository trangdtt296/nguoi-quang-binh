"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { AdminButton, PageHeader, QueryState, useToast } from "@/components/admin/ui";
import { AdminForm, FormInput, FormTextarea } from "@/components/admin/form-fields";
import { api } from "@/lib/admin/api-client";
import type { AdminSetting } from "@/lib/admin/types";
import { FIELD_LIMITS as F } from "@/lib/field-limits";
import { getErrorMessage } from "@/lib/http";

const ENDPOINT = "/admin/settings";

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
  /** Số ký tự tối đa của ô. */
  maxLength: number;
  group: string;
}[] = [
  {
    key: "site_name",
    maxLength: 100,
    label: "Tên website",
    hint: "Hiện ở tiêu đề trình duyệt và khi chia sẻ liên kết.",
    group: "Chung",
  },
  {
    key: "slogan",
    maxLength: 150,
    label: "Slogan",
    hint: "Câu định vị dưới tên website.",
    group: "Chung",
  },
  {
    key: "about_short",
    maxLength: 500,
    label: "Giới thiệu ngắn",
    hint: "Một đoạn ở chân trang và trang Giới thiệu.",
    multiline: true,
    group: "Chung",
  },
  {
    key: "footer_text",
    maxLength: 200,
    label: "Dòng chân trang",
    hint: "Thường là dòng bản quyền.",
    multiline: true,
    group: "Chung",
  },
  {
    key: "email",
    maxLength: F.email.max,
    label: "Email liên hệ",
    hint: "Để trống nếu không muốn công khai.",
    group: "Liên hệ",
  },
  {
    key: "hotline",
    maxLength: F.phone.max,
    label: "Số điện thoại",
    hint: "Để trống nếu không muốn công khai.",
    group: "Liên hệ",
  },
  {
    key: "address",
    maxLength: F.address.max,
    label: "Địa chỉ",
    hint: "Để trống nếu không có địa chỉ cố định.",
    group: "Liên hệ",
  },
  {
    key: "facebook_page_url",
    maxLength: 255,
    label: "Fanpage Facebook",
    hint: "Liên kết đầy đủ, dạng https://www.facebook.com/…",
    group: "Mạng xã hội",
  },
  {
    key: "youtube_url",
    maxLength: 255,
    label: "Kênh YouTube",
    hint: "Để trống nếu chưa có kênh.",
    group: "Mạng xã hội",
  },
  {
    key: "tiktok_url",
    maxLength: 255,
    label: "TikTok",
    hint: "Để trống nếu chưa có.",
    group: "Mạng xã hội",
  },
  {
    key: "default_seo_description",
    maxLength: F.seoDescription.max,
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

interface SettingEntry {
  key: string;
  value: string;
}

interface SettingsValues {
  entries: SettingEntry[];
}

/**
 * Khóa đã khai báo đứng trước, khóa lạ trong database xếp sau. Dùng mảng
 * thay vì đặt tên ô theo khóa, vì react-hook-form hiểu dấu chấm trong tên
 * ô là đường dẫn lồng nhau.
 */
function toEntries(rows: AdminSetting[]): SettingEntry[] {
  const stored = new Map(rows.map((row) => [row.key, asText(row.value)]));
  const known = new Set(FIELDS.map((field) => field.key));
  return [
    ...FIELDS.map((field) => ({ key: field.key, value: stored.get(field.key) ?? "" })),
    ...rows.filter((row) => !known.has(row.key)).map((row) => ({ key: row.key, value: asText(row.value) })),
  ];
}

export default function SettingsPage() {
  const query = useQuery({
    queryKey: [ENDPOINT],
    queryFn: async () => toEntries((await api.get<AdminSetting[]>(ENDPOINT)).data),
  });

  return (
    <QueryState query={query} loadingLabel="Đang tải cấu hình" errorMessage="Không tải được cấu hình">
      {(entries) => <SettingsForm entries={entries} />}
    </QueryState>
  );
}

function SettingsForm({ entries }: { entries: SettingEntry[] }) {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<SettingsValues>({ defaultValues: { entries } });

  const indexOf = new Map(entries.map((entry, index) => [entry.key, index]));
  const extraKeys = entries.slice(FIELDS.length).map((entry) => entry.key);

  const save = useMutation({
    // Gửi tất cả, kể cả ô để trống: xóa một giá trị cũng là một thay đổi
    // cần lưu, không phải lý do để bỏ qua khóa đó.
    mutationFn: (values: SettingsValues) =>
      api.patch(
        ENDPOINT,
        Object.fromEntries(values.entries.map((entry) => [entry.key, entry.value.trim()])),
      ),
    onSuccess: (_data, values) => {
      showSuccess("Đã lưu cấu hình");
      form.reset(values);
      return queryClient.invalidateQueries({ queryKey: [ENDPOINT] });
    },
    onError: (error) => showError(getErrorMessage(error, "Không lưu được cấu hình")),
  });

  return (
    <AdminForm
      form={form}
      idPrefix="setting"
      onSubmit={(values) => save.mutate(values)}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title="Cài đặt"
        description="Những thông tin dùng chung cho cả website. Sửa ở đây là đổi trên mọi trang."
        actions={
          <AdminButton type="submit" loading={save.isPending}>
            {save.isPending ? "Đang lưu" : "Lưu cấu hình"}
          </AdminButton>
        }
      />

      {GROUPS.map((group) => {
        const fields = FIELDS.filter((field) => field.group === group);
        if (fields.length === 0) return null;

        return (
          <section
            key={group}
            className="flex max-w-[760px] flex-col gap-5 rounded-[12px] border border-line bg-surface p-5"
          >
            <h2 className="text-[16px] font-semibold">{group}</h2>

            {fields.map((field) => {
              const name = `entries.${indexOf.get(field.key)}.value`;
              return field.multiline ? (
                <FormTextarea
                  key={field.key}
                  name={name}
                  label={field.label}
                  maxLength={field.maxLength}
                  hint={(length) => `${field.hint ?? ""} ${length}/${field.maxLength} ký tự.`.trim()}
                />
              ) : (
                <FormInput
                  key={field.key}
                  name={name}
                  label={field.label}
                  hint={field.hint}
                  maxLength={field.maxLength}
                />
              );
            })}
          </section>
        );
      })}

      {extraKeys.length > 0 ? (
        <section className="flex max-w-[760px] flex-col gap-5 rounded-[12px] border border-line bg-surface p-5">
          <div>
            <h2 className="text-[16px] font-semibold">Khóa khác</h2>
            <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
              Những khóa có trong database nhưng chưa được khai báo trong CMS. Sửa được, nhưng
              nên hỏi người dựng web trước khi đổi.
            </p>
          </div>

          {extraKeys.map((key) => (
            <FormInput key={key} name={`entries.${indexOf.get(key)}.value`} label={key} />
          ))}
        </section>
      ) : null}
    </AdminForm>
  );
}
