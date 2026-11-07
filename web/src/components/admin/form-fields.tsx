"use client";

import {
  createContext,
  useContext,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import clsx from "clsx";
import { Plus, Trash2 } from "lucide-react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
  type FieldValues,
  type RegisterOptions,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { AdminButton, CheckboxCard, Field, inputClass, textareaClass } from "./ui";
import { CoverImagePanel } from "./cover-image-panel";
import { RichTextEditor } from "./rich-text-editor";
import type { FieldLimits } from "@/lib/admin/form-utils";
import { slugify } from "@/lib/slugify";

/**
 * Các ô nhập đã gắn sẵn với react-hook-form.
 *
 * Mỗi ô tự lấy lỗi, tự đăng ký với form và tự sinh id từ tiền tố của
 * `AdminForm` — form chỉ cần khai báo tên trường, nhãn và lời gợi ý.
 */

const IdPrefixContext = createContext("field");
const LimitsContext = createContext<FieldLimits>({});

function useFieldId(name: string) {
  return `${useContext(IdPrefixContext)}-${name.replace(/\./g, "-")}`;
}

/** minLength/maxLength của ô lấy từ bảng LIMITS truyền vào AdminForm. */
function useLengthProps(name: string): { minLength?: number; maxLength?: number } {
  const limit = useContext(LimitsContext)[name];
  return { minLength: limit?.min, maxLength: limit?.max };
}

function useFieldError(name: string): string | undefined {
  const { control, getFieldState } = useFormContext();
  const formState = useFormState({ control, name });
  return getFieldState(name, formState).error?.message;
}

/** Gợi ý có thể phụ thuộc vào số ký tự đang nhập, ví dụ "12/500 ký tự". */
type Hint = ReactNode | ((length: number) => ReactNode);

function useHint(name: string, hint: Hint): ReactNode {
  const counting = typeof hint === "function";
  const value = useWatch({ name, disabled: !counting });
  if (!counting) return hint;
  return hint(typeof value === "string" ? value.length : 0);
}

export function AdminForm<T extends FieldValues>({
  form,
  idPrefix,
  onSubmit,
  onInvalid,
  limits = {},
  className,
  children,
}: {
  form: UseFormReturn<T>;
  /** Tiền tố id của các ô, để hai form trên cùng trang không trùng id. */
  idPrefix: string;
  /** Giới hạn độ dài theo tên trường — ô nhập tự gắn minLength/maxLength. */
  limits?: FieldLimits;
  onSubmit: SubmitHandler<T>;
  onInvalid?: SubmitErrorHandler<T>;
  className?: string;
  children: ReactNode;
}) {
  return (
    <FormProvider {...form}>
      <IdPrefixContext.Provider value={idPrefix}>
        <LimitsContext.Provider value={limits}>
        <form
          noValidate
          className={className}
          onSubmit={(event) => {
            // Hộp thoại có form riêng (bài học, chọn ảnh) có thể nằm trong
            // form khác trên cây React; chặn để submit không lan ra form cha.
            event.stopPropagation();
            void form.handleSubmit(onSubmit, onInvalid)(event);
          }}
        >
          {children}
        </form>
        </LimitsContext.Provider>
      </IdPrefixContext.Provider>
    </FormProvider>
  );
}

interface FieldProps {
  name: string;
  label: string;
  hint?: Hint;
  required?: boolean;
  registerOptions?: RegisterOptions;
}

export function FormInput({
  name,
  label,
  hint,
  required,
  registerOptions,
  className,
  ...inputProps
}: FieldProps & Omit<ComponentProps<"input">, "name">) {
  const { register } = useFormContext();
  const id = useFieldId(name);
  const error = useFieldError(name);
  const lengths = useLengthProps(name);

  return (
    <Field label={label} htmlFor={id} error={error} hint={useHint(name, hint)} required={required}>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        className={clsx(inputClass, className)}
        {...lengths}
        {...inputProps}
        {...register(name, registerOptions)}
      />
    </Field>
  );
}

export function FormTextarea({
  name,
  label,
  hint,
  required,
  registerOptions,
  rows = 3,
  ...textareaProps
}: FieldProps & Omit<ComponentProps<"textarea">, "name">) {
  const { register } = useFormContext();
  const id = useFieldId(name);
  const error = useFieldError(name);
  const lengths = useLengthProps(name);

  return (
    <Field label={label} htmlFor={id} error={error} hint={useHint(name, hint)} required={required}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={textareaClass}
        {...lengths}
        {...textareaProps}
        {...register(name, registerOptions)}
      />
    </Field>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export function FormSelect({
  name,
  label,
  hint,
  options,
  placeholder,
  disabled,
  registerOptions,
}: Omit<FieldProps, "required"> & {
  options: readonly SelectOption[];
  /** Nhãn của lựa chọn rỗng ở đầu danh sách. */
  placeholder?: string;
  disabled?: boolean;
}) {
  const { register } = useFormContext();
  const id = useFieldId(name);

  return (
    <Field label={label} htmlFor={id} hint={useHint(name, hint)}>
      <select
        id={id}
        disabled={disabled}
        className={inputClass}
        {...register(name, registerOptions)}
      >
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** Đổi danh sách bản ghi có id/name thành lựa chọn cho FormSelect. */
export function toOptions<T extends { id: string }>(
  items: readonly T[],
  getLabel: (item: T) => string,
): SelectOption[] {
  return items.map((item) => ({ value: item.id, label: getLabel(item) }));
}

export function FormCheckbox({ name, label, hint }: { name: string; label: string; hint?: string }) {
  const { register } = useFormContext();
  return <CheckboxCard label={label} hint={hint} {...register(name)} />;
}

export function FormRichText({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <p className="mb-1.5 text-[14px] font-semibold">{label}</p>
      <Controller
        name={name}
        render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
      />
    </div>
  );
}

export function FormImage({ name, label }: { name: string; label?: string }) {
  return (
    <Controller
      name={name}
      render={({ field }) => (
        <CoverImagePanel label={label} value={field.value} onChange={field.onChange} />
      )}
    />
  );
}

/**
 * Ô tiêu đề kèm ô đường dẫn. Khi tạo mới, đường dẫn tự sinh theo tiêu đề
 * cho tới lúc người dùng tự sửa đường dẫn.
 */
export function TitleSlugFields({
  titleName,
  titleLabel,
  slugHint,
  autoSlug,
}: {
  titleName: string;
  titleLabel: string;
  slugHint: string;
  /** Bật khi tạo mới. Sửa bản ghi cũ thì không tự đổi đường dẫn. */
  autoSlug: boolean;
}) {
  const { setValue } = useFormContext();
  const slugTouched = useRef(!autoSlug);

  return (
    <>
      <FormInput
        name={titleName}
        label={titleLabel}
        required
        registerOptions={{
          onChange: (event) => {
            if (!slugTouched.current) setValue("slug", slugify(event.target.value));
          },
        }}
      />
      <FormInput
        name="slug"
        label="Đường dẫn"
        hint={slugHint}
        registerOptions={{
          onChange: () => {
            slugTouched.current = true;
          },
        }}
      />
    </>
  );
}

/**
 * Danh sách các dòng nhiều cột (ví dụ tên quán + địa chỉ), thêm bớt được.
 * Dòng bỏ trống sẽ được lọc khi gửi lên API.
 */
export function FormRows({
  name,
  columns,
  addLabel,
  rowLabel,
  maxRows,
}: {
  name: string;
  columns: { key: string; placeholder: string; className: string; maxLength?: number }[];
  addLabel: string;
  /** Tên một dòng, dùng cho nhãn trình đọc màn hình: "quán", "dòng". */
  rowLabel: string;
  /** Số dòng tối đa server chấp nhận; đủ thì khóa nút thêm. */
  maxRows?: number;
}) {
  const { register } = useFormContext();
  const { fields, append, remove } = useFieldArray({ name });
  const full = maxRows !== undefined && fields.length >= maxRows;

  return (
    <div className="flex flex-col gap-3">
      {fields.map((row, index) => (
        <div key={row.id} className="flex flex-wrap items-start gap-3">
          {columns.map((column) => (
            <input
              key={column.key}
              aria-label={`${column.placeholder} ${rowLabel} ${index + 1}`}
              placeholder={column.placeholder}
              maxLength={column.maxLength}
              className={clsx(inputClass, column.className)}
              {...register(`${name}.${index}.${column.key}`)}
            />
          ))}
          <button
            type="button"
            onClick={() => remove(index)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-line text-muted transition-colors hover:border-ink hover:text-ink"
          >
            <Trash2 size={15} aria-hidden="true" />
            <span className="sr-only">
              Xóa {rowLabel} {index + 1}
            </span>
          </button>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <AdminButton
          variant="ghost"
          disabled={full}
          onClick={() => append(Object.fromEntries(columns.map((column) => [column.key, ""])))}
        >
          <Plus size={15} aria-hidden="true" />
          {addLabel}
        </AdminButton>
        {maxRows !== undefined ? (
          <span className="text-[13px] text-muted">
            {full ? `Đã đủ ${maxRows} ${rowLabel}, tối đa ${maxRows}.` : `${fields.length}/${maxRows} ${rowLabel}`}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** Khối có viền chứa vài ô nhập ở cột phải của form. */
export function FormPanel({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 rounded-[12px] border border-line bg-surface p-5">
      {children}
    </div>
  );
}

/** Bố cục hai cột: nội dung chính bên trái, ảnh và thông tin phụ bên phải. */
export function FormColumns({
  main,
  side,
  mainBasis = "520px",
}: {
  main: ReactNode;
  side: ReactNode;
  mainBasis?: "460px" | "480px" | "520px";
}) {
  return (
    <div className="flex flex-wrap gap-6">
      <div
        className={clsx(
          "flex min-w-0 flex-col gap-5",
          mainBasis === "460px" && "flex-[999_1_460px]",
          mainBasis === "480px" && "flex-[999_1_480px]",
          mainBasis === "520px" && "flex-[999_1_520px]",
        )}
      >
        {main}
      </div>
      <div className="flex min-w-0 flex-1 basis-[280px] flex-col gap-5">{side}</div>
    </div>
  );
}
