"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import {
  AdminButton,
  AdminEmpty,
  PageHeader,
  QueryState,
  Tabs,
  useToast,
} from "@/components/admin/ui";
import { api } from "@/lib/admin/api-client";
import { queryKeys, useListQuery } from "@/lib/admin/queries";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/http";

/** Các loại nội dung có thùng rác, cùng tên gọi hiển thị. */
const RESOURCES = [
  ["articles", "Bài viết"],
  ["destinations", "Điểm đến"],
  ["foods", "Ẩm thực"],
  ["events", "Sự kiện"],
  ["courses", "Khóa học"],
  ["albums", "Album ảnh"],
] as const;

type ResourceKey = (typeof RESOURCES)[number][0];

interface TrashItem {
  id: string;
  title?: string;
  name?: string;
  deletedAt: string | null;
  updatedAt: string;
}

const labelOf = (item: TrashItem) => item.title ?? item.name ?? "Không tên";

export default function TrashPage() {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const [active, setActive] = useState<ResourceKey>("articles");

  const endpoint = `/admin/${active}`;
  const resourceLabel = RESOURCES.find(([key]) => key === active)![1];
  const query = useListQuery<TrashItem[]>(endpoint, { trash: true, limit: 50 });

  const restore = useMutation({
    mutationFn: (item: TrashItem) => api.post(`${endpoint}/${item.id}/restore`),
    onSuccess: (_data, item) => {
      showSuccess(`Đã khôi phục "${labelOf(item)}"`);
      // Cả thùng rác lẫn danh sách chính của loại này đều thay đổi.
      return queryClient.invalidateQueries({ queryKey: queryKeys.resource(endpoint) });
    },
    onError: (error) => showError(getErrorMessage(error, "Không khôi phục được")),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Thùng rác"
        description="Nội dung đã xóa vẫn nằm trong database, chỉ bị ẩn khỏi website. Khôi phục là nó trở lại đúng trạng thái trước khi xóa."
      />

      <Tabs tabs={RESOURCES} active={active} onChange={setActive} />

      <QueryState query={query} errorMessage="Không tải được thùng rác">
        {({ data: items }) =>
          items.length === 0 ? (
            <AdminEmpty
              title={`Không có ${resourceLabel.toLowerCase()} nào trong thùng rác`}
              description="Nội dung bị xóa sẽ xuất hiện ở đây."
            />
          ) : (
            <div className="overflow-hidden rounded-[12px] border border-line bg-surface">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-alt">
                    <th className="px-4 py-3 text-left text-[12.5px] font-semibold uppercase tracking-[0.05em] text-muted">
                      Tên
                    </th>
                    <th className="px-4 py-3 text-left text-[12.5px] font-semibold uppercase tracking-[0.05em] text-muted">
                      Ngày xóa
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-line">
                      <td className="px-4 py-3.5 text-[14.5px] font-medium">{labelOf(item)}</td>
                      <td className="px-4 py-3.5 text-[14px] text-muted">
                        {item.deletedAt ? formatDate(item.deletedAt) : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end">
                          <AdminButton
                            variant="ghost"
                            loading={restore.isPending && restore.variables?.id === item.id}
                            onClick={() => restore.mutate(item)}
                          >
                            <RotateCcw size={15} aria-hidden="true" />
                            Khôi phục
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </QueryState>

      <p className="max-w-[70ch] text-[13.5px] leading-relaxed text-muted">
        Hiện chưa có chức năng xóa vĩnh viễn. Nội dung nằm trong thùng rác không chiếm chỗ
        đáng kể, và giữ lại thì còn khôi phục được khi lỡ tay.
      </p>
    </div>
  );
}
