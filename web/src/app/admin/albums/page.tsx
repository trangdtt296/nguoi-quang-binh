"use client";

import { AdminShell } from "@/components/admin/shell";
import { ResourceList, type Column } from "@/components/admin/resource-list";
import { StatusBadge } from "@/components/admin/ui";
import type { AdminAlbum } from "@/lib/admin/types";
import { formatDate } from "@/lib/format";

const columns: Column<AdminAlbum>[] = [
  { header: "Tên album", primary: true, render: (item) => item.title },
  {
    header: "Mô tả",
    render: (item) => (
      <span className="text-muted">
        {item.description
          ? item.description.length > 70
            ? `${item.description.slice(0, 70)}…`
            : item.description
          : "—"}
      </span>
    ),
  },
  {
    header: "Thứ tự",
    render: (item) => <span className="text-muted">{item.sortOrder}</span>,
  },
  { header: "Trạng thái", render: (item) => <StatusBadge status={item.status} /> },
  {
    header: "Ngày đăng",
    render: (item) => (
      <span className="text-muted">
        {item.publishedAt ? formatDate(item.publishedAt) : "—"}
      </span>
    ),
  },
];

export default function AlbumsPage() {
  return (
    <AdminShell>
      <ResourceList<AdminAlbum>
        title="Album ảnh"
        description="Bộ ảnh theo chủ đề cho thư viện hình của website."
        endpoint="/admin/albums"
        basePath="/admin/albums"
        columns={columns}
        searchPlaceholder="Tìm theo tên album"
        createLabel="Thêm album"
        emptyTitle="Chưa có album nào khớp"
        getLabel={(item) => item.title}
        filters={[
          {
            param: "status",
            label: "Tất cả trạng thái",
            options: [
              { label: "Đã xuất bản", value: "published" },
              { label: "Bản nháp", value: "draft" },
              { label: "Lên lịch", value: "scheduled" },
              { label: "Lưu trữ", value: "archived" },
            ],
          },
        ]}
      />
    </AdminShell>
  );
}
