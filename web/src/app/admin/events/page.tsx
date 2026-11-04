"use client";

import { AdminShell } from "@/components/admin/shell";
import { ResourceList, type Column } from "@/components/admin/resource-list";
import { StatusBadge } from "@/components/admin/ui";
import type { AdminEvent } from "@/lib/admin/types";
import { formatDate } from "@/lib/format";

const columns: Column<AdminEvent>[] = [
  { header: "Tên sự kiện", primary: true, render: (item) => item.name },
  {
    header: "Thời gian",
    render: (item) => (
      <span className="text-muted">
        {formatDate(item.startAt)}
        {item.endAt ? ` – ${formatDate(item.endAt)}` : ""}
      </span>
    ),
  },
  {
    header: "Địa điểm",
    render: (item) => (
      <span className="text-muted">
        {item.destination?.name || item.locationText || "—"}
      </span>
    ),
  },
  {
    header: "Thường niên",
    render: (item) => (
      <span className="text-muted">{item.isRecurring ? "Có" : "—"}</span>
    ),
  },
  { header: "Trạng thái", render: (item) => <StatusBadge status={item.status} /> },
];

export default function EventsPage() {
  return (
    <AdminShell>
      <ResourceList<AdminEvent>
        title="Sự kiện"
        description="Lễ hội, phiên chợ và hoạt động cộng đồng ở Quảng Bình."
        endpoint="/admin/events"
        basePath="/admin/events"
        columns={columns}
        searchPlaceholder="Tìm theo tên sự kiện"
        createLabel="Thêm sự kiện"
        emptyTitle="Chưa có sự kiện nào khớp"
        getLabel={(item) => item.name}
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
