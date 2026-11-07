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
  type ListFilter,
} from "@/components/admin/resource-list";
import { ARTICLE_TYPE_LABELS, type AdminArticle } from "@/lib/admin/types";

const columns: Column<AdminArticle>[] = [
  {
    header: "Tiêu đề",
    primary: true,
    render: (item) => (
      <>
        {item.title}
        {item.isFeatured ? <span className="ml-2 text-[12px] text-muted">· Nổi bật</span> : null}
      </>
    ),
  },
  { header: "Loại", render: (item) => <Muted>{ARTICLE_TYPE_LABELS[item.type]}</Muted> },
  categoryColumn("Chuyên mục"),
  statusColumn,
  publishedAtColumn,
  viewCountColumn,
];

const typeFilter: ListFilter<AdminArticle> = {
  param: "type",
  label: "Tất cả loại bài",
  options: (["news", "culture", "guide"] as const).map((type) => ({
    label: ARTICLE_TYPE_LABELS[type],
    value: type,
  })),
  // API chưa lọc theo loại bài, nên lọc trên trang hiện tại.
  match: (item, value) => item.type === value,
};

export default function ArticlesPage() {
  return (
    <ResourceList<AdminArticle>
      title="Bài viết"
      description="Tin tức, văn hóa và cẩm nang. Bài học của Góc học tập quản lý ở mục Khóa học."
      endpoint="/admin/articles"
      columns={columns}
      searchPlaceholder="Tìm theo tiêu đề"
      createLabel="Soạn bài mới"
      emptyTitle="Chưa có bài viết nào khớp"
      unit="bài"
      getLabel={(item) => item.title}
      filters={[typeFilter, statusFilter]}
    />
  );
}
