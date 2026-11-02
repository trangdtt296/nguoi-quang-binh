import type { Category } from "@/types/content";

export const destinationCategories: Category[] = [
  { id: "cd1", type: "destination", name: "Hang động", slug: "hang-dong" },
  { id: "cd2", type: "destination", name: "Biển", slug: "bien" },
  { id: "cd3", type: "destination", name: "Sông suối", slug: "song-suoi" },
  { id: "cd4", type: "destination", name: "Núi rừng", slug: "nui-rung" },
  { id: "cd5", type: "destination", name: "Di tích", slug: "di-tich" },
];

export const articleCategories: Category[] = [
  { id: "ca1", type: "article", name: "Tin tức", slug: "tin-tuc" },
  { id: "ca2", type: "article", name: "Du lịch", slug: "du-lich" },
  { id: "ca3", type: "article", name: "Đời sống", slug: "doi-song" },
];

export const cultureCategories: Category[] = [
  { id: "cc1", type: "culture", name: "Lễ hội", slug: "le-hoi" },
  { id: "cc2", type: "culture", name: "Nghề truyền thống", slug: "nghe-truyen-thong" },
  { id: "cc3", type: "culture", name: "Con người", slug: "con-nguoi" },
];

export const foodCategories: Category[] = [
  { id: "cf1", type: "food", name: "Món ăn", slug: "mon-an" },
  { id: "cf2", type: "food", name: "Đặc sản mang về", slug: "dac-san" },
];

export const guideCategories: Category[] = [
  { id: "cg1", type: "guide", name: "Thời điểm đi", slug: "thoi-diem" },
  { id: "cg2", type: "guide", name: "Di chuyển", slug: "di-chuyen" },
  { id: "cg3", type: "guide", name: "Lưu trú", slug: "luu-tru" },
  { id: "cg4", type: "guide", name: "Lịch trình", slug: "lich-trinh" },
];

export const learningCategories: Category[] = [
  { id: "cl1", type: "learning", name: "Lập trình", slug: "lap-trinh" },
  { id: "cl2", type: "learning", name: "Tiếng Anh", slug: "tieng-anh" },
  { id: "cl3", type: "learning", name: "Tiếng Nhật", slug: "tieng-nhat" },
  { id: "cl4", type: "learning", name: "Kỹ năng mềm", slug: "ky-nang-mem" },
];

/** Danh sách khu vực dùng cho bộ lọc trang Điểm đến. */
export const regions = [
  "Đồng Hới",
  "Bố Trạch",
  "Quảng Trạch",
  "Lệ Thủy",
  "Minh Hóa",
];
