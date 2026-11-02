import type {
  Album,
  EventItem,
  Food,
  LearningCourse,
  SiteSettings,
} from "@/types/content";
import { foodCategories, learningCategories } from "./categories";

const f = (slug: string) => foodCategories.find((c) => c.slug === slug);
const l = (slug: string) =>
  learningCategories.find((c) => c.slug === slug) ?? learningCategories[0];

export const mockFoods: Food[] = [
  {
    id: "f1",
    name: "Cháo hàu",
    slug: "chao-hau",
    summary: "Hàu sông Nhật Lệ nấu cháo loãng, ngọt nước, ăn nóng là ngon nhất.",
    contentHtml:
      "<p>Hàu được cào ở vùng nước lợ nơi sông gặp biển, con nhỏ nhưng chắc và ngọt. Cháo nấu loãng, chỉ nêm vừa để không át vị hàu.</p>",
    category: f("mon-an"),
    season: "Ngon nhất mùa hè",
    publishedAt: "2026-10-01T01:00:00Z",
  },
  {
    id: "f2",
    name: "Khoai deo",
    slug: "khoai-deo",
    summary: "Khoai lang phơi nhiều nắng tới khi dẻo quánh — món mang về quen thuộc.",
    contentHtml:
      "<p>Khoai lang đỏ luộc chín, thái lát rồi phơi nhiều nắng. Càng phơi kỹ càng dẻo và ngọt đậm.</p>",
    category: f("dac-san"),
    season: "Quanh năm",
    publishedAt: "2026-10-02T01:00:00Z",
  },
  {
    id: "f3",
    name: "Bánh lọc Quảng Bình",
    slug: "banh-loc-quang-binh",
    summary: "Vỏ bột lọc trong, nhân tôm thịt, chấm nước mắm ớt cay.",
    contentHtml:
      "<p>Bánh lọc gói lá chuối, hấp chín, vỏ trong tới mức nhìn rõ con tôm bên trong.</p>",
    category: f("mon-an"),
    season: "Quanh năm",
    publishedAt: "2026-10-03T01:00:00Z",
  },
  {
    id: "f4",
    name: "Ruốc tháng Sáu",
    slug: "ruoc-thang-sau",
    summary: "Con ruốc nhỏ đánh vào đúng mùa, làm mắm hoặc rang khô.",
    contentHtml:
      "<p>Tháng Sáu âm lịch là mùa ruốc. Người làng biển đánh về, phần làm mắm, phần phơi khô để dành.</p>",
    category: f("dac-san"),
    season: "Mùa tháng Sáu",
    publishedAt: "2026-10-04T01:00:00Z",
  },
];

export const mockEvents: EventItem[] = [
  {
    id: "e1",
    name: "Hội đua thuyền sông Kiến Giang",
    slug: "hoi-dua-thuyen-song-kien-giang",
    summary: "Hội đua thuyền truyền thống dịp Quốc khánh, tổ chức ở huyện Lệ Thủy.",
    contentHtml: "<p>Các làng trong vùng cử đội tham gia, đua trên sông Kiến Giang.</p>",
    locationText: "Sông Kiến Giang, Lệ Thủy",
    startAt: "2027-09-02T00:00:00Z",
    isRecurring: true,
    publishedAt: "2026-10-20T01:00:00Z",
  },
  {
    id: "e2",
    name: "Lễ hội đập trống người Ma Coong",
    slug: "le-hoi-dap-trong",
    summary: "Đêm rằm tháng Giêng ở xã Thượng Trạch, vùng biên giới phía tây.",
    contentHtml: "<p>Lễ hội thường niên của người Ma Coong.</p>",
    locationText: "Xã Thượng Trạch, Bố Trạch",
    startAt: "2027-02-21T00:00:00Z",
    isRecurring: true,
    publishedAt: "2026-10-18T01:00:00Z",
  },
];

export const mockCourses: LearningCourse[] = [
  {
    id: "lc1",
    title: "Tiếng Anh cho người làm du lịch",
    slug: "tieng-anh-cho-nguoi-lam-du-lich",
    description:
      "Mẫu câu đón khách, dẫn tour hang động, xử lý tình huống thường gặp ở Phong Nha.",
    category: l("tieng-anh"),
    lessonCount: 18,
    hasVideo: true,
    publishedAt: "2026-10-01T01:00:00Z",
  },
  {
    id: "lc2",
    title: "Tiếng Nhật N5 — nền tảng đi lao động",
    slug: "tieng-nhat-n5",
    description: "Hiragana, Katakana và 300 từ vựng đầu tiên, học từ con số không.",
    category: l("tieng-nhat"),
    lessonCount: 24,
    hasVideo: true,
    publishedAt: "2026-10-02T01:00:00Z",
  },
  {
    id: "lc3",
    title: "Lập trình web từ đầu — HTML và CSS",
    slug: "lap-trinh-web-tu-dau",
    description: "Dựng trang web đầu tiên của bạn, không cần biết gì trước đó.",
    category: l("lap-trinh"),
    lessonCount: 20,
    hasVideo: true,
    publishedAt: "2026-10-05T01:00:00Z",
  },
  {
    id: "lc4",
    title: "Làm việc từ xa — bắt đầu thế nào",
    slug: "lam-viec-tu-xa",
    description: "Tìm việc, viết hồ sơ, quản lý thời gian khi làm cho công ty ở xa.",
    category: l("ky-nang-mem"),
    lessonCount: 10,
    hasVideo: false,
    publishedAt: "2026-10-08T01:00:00Z",
  },
];

export const mockAlbums: Album[] = [
  {
    id: "al1",
    title: "Phong Nha mùa nước trong",
    slug: "phong-nha-mua-nuoc-trong",
    description: "Những ngày sông Son trong nhất trong năm.",
    items: [
      { id: "am1", url: "", altText: "Sông Son nhìn từ bến thuyền" },
      { id: "am2", url: "", altText: "Cửa động Phong Nha" },
      { id: "am3", url: "", altText: "Thuyền chờ khách bên sông" },
    ],
    publishedAt: "2026-10-10T01:00:00Z",
  },
  {
    id: "al2",
    title: "Một ngày ở Nhật Lệ",
    slug: "mot-ngay-o-nhat-le",
    description: "Từ lúc thuyền về bến tới khi mặt trời xuống.",
    items: [
      { id: "am4", url: "", altText: "Thuyền về bến lúc sáng sớm" },
      { id: "am5", url: "", altText: "Bãi biển Nhật Lệ buổi chiều" },
    ],
    publishedAt: "2026-10-12T01:00:00Z",
  },
];

export const siteSettings: SiteSettings = {
  siteName: "Người Quảng Bình",
  slogan: "Vẻ đẹp quê hương trong từng câu chuyện",
  aboutShort:
    "Trang thông tin cộng đồng, phi lợi nhuận, giới thiệu và lan tỏa hình ảnh quê hương Quảng Bình.",
  facebookPageUrl:
    "https://www.facebook.com/nguoi.quang.binh.chat.phac.gian.di/",
  footerText:
    "© 2026 Người Quảng Bình. Nội dung phi lợi nhuận, phục vụ quảng bá quê hương.",
};
