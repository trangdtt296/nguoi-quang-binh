/**
 * Sinh slug từ tiêu đề tiếng Việt.
 *
 * Bản phía trình duyệt, dùng để điền sẵn ô đường dẫn khi người dùng gõ tiêu
 * đề. Backend có bản riêng trong server/src/utils/slug.ts và nó mới là bản
 * quyết định — nó còn kiểm tra trùng và thêm hậu tố số khi cần.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}
