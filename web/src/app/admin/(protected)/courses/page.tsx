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
import type { AdminCourse } from "@/lib/admin/types";

const columns: Column<AdminCourse>[] = [
  { header: "Tên khóa học", primary: true, render: (item) => item.title },
  categoryColumn("Lĩnh vực"),
  {
    header: "Số bài",
    render: (item) => (
      <Muted>{item.lessonCount > 0 ? `${item.lessonCount} bài` : "Chưa có bài"}</Muted>
    ),
  },
  statusColumn,
  publishedAtColumn,
  viewCountColumn,
];

export default function CoursesPage() {
  return (
    <ResourceList<AdminCourse>
      title="Khóa học"
      description="Góc học tập: lập trình, ngoại ngữ và các lĩnh vực khác. Mỗi khóa gồm nhiều bài, có thể kèm video."
      endpoint="/admin/courses"
      columns={columns}
      searchPlaceholder="Tìm theo tên khóa học"
      createLabel="Thêm khóa học"
      emptyTitle="Chưa có khóa học nào khớp"
      unit="khóa học"
      getLabel={(item) => item.title}
      categoryType="learning"
      categoryLabel="Tất cả lĩnh vực"
      filters={[statusFilter]}
    />
  );
}
