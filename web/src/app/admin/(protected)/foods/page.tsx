"use client";

import {
  Muted,
  ResourceList,
  categoryColumn,
  publishedAtColumn,
  statusColumn,
  statusFilter,
  viewCountColumn,
  type Column,
} from "@/components/admin/resource-list";
import type { AdminFood } from "@/lib/admin/types";

const columns: Column<AdminFood>[] = [
  { header: "Tên món", primary: true, render: (item) => item.name },
  categoryColumn("Nhóm món"),
  { header: "Mùa", render: (item) => <Muted>{item.season}</Muted> },
  statusColumn,
  publishedAtColumn,
  viewCountColumn,
];

export default function FoodsPage() {
  return (
    <ResourceList<AdminFood>
      title="Ẩm thực"
      description="Món ăn, đặc sản và chuyện bếp của người Quảng Bình."
      endpoint="/admin/foods"
      columns={columns}
      searchPlaceholder="Tìm theo tên món"
      createLabel="Thêm món ăn"
      emptyTitle="Chưa có món nào khớp"
      unit="món"
      getLabel={(item) => item.name}
      categoryType="food"
      categoryLabel="Tất cả nhóm món"
      filters={[statusFilter]}
    />
  );
}
