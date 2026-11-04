"use client";

import { AdminShell } from "@/components/admin/shell";
import { ResourceList, type Column } from "@/components/admin/resource-list";
import { BANNER_POSITION_LABELS, type AdminBanner } from "@/lib/admin/types";
import { formatDate } from "@/lib/format";

const columns: Column<AdminBanner>[] = [
  { header: "Tiêu đề", primary: true, render: (item) => item.title },
  {
    header: "Vị trí",
    render: (item) => (
      <span className="text-muted">{BANNER_POSITION_LABELS[item.position]}</span>
    ),
  },
  {
    header: "Thứ tự",
    render: (item) => <span className="text-muted">{item.sortOrder}</span>,
  },
  {
    header: "Trạng thái",
    render: (item) => (
      <span className="text-muted">{item.isActive ? "Đang bật" : "Đang tắt"}</span>
    ),
  },
  {
    header: "Khoảng hiện",
    render: (item) => (
      <span className="text-muted">
        {item.startAt || item.endAt
          ? `${item.startAt ? formatDate(item.startAt) : "ngay"} – ${
              item.endAt ? formatDate(item.endAt) : "không giới hạn"
            }`
          : "Luôn hiện"}
      </span>
    ),
  },
];

export default function BannersPage() {
  return (
    <AdminShell>
      <ResourceList<AdminBanner>
        title="Banner"
        description="Ảnh lớn ở đầu trang chủ và các khối quảng bá khác. Không phải quảng cáo bán hàng."
        endpoint="/admin/banners"
        basePath="/admin/banners"
        columns={columns}
        searchPlaceholder="Tìm theo tiêu đề banner"
        createLabel="Thêm banner"
        emptyTitle="Chưa có banner nào khớp"
        getLabel={(item) => item.title}
      />
    </AdminShell>
  );
}
