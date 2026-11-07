/** Đổi chỗ hai phần tử, trả về mảng mới (không sửa mảng gốc). */
export function swap<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}
