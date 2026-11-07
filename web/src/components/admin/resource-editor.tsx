"use client";

import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { QueryState } from "./ui";
import { useDetailQuery } from "@/lib/admin/queries";

/**
 * Tải một bản ghi theo `id` trên URL rồi giao cho form sửa. Mọi trang
 * `[id]/edit` dùng chung, chỉ khác đường dẫn API và tên gọi.
 */
export function ResourceEditor<T extends { id: string }>({
  endpoint,
  noun,
  children,
}: {
  endpoint: string;
  /** Tên gọi trong thông báo: "món ăn" → "Đang tải món ăn". */
  noun: string;
  children: (record: T) => ReactNode;
}) {
  const { id } = useParams<{ id: string }>();
  const query = useDetailQuery<T>(endpoint, id);

  return (
    <QueryState
      query={query}
      loadingLabel={`Đang tải ${noun}`}
      errorMessage={`Không tải được ${noun} này`}
    >
      {children}
    </QueryState>
  );
}
