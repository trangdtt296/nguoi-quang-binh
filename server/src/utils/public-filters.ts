import { Prisma } from "@prisma/client";

/**
 * Điều kiện "nội dung đang hiển thị công khai".
 *
 * Bài đặt lịch tự lên sóng khi tới giờ nhờ điều kiện publishedAt <= now,
 * nên không cần job chạy nền kiểm tra định kỳ.
 */
export function publicWhere() {
  return {
    deletedAt: null,
    status: "published" as const,
    publishedAt: { lte: new Date() },
  };
}

/** Chỉ lọc xóa mềm — dùng cho danh mục, banner, settings. */
export const notDeleted = { deletedAt: null };

/**
 * Tìm kiếm không phân biệt hoa thường trên nhiều cột.
 * Lưu ý: Postgres có phân biệt dấu tiếng Việt, nên "son doong" sẽ không khớp
 * "Sơn Đoòng". Frontend đã bỏ dấu phía người dùng; nếu cần khớp cả không
 * dấu phía server thì phải thêm cột slug hoặc extension unaccent.
 */
export function searchOn(fields: string[], keyword?: string) {
  if (!keyword?.trim()) return undefined;
  const value = keyword.trim();
  return {
    OR: fields.map((field) => ({
      [field]: { contains: value, mode: Prisma.QueryMode.insensitive },
    })),
  };
}
