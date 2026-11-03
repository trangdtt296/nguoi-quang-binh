import type { Album, EventItem, Food, SiteSettings } from "@/types/content";
import { foodCategories } from "./categories";

const f = (slug: string) => foodCategories.find((c) => c.slug === slug);

const p = (text: string) => `<p>${text}</p>`;
const h2 = (text: string) => `<h2>${text}</h2>`;

export const mockFoods: Food[] = [
  {
    id: "f1",
    name: "Cháo hàu",
    slug: "chao-hau",
    summary: "Hàu sông Nhật Lệ nấu cháo loãng, ngọt nước, ăn nóng là ngon nhất.",
    contentHtml: [
      p(
        "Hàu được cào ở vùng nước lợ nơi sông Nhật Lệ gặp biển. Con không to nhưng chắc thịt và ngọt, khác hẳn hàu nuôi.",
      ),
      h2("Nấu thế nào"),
      p(
        "Cháo nấu loãng, gạo rang qua cho thơm rồi mới cho nước. Hàu xào riêng với hành phi, gần ăn mới trút vào nồi — cho sớm quá thì hàu dai.",
      ),
      p(
        "Nêm nhạt tay thôi, vì vị ngọt phải đến từ hàu chứ không phải từ gia vị. Ăn kèm hành lá, rau răm, chút tiêu và vắt thêm quất.",
      ),
      h2("Ăn ở đâu"),
      p(
        "Dọc đường Trương Pháp và khu gần chợ Đồng Hới có nhiều quán bán từ sáng sớm. Người địa phương hay ăn cháo hàu vào bữa sáng.",
      ),
    ].join(""),
    category: f("mon-an"),
    season: "Ngon nhất mùa hè",
    originStory:
      "Món của dân vạn chài, nấu từ thứ cào được ngay dưới chân nhà. Trước là bữa sáng qua ngày, giờ thành món khách tới Quảng Bình nào cũng hỏi.",
    publishedAt: "2026-10-01T01:00:00Z",
  },
  {
    id: "f2",
    name: "Khoai deo",
    slug: "khoai-deo",
    summary: "Khoai lang phơi nhiều nắng tới khi dẻo quánh — món mang về quen thuộc.",
    contentHtml: [
      p(
        "Khoai lang đỏ luộc chín, thái lát rồi phơi. Phơi mấy nắng là tùy nhà: ít nắng thì mềm, nhiều nắng thì dẻo quánh và ngọt đậm hơn.",
      ),
      h2("Vì sao Quảng Bình làm được"),
      p(
        "Đất cát pha và nắng gió miền Trung cho ra củ khoai bột nhiều, ít nước. Chính thứ thời tiết khắc nghiệt ấy lại làm nên món ngon.",
      ),
      p(
        "Khoai deo để được lâu, không cần chất bảo quản, nên thành món mang về phổ biến nhất của vùng này.",
      ),
    ].join(""),
    category: f("dac-san"),
    season: "Quanh năm, ngon nhất sau vụ thu hoạch cuối năm",
    originStory:
      "Ngày trước người ta phơi khoai để dành ăn mùa giáp hạt, chứ không phải để bán. Món chống đói thành đặc sản.",
    publishedAt: "2026-10-02T01:00:00Z",
  },
  {
    id: "f3",
    name: "Bánh lọc Quảng Bình",
    slug: "banh-loc-quang-binh",
    summary: "Vỏ bột lọc trong, nhân tôm thịt, chấm nước mắm ớt cay.",
    contentHtml: [
      p(
        "Bột sắn nhào nước sôi, gói lá chuối, hấp chín. Vỏ bánh trong tới mức nhìn rõ con tôm đỏ bên trong.",
      ),
      h2("Khác gì bánh lọc Huế"),
      p(
        "Bánh lọc Quảng Bình gói to hơn, nhân nhiều hơn, và nước chấm mặn hơn. Người Huế chuộng thanh, người Quảng Bình chuộng đậm.",
      ),
      p("Ăn nóng, chấm nước mắm ớt xanh giã tay. Nguội đi là vỏ cứng lại, mất ngon."),
    ].join(""),
    category: f("mon-an"),
    season: "Quanh năm",
    publishedAt: "2026-10-03T01:00:00Z",
  },
  {
    id: "f4",
    name: "Ruốc tháng Sáu",
    slug: "ruoc-thang-sau",
    summary: "Con ruốc nhỏ đánh vào đúng mùa, làm mắm hoặc rang khô.",
    contentHtml: [
      p(
        "Tháng Sáu âm lịch là mùa ruốc. Cả làng biển ra khơi từ nửa đêm, sáng về là sân nhà nào cũng đỏ một màu.",
      ),
      h2("Hai cách dùng"),
      p(
        "Phần làm mắm ruốc, ủ trong chum mấy tháng. Phần phơi khô để dành, rang với thịt ba chỉ hoặc nấu canh.",
      ),
      p(
        "Mắm ruốc Quảng Bình nặng mùi hơn nhiều vùng khác, nhưng chính cái nặng đó mới đúng vị.",
      ),
    ].join(""),
    category: f("dac-san"),
    season: "Tháng Sáu âm lịch",
    originStory:
      "Ruốc chỉ rộ đúng một tháng trong năm. Trượt mùa là phải đợi năm sau, nên nhà nào cũng tranh thủ làm cho đủ dùng cả năm.",
    publishedAt: "2026-10-04T01:00:00Z",
  },
  {
    id: "f5",
    name: "Cá nghéo bao tử",
    slug: "ca-ngheo-bao-tu",
    summary: "Món hiếm của vùng biển Quảng Bình, chỉ có vào đầu mùa.",
    contentHtml: [
      p(
        "Cá nghéo là loài cá da trơn vùng biển sâu. Phần bao tử được xem là ngon nhất, giòn và không tanh.",
      ),
      p(
        "Thường kho nghệ hoặc nấu canh chua. Vì ít và theo mùa nên không phải lúc nào ra chợ cũng có.",
      ),
    ].join(""),
    category: f("mon-an"),
    season: "Đầu mùa biển, khoảng tháng 3 – tháng 5",
    publishedAt: "2026-10-05T01:00:00Z",
  },
  {
    id: "f6",
    name: "Chắt chắt sông Gianh",
    slug: "chat-chat-song-gianh",
    summary: "Loài hến nhỏ cào ở sông Gianh, xúc bánh tráng ăn giòn tan.",
    contentHtml: [
      p(
        "Chắt chắt là con hến nhỏ bằng đầu đũa, cào ở đáy sông Gianh. Đãi sạch cát là việc mất thời gian nhất.",
      ),
      p(
        "Xào với hành, nghệ và lá lốt, xúc bánh tráng nướng. Món nhậu quen thuộc của người vùng Ba Đồn.",
      ),
    ].join(""),
    category: f("mon-an"),
    season: "Tháng 4 – tháng 8",
    publishedAt: "2026-10-06T01:00:00Z",
  },
];

