"use client";

import {
  Muted,
  ResourceList,
  categoryColumn,
  categoryFilter,
  publishedAtColumn,
  statusColumn,
  statusFilter,
  viewCountColumn,
  type Column,
} from "@/components/admin/resource-list";
import { destinationCategories } from "@/lib/filters";
import type { AdminDestination } from "@/lib/admin/types";

const columns: Column<AdminDestination>[] = [
  { header: "Tên điểm đến", primary: true, render: (item) => item.name },
  categoryColumn("Loại hình"),
  { header: "Khu vực", render: (item) => <Muted>{item.region}</Muted> },
  statusColumn,
  publishedAtColumn,
  viewCountColumn,
];

export default function DestinationsPage() {
  return (
    <ResourceList<AdminDestination>
      title="Điểm đến"
      description="Hang động, biển, sông suối, núi rừng và di tích trên khắp Quảng Bình."
      endpoint="/admin/destinations"
      columns={columns}
      searchPlaceholder="Tìm theo tên điểm đến"
      createLabel="Thêm điểm đến"
      emptyTitle="Chưa có điểm đến nào khớp"
      unit="điểm đến"
      getLabel={(item) => item.name}
      filters={[categoryFilter("Tất cả loại hình", destinationCategories), statusFilter]}
    />
  );
}
