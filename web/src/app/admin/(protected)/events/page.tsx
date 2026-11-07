"use client";

import {
  Muted,
  ResourceList,
  statusColumn,
  statusFilter,
  type Column,
} from "@/components/admin/resource-list";
import type { AdminEvent } from "@/lib/admin/types";
import { formatDate } from "@/lib/format";

const columns: Column<AdminEvent>[] = [
  { header: "Tên sự kiện", primary: true, render: (item) => item.name },
  {
    header: "Thời gian",
    render: (item) => (
      <Muted>
        {formatDate(item.startAt)}
        {item.endAt ? ` – ${formatDate(item.endAt)}` : ""}
      </Muted>
    ),
  },
  {
    header: "Địa điểm",
    render: (item) => <Muted>{item.destination?.name || item.locationText}</Muted>,
  },
  { header: "Thường niên", render: (item) => <Muted>{item.isRecurring ? "Có" : null}</Muted> },
  statusColumn,
];

export default function EventsPage() {
  return (
    <ResourceList<AdminEvent>
      title="Sự kiện"
      description="Lễ hội, phiên chợ và hoạt động cộng đồng ở Quảng Bình."
      endpoint="/admin/events"
      columns={columns}
      searchPlaceholder="Tìm theo tên sự kiện"
      createLabel="Thêm sự kiện"
      emptyTitle="Chưa có sự kiện nào khớp"
      unit="sự kiện"
      getLabel={(item) => item.name}
      filters={[statusFilter]}
    />
  );
}
