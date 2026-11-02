import type { Article } from "@/types/content";
import { articleCategories, cultureCategories, guideCategories } from "./categories";

const a = (slug: string) => articleCategories.find((c) => c.slug === slug);
const c = (slug: string) => cultureCategories.find((c) => c.slug === slug);
const g = (slug: string) => guideCategories.find((c) => c.slug === slug);

const body = (paragraphs: string[]) => paragraphs.map((p) => `<p>${p}</p>`).join("");

export const mockArticles: Article[] = [
  {
    id: "a1",
    title: "Lễ hội đua thuyền truyền thống trên sông Kiến Giang",
    slug: "le-hoi-dua-thuyen-song-kien-giang",
    excerpt:
      "Mỗi độ tháng Tám âm lịch, cả vùng Lệ Thủy lại thức trắng đêm theo tiếng trống giục mái chèo.",
    contentHtml: body([
      "Hội đua thuyền trên sông Kiến Giang diễn ra vào dịp Quốc khánh 2/9, nhưng không khí đã bắt đầu từ cả tháng trước: các làng chọn trai bơi, sửa thuyền, tập chèo mỗi sáng sớm.",
      "Đêm trước ngày hội, hai bên bờ sông gần như không ai ngủ. Người ta dựng lều, nấu nướng, chờ tới giờ xuất phát lúc rạng sáng.",
      "Điều làm hội đua này khác với nơi khác là nó thuộc về cả cộng đồng chứ không phải một đội riêng nào. Thắng thua rồi cũng qua, nhưng cái cảm giác cả làng cùng đứng trên bờ mà hò thì năm nào cũng vậy.",
    ]),
    type: "news",
    category: a("tin-tuc"),
    authorName: "Ban biên tập",
    tags: ["lễ hội", "Lệ Thủy", "sông Kiến Giang"],
    publishedAt: "2026-11-02T01:00:00Z",
    viewCount: 1876,
    isFeatured: true,
  },
  {
    id: "a2",
    title: "Mở thêm tuyến đi bộ khám phá hệ thống hang Tú Làn",
    slug: "mo-tuyen-di-bo-hang-tu-lan",
    excerpt:
      "Tuyến mới dành cho nhóm nhỏ, đi trong ngày, phù hợp với người chưa có kinh nghiệm leo núi.",
    contentHtml: body([
      "Hệ thống hang Tú Làn nằm ở huyện Minh Hóa, cách Phong Nha chừng bảy mươi ki-lô-mét. Khu vực này vốn chỉ đón các đoàn thám hiểm nhiều ngày.",
      "Tuyến đi bộ mới rút ngắn hành trình xuống còn một ngày, đi qua ba hang nhỏ và một đoạn suối, dành cho nhóm tối đa mười người.",
    ]),
    type: "news",
    category: a("du-lich"),
    authorName: "Ban biên tập",
    tags: ["Tú Làn", "Minh Hóa"],
    publishedAt: "2026-10-21T01:00:00Z",
    viewCount: 1203,
    isFeatured: false,
  },
  {
    id: "a3",
    title: "Làng biển Bảo Ninh vào mùa làm nước mắm",
    slug: "lang-bien-bao-ninh-mua-nuoc-mam",
    excerpt:
      "Tháng Mười, cả làng thơm mùi mắm. Những chum sành phơi kín sân, đợi đủ nắng và đủ tháng.",
    contentHtml: body([
      "Bảo Ninh nằm bên kia sông Nhật Lệ, nhìn sang trung tâm Đồng Hới. Nghề làm nước mắm ở đây truyền qua nhiều đời.",
      "Cá cơm đánh về được trộn muối theo tỉ lệ riêng của từng nhà, ủ trong chum sành phơi ngoài sân. Thời gian ủ tính bằng tháng, không ai vội.",
    ]),
    type: "news",
    category: a("doi-song"),
    authorName: "Ban biên tập",
    tags: ["Bảo Ninh", "nghề truyền thống"],
    publishedAt: "2026-10-15T01:00:00Z",
    viewCount: 864,
    isFeatured: false,
  },
  {
    id: "a4",
    title: "Lễ hội đập trống của người Ma Coong",
    slug: "le-hoi-dap-trong-nguoi-ma-coong",
    excerpt:
      "Một đêm rằm tháng Giêng, tiếng trống vang tới khi mặt trống thủng mới thôi.",
    contentHtml: body([
      "Người Ma Coong sống ở vùng biên giới phía tây, xã Thượng Trạch. Lễ hội đập trống của họ diễn ra vào đêm rằm tháng Giêng hằng năm.",
      "Chiếc trống được làm mới mỗi năm. Khi lễ cúng xong, mọi người thay nhau đánh trống liên tục — theo quan niệm của họ, mặt trống thủng càng sớm thì năm đó càng được mùa.",
      "Đây là một trong những lễ hội giữ được nguyên vẹn nhất ở vùng này, phần vì nó nằm xa, phần vì cộng đồng vẫn coi đó là việc của mình chứ không phải việc biểu diễn.",
    ]),
    type: "culture",
    category: c("le-hoi"),
    authorName: "Ban biên tập",
    tags: ["Ma Coong", "lễ hội", "Thượng Trạch"],
    publishedAt: "2026-10-10T01:00:00Z",
    viewCount: 1420,
    isFeatured: true,
  },
  {
    id: "a5",
    title: "Giọng Quảng Bình — thứ tiếng khó lẫn",
    slug: "giong-quang-binh-thu-tieng-kho-lan",
    excerpt:
      "Nghe nặng mà thương. Đi đâu xa gặp nhau, chỉ cần một câu là nhận ra nhau ngay.",
    contentHtml: body([
      "Giọng Quảng Bình nằm ở chỗ giao nhau của nhiều vùng phương ngữ, nên nghe vừa giống Hà Tĩnh vừa giống Quảng Trị mà lại không phải cả hai.",
      "Người xa quê hay kể chuyện bị hỏi lại vài lần khi mới vào Nam hay ra Bắc. Nhưng cũng chính cái giọng ấy làm người Quảng Bình nhận ra nhau giữa đám đông.",
    ]),
    type: "culture",
    category: c("con-nguoi"),
    authorName: "Ban biên tập",
    tags: ["con người", "ngôn ngữ"],
    publishedAt: "2026-10-05T01:00:00Z",
    viewCount: 986,
    isFeatured: false,
  },
  {
    id: "a6",
    title: "Đi Quảng Bình mùa nào thì đẹp",
    slug: "di-quang-binh-mua-nao-dep",
    excerpt:
      "Tháng 3 đến tháng 8 trời đẹp và khô. Tháng 9 đến tháng 11 hay mưa bão, cần cân nhắc kỹ.",
    contentHtml: body([
      "Mùa khô ở Quảng Bình kéo dài từ khoảng tháng 3 tới tháng 8. Đây là lúc các tour hang động hoạt động đầy đủ nhất, biển cũng lặng và trong.",
      "Từ tháng 9 tới tháng 11 là mùa mưa bão. Nhiều tuyến hang đóng cửa vì nước dâng, lịch bay và tàu xe cũng dễ bị ảnh hưởng. Nếu đi mùa này, nên theo dõi dự báo sát ngày và đặt vé có thể đổi.",
      "Tháng 12 tới tháng 2 trời mát, ít mưa hơn nhưng se lạnh, hợp để đi di tích và ăn uống hơn là tắm biển.",
    ]),
    type: "guide",
    category: g("thoi-diem"),
    authorName: "Ban biên tập",
    tags: ["cẩm nang", "thời tiết"],
    publishedAt: "2026-09-30T01:00:00Z",
    viewCount: 2907,
    isFeatured: true,
  },
];
