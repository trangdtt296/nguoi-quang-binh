"use client";

import { AdminShell } from "@/components/admin/shell";
import { ResourceList, type Column } from "@/components/admin/resource-list";
import { StatusBadge } from "@/components/admin/ui";
import { foodCategories } from "@/lib/filters";
import type { AdminFood } from "@/lib/admin/types";
import { formatDate, formatNumber } from "@/lib/format";

const columns: Column<AdminFood>[] = [
  { header: "Tên món", primary: true, render: (item) => item.name },
  {
    header: "Nhóm món",
    render: (item) => <span className="text-muted">{item.category?.name ?? "—"}</span>,
  },
  {
    header: "Mùa",
    render: (item) => <span className="text-muted">{item.season || "—"}</span>,
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

export default function FoodsPage() {
  return (
    <AdminShell>
      <ResourceList<AdminFood>
        title="Ẩm thực"
        description="Món ăn, đặc sản và chuyện bếp của người Quảng Bình."
        endpoint="/admin/foods"
        basePath="/admin/foods"
        columns={columns}
        searchPlaceholder="Tìm theo tên món"
        createLabel="Thêm món ăn"
        emptyTitle="Chưa có món nào khớp"
        getLabel={(item) => item.name}
        filters={[
          {
            param: "category",
            label: "Tất cả nhóm món",
            options: foodCategories.map((c) => ({ label: c.name, value: c.slug })),
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
