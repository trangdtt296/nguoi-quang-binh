import type { LearningCourse, Lesson } from "@/types/content";
import { learningCategories } from "./categories";

const l = (slug: string) =>
  learningCategories.find((c) => c.slug === slug) ?? learningCategories[0];

const html = (parts: string[]) => parts.join("");
const p = (text: string) => `<p>${text}</p>`;
const h2 = (text: string) => `<h2>${text}</h2>`;
const ul = (items: string[]) =>
  `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;

export const mockCourses: LearningCourse[] = [
  {
    id: "lc1",
    title: "Tiếng Anh cho người làm du lịch",
    slug: "tieng-anh-cho-nguoi-lam-du-lich",
    description:
      "Mẫu câu đón khách, dẫn tour hang động, xử lý tình huống thường gặp ở Phong Nha. Học từ con số không.",
    category: l("tieng-anh"),
    lessonCount: 4,
    hasVideo: true,
    publishedAt: "2026-10-01T01:00:00Z",
  },
  {
    id: "lc2",
    title: "Tiếng Nhật N5 — nền tảng đi lao động",
    slug: "tieng-nhat-n5",
    description:
      "Hiragana, Katakana và những mẫu câu đầu tiên. Dành cho người chuẩn bị đi làm việc tại Nhật.",
    category: l("tieng-nhat"),
    lessonCount: 3,
    hasVideo: true,
    publishedAt: "2026-10-02T01:00:00Z",
  },
  {
    id: "lc3",
    title: "Lập trình web từ đầu — HTML và CSS",
    slug: "lap-trinh-web-tu-dau",
    description:
      "Dựng trang web đầu tiên của bạn, không cần biết gì trước đó. Chỉ cần một chiếc máy tính.",
    category: l("lap-trinh"),
    lessonCount: 3,
    hasVideo: true,
    publishedAt: "2026-10-05T01:00:00Z",
  },
  {
    id: "lc4",
    title: "Làm việc từ xa — bắt đầu thế nào",
    slug: "lam-viec-tu-xa",
    description:
      "Tìm việc, viết hồ sơ, quản lý thời gian khi làm cho công ty ở xa mà vẫn ở lại quê.",
    category: l("ky-nang-mem"),
    lessonCount: 2,
    hasVideo: false,
    publishedAt: "2026-10-08T01:00:00Z",
  },
];

export const mockLessons: Lesson[] = [
  /* Tiếng Anh cho người làm du lịch */
  {
    id: "ls1",
    courseSlug: "tieng-anh-cho-nguoi-lam-du-lich",
    lessonOrder: 1,
    title: "Làm quen: cách phát âm cơ bản",
    slug: "cach-phat-am-co-ban",
    excerpt: "Những âm người Việt hay phát sai nhất, và cách sửa.",
    durationMinutes: 8,
    contentHtml: html([
      p(
        "Người Việt học tiếng Anh thường vấp ở ba chỗ giống nhau: âm cuối, âm /θ/ và trọng âm. Bài này chỉ tập trung vào ba thứ đó, vì sửa được chúng là người nghe hiểu bạn ngay.",
      ),
      h2("1. Âm cuối"),
      p(
        "Tiếng Việt không đọc phụ âm cuối rõ như tiếng Anh. Khi nói <em>cave</em> mà bỏ mất âm /v/, người nghe có thể hiểu thành <em>cay</em>. Hãy tập đọc rõ phần đuôi từ, dù chỉ nhẹ.",
      ),
      h2("2. Âm /θ/ trong think, three"),
      p(
        "Đặt lưỡi chạm nhẹ vào mép răng trên rồi đẩy hơi ra. Nghe hơi lạ lúc đầu nhưng quen rất nhanh.",
      ),
      h2("3. Trọng âm"),
      p("Đọc sai trọng âm làm người nghe khó hiểu hơn cả đọc sai âm. Ví dụ:"),
      ul([
        "<strong>CA</strong>-ve (hang) — nhấn vào âm đầu",
        "<strong>ho</strong>-TEL (khách sạn) — nhấn vào âm sau",
        "<strong>WEL</strong>-come (chào mừng) — nhấn vào âm đầu",
      ]),
    ]),
    publishedAt: "2026-10-01T01:00:00Z",
  },
  {
    id: "ls2",
    courseSlug: "tieng-anh-cho-nguoi-lam-du-lich",
    lessonOrder: 2,
    title: "Đón khách ở sân bay Đồng Hới",
    slug: "don-khach-o-san-bay-dong-hoi",
    excerpt: "Chào hỏi, xác nhận tên khách, hướng dẫn ra xe.",
    durationMinutes: 10,
    contentHtml: html([
      p(
        "Mấy phút đầu tiên quyết định ấn tượng của khách về cả chuyến đi. Không cần nói hay, chỉ cần rõ ràng và đúng việc.",
      ),
      h2("Xác nhận đúng người"),
      ul([
        "Excuse me, are you Mr. Brown? I'm Nam from Phong Nha Tours.",
        "Welcome to Quảng Bình. How was your flight?",
      ]),
      h2("Dẫn ra xe"),
      ul([
        "Let me help you with your luggage.",
        "Our car is just outside, this way please.",
        "The drive to Phong Nha takes about fifty minutes.",
      ]),
      h2("Khi khách chưa tới"),
      p(
        "Nếu chuyến bay trễ, nhắn cho khách một câu ngắn thay vì đứng đợi im lặng: <em>Hi Mr. Brown, I'm at the arrival gate with a sign. Take your time.</em>",
      ),
    ]),
    publishedAt: "2026-10-01T01:00:00Z",
  },
  {
    id: "ls3",
    courseSlug: "tieng-anh-cho-nguoi-lam-du-lich",
    lessonOrder: 3,
    title: "Dẫn khách tham quan hang động",
    slug: "dan-khach-tham-quan-hang-dong",
    excerpt: "Giới thiệu bản thân, dặn an toàn, ước lượng thời gian.",
    durationMinutes: 12,
    contentHtml: html([
      p(
        "Khi dẫn một đoàn khách nước ngoài vào hang, ba việc bạn phải nói được ngay từ đầu: giới thiệu bản thân, dặn an toàn, và ước lượng thời gian.",
      ),
      h2("1. Chào và giới thiệu"),
      ul([
        "Good morning everyone, my name is Nam and I'll be your guide today.",
        "We're going to explore Phong Nha cave, and the tour takes about two hours.",
      ]),
      h2("2. Dặn dò an toàn"),
      p("Phần này bắt buộc phải nói, kể cả khi khách có vẻ đã biết. Nói chậm, nhấn vào động từ."),
      ul([
        "Please keep your life jacket on while we're on the boat.",
        "The ground inside the cave is wet, so watch your step.",
        "Please stay with the group and don't touch the formations.",
      ]),
      h2("3. Từ vựng của bài"),
      p(
        "Mười hai từ sau bạn sẽ dùng mỗi ngày nếu làm hướng dẫn ở Phong Nha: cave, cavern, stalactite, stalagmite, limestone, boat, life jacket, flashlight, slippery, ceiling, entrance, formation.",
      ),
    ]),
    publishedAt: "2026-10-01T01:00:00Z",
  },
  {
    id: "ls4",
    courseSlug: "tieng-anh-cho-nguoi-lam-du-lich",
    lessonOrder: 4,
    title: "Giới thiệu món ăn địa phương",
    slug: "gioi-thieu-mon-an-dia-phuong",
    excerpt: "Nói về nguyên liệu, vị, và cách ăn sao cho khách muốn thử.",
    durationMinutes: 9,
    contentHtml: html([
      p(
        "Khách thường ngại món lạ vì không biết trong đó có gì. Nói đúng ba điều: làm từ gì, vị thế nào, ăn ra sao.",
      ),
      h2("Mẫu câu"),
      ul([
        "This is cháo hàu — rice porridge with oysters from the Nhật Lệ river.",
        "It's mild and slightly sweet, not spicy at all.",
        "Squeeze a bit of lime on top before you eat it.",
      ]),
      h2("Khi khách hỏi về dị ứng"),
      p(
        "Luôn hỏi lại trước khi gọi món: <em>Do you have any food allergies? This dish contains shellfish.</em>",
      ),
    ]),
    publishedAt: "2026-10-01T01:00:00Z",
  },

  /* Tiếng Nhật N5 */
  {
    id: "ls5",
    courseSlug: "tieng-nhat-n5",
    lessonOrder: 1,
    title: "Bảng chữ Hiragana — phần 1",
    slug: "hiragana-phan-1",
    excerpt: "Hàng あ đến の, cách viết và cách nhớ.",
    durationMinutes: 14,
    contentHtml: html([
      p(
        "Hiragana có 46 chữ. Bài này học 25 chữ đầu. Đừng cố thuộc hết trong một buổi — chia ra ba ngày, mỗi ngày một ít thì nhớ lâu hơn nhiều.",
      ),
      h2("Hàng あ (a i u e o)"),
      p("Năm nguyên âm, nền tảng của mọi chữ còn lại: あ (a), い (i), う (u), え (e), お (o)."),
      h2("Cách luyện"),
      ul([
        "Viết tay mỗi chữ mười lần, vừa viết vừa đọc thành tiếng",
        "Che phần chữ, nhìn phiên âm và viết lại",
        "Mỗi ngày ôn lại các chữ hôm trước trước khi học chữ mới",
      ]),
    ]),
    publishedAt: "2026-10-02T01:00:00Z",
  },
  {
    id: "ls6",
    courseSlug: "tieng-nhat-n5",
    lessonOrder: 2,
    title: "Bảng chữ Hiragana — phần 2",
    slug: "hiragana-phan-2",
    excerpt: "Hàng は đến ん, và các âm biến thể.",
    durationMinutes: 14,
    contentHtml: html([
      p("Nốt 21 chữ còn lại, cộng thêm các âm đục như が, ざ, だ, ば và âm ぱ."),
      h2("Mẹo phân biệt chữ dễ nhầm"),
      ul([
        "ね, れ, わ — khác nhau ở phần đuôi",
        "さ và き — số nét khác nhau",
        "は và ほ — ほ có thêm một nét ngang",
      ]),
    ]),
    publishedAt: "2026-10-02T01:00:00Z",
  },
  {
    id: "ls7",
    courseSlug: "tieng-nhat-n5",
    lessonOrder: 3,
    title: "Chào hỏi và giới thiệu bản thân",
    slug: "chao-hoi-va-gioi-thieu",
    excerpt: "Những câu đầu tiên bạn sẽ dùng khi sang Nhật.",
    durationMinutes: 11,
    contentHtml: html([
      h2("Chào theo buổi"),
      ul([
        "おはようございます — chào buổi sáng",
        "こんにちは — chào buổi trưa và chiều",
        "こんばんは — chào buổi tối",
      ]),
      h2("Giới thiệu bản thân"),
      p(
        "はじめまして。グエン・ナムです。ベトナムから来ました。よろしくお願いします。 — Rất vui được gặp. Tôi là Nguyễn Nam. Tôi đến từ Việt Nam. Mong được giúp đỡ.",
      ),
      p(
        "Câu cuối よろしくお願いします không dịch sát được sang tiếng Việt, nhưng rất quan trọng: người Nhật nói nó mỗi khi bắt đầu làm việc cùng ai.",
      ),
    ]),
    publishedAt: "2026-10-02T01:00:00Z",
  },

  /* Lập trình web từ đầu */
  {
    id: "ls8",
    courseSlug: "lap-trinh-web-tu-dau",
    lessonOrder: 1,
    title: "Trang web được tạo ra thế nào",
    slug: "trang-web-duoc-tao-ra-the-nao",
    excerpt: "Hiểu bức tranh tổng thể trước khi gõ dòng code đầu tiên.",
    durationMinutes: 10,
    contentHtml: html([
      p(
        "Mỗi trang web bạn mở đều là một file văn bản mà trình duyệt đọc rồi vẽ ra màn hình. Không có gì huyền bí ở đây.",
      ),
      h2("Ba thứ tạo nên một trang"),
      ul([
        "<strong>HTML</strong> — nội dung: chữ, ảnh, nút bấm",
        "<strong>CSS</strong> — hình thức: màu sắc, cỡ chữ, bố cục",
        "<strong>JavaScript</strong> — hành vi: bấm vào thì xảy ra gì",
      ]),
      p(
        "Ví như xây nhà: HTML là tường và cửa, CSS là sơn và nội thất, JavaScript là điện nước.",
      ),
      h2("Chuẩn bị"),
      p(
        "Bạn chỉ cần một trình soạn thảo miễn phí như Visual Studio Code và một trình duyệt. Không cần cài gì thêm.",
      ),
    ]),
    publishedAt: "2026-10-05T01:00:00Z",
  },
  {
    id: "ls9",
    courseSlug: "lap-trinh-web-tu-dau",
    lessonOrder: 2,
    title: "Thẻ HTML cơ bản",
    slug: "the-html-co-ban",
    excerpt: "Tiêu đề, đoạn văn, danh sách, ảnh và liên kết.",
    durationMinutes: 15,
    contentHtml: html([
      p("HTML viết bằng các thẻ, mỗi thẻ có thẻ mở và thẻ đóng."),
      h2("Những thẻ dùng nhiều nhất"),
      ul([
        "<code>&lt;h1&gt;</code> đến <code>&lt;h6&gt;</code> — tiêu đề, h1 lớn nhất",
        "<code>&lt;p&gt;</code> — một đoạn văn",
        "<code>&lt;ul&gt;</code> và <code>&lt;li&gt;</code> — danh sách",
        "<code>&lt;a href=\"...\"&gt;</code> — liên kết",
        "<code>&lt;img src=\"...\" alt=\"...\"&gt;</code> — ảnh",
      ]),
      h2("Lưu ý về alt"),
      p(
        "Thuộc tính <code>alt</code> mô tả ảnh cho người khiếm thị và cho công cụ tìm kiếm. Đừng bỏ trống.",
      ),
    ]),
    publishedAt: "2026-10-05T01:00:00Z",
  },
  {
    id: "ls10",
    courseSlug: "lap-trinh-web-tu-dau",
    lessonOrder: 3,
    title: "CSS: màu sắc và khoảng cách",
    slug: "css-mau-sac-va-khoang-cach",
    excerpt: "Làm trang web trông ra hình ra dạng.",
    durationMinutes: 16,
    contentHtml: html([
      p("CSS gắn hình thức cho từng phần nội dung bạn đã viết bằng HTML."),
      h2("Cú pháp"),
      p(
        "Chọn phần tử, rồi liệt kê các thuộc tính: <code>p { color: #333; font-size: 16px; }</code>",
      ),
      h2("Khoảng cách"),
      ul([
        "<code>padding</code> — khoảng trống bên trong, giữa viền và nội dung",
        "<code>margin</code> — khoảng trống bên ngoài, giữa phần tử này với phần tử khác",
      ]),
      p(
        "Phần lớn lỗi bố cục của người mới đến từ việc nhầm hai thứ này. Mở công cụ Inspect của trình duyệt là nhìn thấy ngay chúng nằm đâu.",
      ),
    ]),
    publishedAt: "2026-10-05T01:00:00Z",
  },

  /* Làm việc từ xa */
  {
    id: "ls11",
    courseSlug: "lam-viec-tu-xa",
    lessonOrder: 1,
    title: "Tìm việc từ xa ở đâu",
    slug: "tim-viec-tu-xa-o-dau",
    excerpt: "Các kênh thật sự có việc, và cách tránh tin lừa đảo.",
    durationMinutes: 12,
    contentHtml: html([
      p(
        "Việc làm từ xa có thật, nhưng tin tuyển dụng giả cũng nhiều. Bài này nói cả hai mặt.",
      ),
      h2("Dấu hiệu tin giả"),
      ul([
        "Yêu cầu nộp tiền trước dưới bất kỳ hình thức nào",
        "Hứa thu nhập cao bất thường cho công việc đơn giản",
        "Không có thông tin công ty rõ ràng, chỉ liên hệ qua ứng dụng nhắn tin",
      ]),
      p(
        "Nguyên tắc: nhà tuyển dụng thật không bao giờ bắt ứng viên trả tiền để được nhận việc.",
      ),
    ]),
    publishedAt: "2026-10-08T01:00:00Z",
  },
  {
    id: "ls12",
    courseSlug: "lam-viec-tu-xa",
    lessonOrder: 2,
    title: "Quản lý thời gian khi làm ở nhà",
    slug: "quan-ly-thoi-gian-khi-lam-o-nha",
    excerpt: "Giữ ranh giới giữa giờ làm và giờ nghỉ.",
    durationMinutes: 9,
    contentHtml: html([
      p(
        "Khó khăn lớn nhất của làm từ xa không phải là công việc, mà là không có ranh giới. Nhà vừa là chỗ ở vừa là chỗ làm.",
      ),
      h2("Vài cách đơn giản mà hiệu quả"),
      ul([
        "Có một chỗ ngồi cố định chỉ dùng để làm việc",
        "Đặt giờ bắt đầu và giờ kết thúc, rồi tôn trọng nó",
        "Báo trước với người nhà khung giờ bạn cần yên tĩnh",
      ]),
    ]),
    publishedAt: "2026-10-08T01:00:00Z",
  },
];
