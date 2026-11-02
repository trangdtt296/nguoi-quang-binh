"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";

export interface FilterGroup {
  /** Tên tham số trên URL, ví dụ "category". */
  param: string;
  label: string;
  options: { label: string; value: string }[];
}

/**
 * Bộ lọc viết vào query string chứ không giữ trong state nội bộ, để mỗi tổ
 * hợp lọc có một URL riêng — chia sẻ được, quay lại được bằng nút Back.
 *
 * Mỗi nhóm lọc là một dropdown thay vì một hàng chip: luôn cao một dòng dù
 * có bao nhiêu lựa chọn, nên cả cụm nằm gọn trên một hàng ngang và không
 * phình ra khi admin thêm danh mục mới.
 */
export function FilterBar({
  basePath,
  groups,
  searchPlaceholder,
  sortOptions,
}: {
  basePath: string;
  groups: FilterGroup[];
  searchPlaceholder?: string;
  sortOptions?: { label: string; value: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [keyword, setKeyword] = useState(params.get("q") ?? "");

  const applyParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    // Đổi bộ lọc thì luôn quay về trang 1, nếu không dễ rơi vào trang trống.
    next.delete("page");
    const queryString = next.toString();
    router.push(queryString ? `${basePath}?${queryString}` : basePath);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    applyParam("q", keyword.trim() || null);
  };

  const clearAll = () => {
    setKeyword("");
    router.push(basePath);
  };

  const hasFilter =
    groups.some((group) => params.get(group.param)) || Boolean(params.get("q"));

  return (
    <div className="rounded-[12px] border border-line bg-surface p-4 md:p-5">
      <div className="flex flex-wrap items-end gap-3">
        {searchPlaceholder ? (
          <form
            onSubmit={submitSearch}
            className="min-w-[220px] flex-[2_1_260px]"
            role="search"
          >
            <label
              htmlFor="o-tim-kiem"
              className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-[0.06em] text-muted"
            >
              Tìm kiếm
            </label>
            <div className="flex min-h-12 items-center gap-2.5 rounded-[8px] border border-line bg-surface px-3.5 focus-within:border-ink">
              <Search size={17} className="shrink-0 text-muted" aria-hidden="true" />
              <input
                id="o-tim-kiem"
                type="search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder={searchPlaceholder}
                className="min-h-11 w-full bg-transparent text-[15px] outline-none"
              />
            </div>
          </form>
        ) : null}

        {groups.map((group) => (
          <SelectField
            key={group.param}
            id={`loc-${group.param}`}
            label={group.label}
            value={params.get(group.param) ?? ""}
            onChange={(value) => applyParam(group.param, value || null)}
            options={[{ label: "Tất cả", value: "" }, ...group.options]}
          />
        ))}

        {sortOptions ? (
          <SelectField
            id="loc-sap-xep"
            label="Sắp xếp"
            value={params.get("sort") ?? sortOptions[0].value}
            onChange={(value) => applyParam("sort", value)}
            options={sortOptions}
          />
        ) : null}

        {hasFilter ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex min-h-12 shrink-0 items-center gap-1.5 rounded-[8px] border border-line px-4 text-[14px] font-semibold text-ink transition-colors hover:border-ink"
          >
            <X size={15} aria-hidden="true" />
            Xóa bộ lọc
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-[150px] flex-1">
      <label
        htmlFor={id}
        className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-[0.06em] text-muted"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-[8px] border border-line bg-surface px-3 text-[15px] text-ink focus:border-ink focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
