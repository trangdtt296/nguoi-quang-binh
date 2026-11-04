/**
 * Danh sách khu vực hành chính, dùng cho bộ lọc trang Điểm đến và ô chọn
 * trong form thêm điểm đến.
 *
 * Danh mục thì lấy từ API (xem getCategories trong lib/queries.ts), nhưng
 * khu vực thì giữ ở đây có chủ đích: nó không phải bảng trong database mà
 * là một cột chữ trên điểm đến. Để cố định một danh sách dùng chung cho cả
 * form nhập lẫn bộ lọc thì hai bên luôn khớp — nếu để nhập tự do, chỉ cần
 * một lần gõ "Bố Trạch " thừa dấu cách là lọc không ra.
 */
export const regions = [
  "Đồng Hới",
  "Bố Trạch",
  "Quảng Trạch",
  "Lệ Thủy",
  "Minh Hóa",
];
