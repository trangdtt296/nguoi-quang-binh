"use client";

import { AdminShell } from "@/components/admin/shell";
import { ResourceList, type Column } from "@/components/admin/resource-list";
import { StatusBadge } from "@/components/admin/ui";
import { destinationCategories } from "@/lib/filters";
import type { AdminDestination } from "@/lib/admin/types";
import { formatDate, formatNumber } from "@/lib/format";

const columns: Column<AdminDestination>[] = [
  { header: "Tên điểm đến", primary: true, render: (item) => item.name },
  {
    header: "Loại hình",
    render: (item) => (
      <span className="text-muted">{item.category?.name ?? "—"}</span>
    ),
  },
  {
    header: "Khu vực",
    render: (item) => <span className="text-muted">{item.region || "—"}</span>,
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
  {
    header: "Lượt xem",
    render: (item) => (
      <span className="text-muted">
        {item.viewCount ? formatNumber(item.viewCount) : "—"}
      </span>
    ),
  },
];

export default function DestinationsPage() {
  return (
    <AdminShell>
      <ResourceList<AdminDestination>
        title="Điểm đến"
        description="Hang động, biển, sông suối, núi rừng và di tích trên khắp Quảng Bình."
        endpoint="/admin/destinations"
        basePath="/admin/destinations"
        columns={columns}
        searchPlaceholder="Tìm theo tên điểm đến"
        createLabel="Thêm điểm đến"
        emptyTitle="Chưa có điểm đến nào khớp"
        getLabel={(item) => item.name}
        filters={[
          {
            param: "category",
            label: "Tất cả loại hình",
            options: destinationCategories.map((c) => ({
              label: c.name,
              value: c.slug,
            })),
          },
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
