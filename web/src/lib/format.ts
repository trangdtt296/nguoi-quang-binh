/** Định dạng hiển thị. Dữ liệu lưu UTC, hiển thị theo giờ Việt Nam. */

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return dateFormatter.format(date);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
});

const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return dateTimeFormatter.format(date);
}

/**
 * Khoảng thời gian của một sự kiện, viết gọn nhất mà vẫn đủ nghĩa.
 *
 * Cùng một ngày thì chỉ ghi ngày một lần rồi ghi hai mốc giờ. Khác ngày thì
 * ghi đủ cả hai. Không có giờ kết thúc thì chỉ ghi mốc bắt đầu.
 */
export function formatEventRange(startIso: string, endIso?: string): string {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return "";

  const startText = formatDateTime(startIso);
  if (!endIso) return startText;

  const end = new Date(endIso);
  if (Number.isNaN(end.getTime())) return startText;

  const sameDay = formatDate(startIso) === formatDate(endIso);
  return sameDay
    ? `${startText} – ${timeFormatter.format(end)}`
    : `${startText} – ${formatDateTime(endIso)}`;
}