export const mockEvents: EventItem[] = [
  {
    id: "e1",
    name: "Hội đua thuyền sông Kiến Giang",
    slug: "hoi-dua-thuyen-song-kien-giang",
    summary: "Hội đua thuyền truyền thống dịp Quốc khánh, tổ chức ở huyện Lệ Thủy.",
    contentHtml: [
      p("Các làng trong vùng cử đội tham gia, đua trên sông Kiến Giang."),
      p(
        "Hội thường bắt đầu từ sáng sớm ngày 2/9, nhưng không khí đã rộn từ đêm hôm trước.",
      ),
    ].join(""),
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
    contentHtml: [
      p("Lễ hội thường niên của người Ma Coong, giữ gần như nguyên vẹn tới nay."),
    ].join(""),
    locationText: "Xã Thượng Trạch, Bố Trạch",
    startAt: "2027-02-21T00:00:00Z",
    isRecurring: true,
    publishedAt: "2026-10-18T01:00:00Z",
  },
];

export const mockAlbums: Album[] = [
  {
    id: "al1",
    title: "Phong Nha mùa nước trong",
    slug: "phong-nha-mua-nuoc-trong",
    description:
      "Những ngày sông Son trong nhất trong năm, khi mùa mưa đã qua mà khách thì chưa đông.",
    items: [
      { id: "am1", url: "", altText: "Sông Son nhìn từ bến thuyền Xuân Sơn" },
      { id: "am2", url: "", altText: "Cửa động Phong Nha nhìn từ trên thuyền" },
      { id: "am3", url: "", altText: "Thuyền chờ khách bên bờ sông Son" },
      { id: "am4", url: "", altText: "Thạch nhũ trong lòng động Phong Nha" },
      { id: "am5", url: "", altText: "Đường vào vườn quốc gia buổi sớm" },
      { id: "am6", url: "", altText: "Núi đá vôi soi bóng xuống mặt sông" },
    ],
    publishedAt: "2026-10-10T01:00:00Z",
  },
  {
    id: "al2",
    title: "Một ngày ở Nhật Lệ",
    slug: "mot-ngay-o-nhat-le",
    description: "Từ lúc thuyền về bến tới khi mặt trời xuống sau Bảo Ninh.",
    items: [
      { id: "am7", url: "", altText: "Thuyền đánh cá về bến lúc sáng sớm" },
      { id: "am8", url: "", altText: "Chợ cá bên sông Nhật Lệ" },
      { id: "am9", url: "", altText: "Bãi biển Nhật Lệ buổi chiều" },
      { id: "am10", url: "", altText: "Cầu Nhật Lệ lúc hoàng hôn" },
    ],
    publishedAt: "2026-10-12T01:00:00Z",
  },
  {
    id: "al3",
    title: "Gió Lào và cát trắng",
    slug: "gio-lao-va-cat-trang",
    description: "Đồi cát Quang Phú qua bốn buổi trong ngày.",
    items: [
      { id: "am11", url: "", altText: "Triền cát Quang Phú lúc bình minh" },
      { id: "am12", url: "", altText: "Dấu chân trên cát giữa trưa" },
      { id: "am13", url: "", altText: "Đồi cát lúc hoàng hôn" },
    ],
    publishedAt: "2026-10-14T01:00:00Z",
  },
];

export const siteSettings: SiteSettings = {
  siteName: "Người Quảng Bình",
  slogan: "Vẻ đẹp quê hương trong từng câu chuyện",
  aboutShort:
    "Trang thông tin cộng đồng, phi lợi nhuận, giới thiệu và lan tỏa hình ảnh quê hương Quảng Bình.",
  facebookPageUrl: "https://www.facebook.com/nguoi.quang.binh.chat.phac.gian.di/",
  footerText:
    "© 2026 Người Quảng Bình. Nội dung phi lợi nhuận, phục vụ quảng bá quê hương.",
};
