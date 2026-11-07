"use client";

import {
  Muted,
  ResourceList,
  publishedAtColumn,
  statusColumn,
  statusFilter,
  type Column,
} from "@/components/admin/resource-list";
import type { AdminAlbum } from "@/lib/admin/types";

const truncate = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max)}…` : value;

const columns: Column<AdminAlbum>[] = [
  { header: "Tên album", primary: true, render: (item) => item.title },
  {
    header: "Mô tả",
    render: (item) => <Muted>{item.description ? truncate(item.description, 70) : null}</Muted>,
  },
  { header: "Thứ tự", render: (item) => <Muted>{item.sortOrder}</Muted> },
  statusColumn,
  publishedAtColumn,
];

export default function AlbumsPage() {
  return (
    <ResourceList<AdminAlbum>
      title="Album ảnh"
      description="Bộ ảnh theo chủ đề cho thư viện hình của website."
      endpoint="/admin/albums"
      columns={columns}
      searchPlaceholder="Tìm theo tên album"
      createLabel="Thêm album"
      emptyTitle="Chưa có album nào khớp"
      unit="album"
      getLabel={(item) => item.title}
      filters={[statusFilter]}
    />
  );
}
