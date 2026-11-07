"use client";

import { Muted, ResourceList, type Column } from "@/components/admin/resource-list";
import { BANNER_POSITION_LABELS, type AdminBanner } from "@/lib/admin/types";
import { formatDate } from "@/lib/format";

function displayWindow(banner: AdminBanner): string {
  if (!banner.startAt && !banner.endAt) return "Luôn hiện";
  const start = banner.startAt ? formatDate(banner.startAt) : "ngay";
  const end = banner.endAt ? formatDate(banner.endAt) : "không giới hạn";
  return `${start} – ${end}`;
}

const columns: Column<AdminBanner>[] = [
  { header: "Tiêu đề", primary: true, render: (item) => item.title },
  { header: "Vị trí", render: (item) => <Muted>{BANNER_POSITION_LABELS[item.position]}</Muted> },
  { header: "Thứ tự", render: (item) => <Muted>{item.sortOrder}</Muted> },
  {
    header: "Trạng thái",
    render: (item) => <Muted>{item.isActive ? "Đang bật" : "Đang tắt"}</Muted>,
  },
  { header: "Khoảng hiện", render: (item) => <Muted>{displayWindow(item)}</Muted> },
];

export default function BannersPage() {
  return (
    <ResourceList<AdminBanner>
      title="Banner"
      description="Ảnh lớn ở đầu trang chủ và các khối quảng bá khác. Không phải quảng cáo bán hàng."
      endpoint="/admin/banners"
      columns={columns}
      searchPlaceholder="Tìm theo tiêu đề banner"
      createLabel="Thêm banner"
      emptyTitle="Chưa có banner nào khớp"
      unit="banner"
      getLabel={(item) => item.title}
    />
  );
}
