/**
 * Giới hạn độ dài các ô nhập trên giao diện.
 *
 * Con số chọn theo thực tế nhập liệu và hiển thị, không theo độ rộng cột
 * trong database. Quy tắc duy nhất phải giữ: min ở đây ≥ min của server và
 * max ở đây ≤ max của server (server/src/routes/admin/schemas.ts,
 * server/src/routes/public/misc.ts) — nếu không server sẽ từ chối dữ liệu
 * mà giao diện đã cho qua.
 *
 * Muốn đổi giới hạn nào thì sửa ở đây; schema kiểm tra dữ liệu, thuộc tính
 * minLength/maxLength của ô và lời gợi ý "n/max ký tự" đều đọc từ file này.
 */

export interface Limit {
  min?: number;
  max?: number;
}

export const FIELD_LIMITS = {
  /* ---------- Tài khoản và liên hệ ---------- */

  /** Email thật hiếm khi quá 50 ký tự; 100 là đủ rộng. */
  email: { max: 100 },
  /** Server bắt buộc tối thiểu 10. Tối đa 20 cho dễ nhớ và dễ gõ. */
  password: { min: 10, max: 20 },
  /** Họ tên người Việt đầy đủ thường dưới 30 ký tự. */
  personName: { min: 2, max: 50 },
  /** Số điện thoại có thể gõ kèm dấu cách, dấu chấm: "0912 345 678". */
  phone: { max: 15 },
  contactSubject: { max: 100 },
  contactMessage: { min: 10, max: 2000 },

  /* ---------- Dùng chung cho nội dung ---------- */

  /** Đường dẫn sinh từ tiêu đề nên dài hơn tiêu đề một chút. */
  slug: { max: 200 },
  /** Mô tả ngắn hiện 2–3 dòng trên card. */
  summary: { max: 300 },
  /** Google cắt tiêu đề ở khoảng 60 ký tự. */
  seoTitle: { max: 70 },
  /** Google hiện khoảng 155–160 ký tự mô tả. */
  seoDescription: { max: 160 },

  /* ---------- Từng loại nội dung ---------- */

  articleTitle: { min: 3, max: 150 },
  /** Tên điểm đến, món ăn, sự kiện, album. */
  placeName: { min: 2, max: 100 },
  courseTitle: { min: 3, max: 150 },
  courseDescription: { max: 500 },
  albumDescription: { max: 500 },
  lessonTitle: { min: 3, max: 150 },
  /** "Tháng 3 – tháng 7", "Quanh năm". */
  season: { max: 50 },
  address: { max: 200 },
  locationText: { max: 150 },
  originStory: { max: 3000 },
  bannerTitle: { min: 1, max: 100 },
  bannerSubtitle: { max: 200 },
  categoryName: { min: 1, max: 50 },
  categorySlug: { max: 60 },
  categoryDescription: { max: 200 },

  /* ---------- Danh sách nhiều dòng ---------- */

  placeRowName: { max: 100 },
  placeRowAddress: { max: 200 },
  visitRowLabel: { max: 50 },
  visitRowValue: { max: 200 },
  tag: { max: 30 },
} satisfies Record<string, Limit>;

/** Số dòng / số mục tối đa của các danh sách. */
export const COUNT_LIMITS = {
  /** Quán gợi ý ở trang món ăn. */
  placeRows: 10,
  /** Dòng thông tin tham quan ở trang điểm đến. */
  visitRows: 10,
  /** Từ khóa của một bài viết. */
  tags: 10,
  /** Thứ tự hiển thị: 0–9999 là đủ, ô nhận tối đa 4 chữ số. */
  sortOrder: 9999,
};
