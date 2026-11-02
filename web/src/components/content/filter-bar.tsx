"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import clsx from "clsx";
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
 * Bố cục: một khối có viền, hàng trên là ô tìm kiếm và ô sắp xếp (đẩy sang
 * hai mép), bên dưới mỗi nhóm lọc là một hàng có nhãn nằm bên trái. Cách này
 * giữ chiều cao thấp và lấp được chiều ngang, thay vì xếp dọc bốn tầng dồn
 * hết về một bên.
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

  const pushParams = (next: URLSearchParams) => {
    // Đổi bộ lọc thì luôn quay về trang 1, nếu không dễ rơi vào trang trống.
    next.delete("page");
    const queryString = next.toString();
    router.push(queryString ? `${basePath}?${queryString}` : basePath);
  };

  const applyParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    pushParams(next);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    applyParam("q", keyword.trim() || null);
  };

  const clearAll = () => {
    setKeyword("");
    router.push(basePath);
  };

  const activeCount =
    groups.filter((group) => params.get(group.param)).length +
    (params.get("q") ? 1 : 0);

  return (
    <div className="rounded-[12px] border border-line bg-surface p-5 md:p-6">
      {/* Hàng trên: tìm kiếm bên trái, sắp xếp bên phải */}
      {(searchPlaceholder || sortOptions) && (
        <div className="flex flex-wrap items-center gap-4">
          {searchPlaceholder ? (
            <form
              onSubmit={submitSearch}
              className="min-w-[240px] flex-1 md:max-w-[460px]"
              role="search"
            >
              <label htmlFor="o-tim-kiem" className="sr-only">
                Tìm kiếm
              </label>
              <div className="flex min-h-12 items-center gap-3 rounded-[10px] border border-line bg-surface px-4 focus-within:border-ink">
                <Search size={18} className="shrink-0 text-muted" aria-hidden="true" />
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

          {sortOptions ? (
            <label className="flex items-center gap-2.5 text-[14px] text-muted md:ml-auto">
              Sắp xếp
              <select
                value={params.get("sort") ?? sortOptions[0].value}
                onChange={(event) => applyParam("sort", event.target.value)}
                className="min-h-11 rounded-[8px] border border-line bg-surface px-3 text-[14px] text-ink"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      )}

      {/* Các nhóm lọc: nhãn bên trái, chip trải sang phải */}
      <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5">
        {groups.map((group) => {
          const active = params.get(group.param);
          return (
            <div
              key={group.param}
              className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4"
            >
              <p className="shrink-0 text-[12.5px] font-semibold uppercase tracking-[0.06em] text-muted md:w-24">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                <Chip
                  active={!active}
                  onClick={() => applyParam(group.param, null)}
                  label="Tất cả"
                />
                {group.options.map((option) => (
                  <Chip
                    key={option.value}
                    active={active === option.value}
                    onClick={() => applyParam(group.param, option.value)}
                    label={option.label}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {activeCount > 0 ? (
        <div className="mt-4 border-t border-line pt-4">
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-ink underline underline-offset-4"
          >
            <X size={15} aria-hidden="true" />
            Xóa bộ lọc
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "inline-flex min-h-11 items-center rounded-full px-3.5 text-[14px] transition-colors",
        active
          ? "bg-ink text-white"
          : "border border-line bg-surface text-ink hover:border-ink",
      )}
    >
      {label}
    </button>
  );
}
