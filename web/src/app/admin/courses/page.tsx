"use client";

import { AdminShell } from "@/components/admin/shell";
import { ResourceList, type Column } from "@/components/admin/resource-list";
import { StatusBadge } from "@/components/admin/ui";
import { learningCategories } from "@/lib/filters";
import type { AdminCourse } from "@/lib/admin/types";
import { formatDate, formatNumber } from "@/lib/format";

const columns: Column<AdminCourse>[] = [
  { header: "Tên khóa học", primary: true, render: (item) => item.title },
  {
    header: "Lĩnh vực",
    render: (item) => <span className="text-muted">{item.category?.name ?? "—"}</span>,
  },
  {
    header: "Số bài",
    render: (item) => (
      <span className="text-muted">
        {item.lessonCount > 0 ? `${item.lessonCount} bài` : "Chưa có bài"}
      </span>
    ),
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

export default function CoursesPage() {
  return (
    <AdminShell>
      <ResourceList<AdminCourse>
        title="Khóa học"
        description="Góc học tập: lập trình, ngoại ngữ và các lĩnh vực khác. Mỗi khóa gồm nhiều bài, có thể kèm video."
        endpoint="/admin/courses"
        basePath="/admin/courses"
        columns={columns}
        searchPlaceholder="Tìm theo tên khóa học"
        createLabel="Thêm khóa học"
        emptyTitle="Chưa có khóa học nào khớp"
        getLabel={(item) => item.title}
        filters={[
          {
            param: "category",
            label: "Tất cả lĩnh vực",
            options: learningCategories.map((c) => ({ label: c.name, value: c.slug })),
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
