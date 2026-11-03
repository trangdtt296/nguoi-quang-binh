import type { ArticleType } from "@/types/content";

/**
 * Đường dẫn của một bài viết, suy ra từ loại bài.
 *
 * Để ở một chỗ vì nhiều nơi cần dựng link tới bài: card trên trang chủ,
 * danh sách, bài liên quan, kết quả tìm kiếm. Đổi cấu trúc URL thì chỉ sửa
 * đây.
 */
export function articleHref(article: { type: ArticleType; slug: string }): string {
  if (article.type === "culture") return `/van-hoa/${article.slug}`;
  if (article.type === "guide") return `/cam-nang/${article.slug}`;
  if (article.type === "lesson") return `/goc-hoc-tap`;
  return `/tin-tuc/${article.slug}`;
}

/** Nhãn và đường dẫn chuyên mục, dùng cho breadcrumb trang chi tiết. */
export function articleSection(type: ArticleType): { label: string; href: string } {
  if (type === "culture") return { label: "Văn hóa", href: "/van-hoa" };
  if (type === "guide") return { label: "Cẩm nang", href: "/cam-nang" };
  if (type === "lesson") return { label: "Góc học tập", href: "/goc-hoc-tap" };
  return { label: "Tin tức", href: "/tin-tuc" };
}
