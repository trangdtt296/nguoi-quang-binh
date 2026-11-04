export interface NavItem {
  label: string;
  href: string;
}

/** Menu chính, dùng chung cho Header và Footer. */
export const mainNav: NavItem[] = [
  { label: "Điểm đến", href: "/diem-den" },
  { label: "Văn hóa", href: "/van-hoa" },
  { label: "Ẩm thực", href: "/am-thuc" },
  { label: "Sự kiện", href: "/su-kien" },
  { label: "Tin tức", href: "/tin-tuc" },
  { label: "Cẩm nang", href: "/cam-nang" },
  { label: "Góc học tập", href: "/goc-hoc-tap" },
  { label: "Thư viện", href: "/thu-vien" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Chuyên mục",
    items: [
      { label: "Điểm đến", href: "/diem-den" },
      { label: "Văn hóa", href: "/van-hoa" },
      { label: "Ẩm thực", href: "/am-thuc" },
      { label: "Sự kiện", href: "/su-kien" },
      { label: "Tin tức", href: "/tin-tuc" },
    ],
  },
  {
    title: "Cẩm nang",
    items: [
      { label: "Thời điểm đi", href: "/cam-nang" },
      { label: "Di chuyển", href: "/cam-nang" },
      { label: "Lưu trú", href: "/cam-nang" },
      { label: "Lịch trình gợi ý", href: "/cam-nang" },
    ],
  },
  {
    title: "Khác",
    items: [
      { label: "Góc học tập", href: "/goc-hoc-tap" },
      { label: "Thư viện ảnh", href: "/thu-vien" },
      { label: "Giới thiệu", href: "/gioi-thieu" },
      { label: "Liên hệ", href: "/lien-he" },
    ],
  },
];
