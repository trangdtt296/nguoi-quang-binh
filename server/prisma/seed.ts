/**
 * Dữ liệu mẫu để demo và kiểm thử.
 *
 * Chạy: npm run db:seed
 * Có thể chạy lại nhiều lần — dùng upsert theo slug nên không tạo bản trùng.
 *
 * Tài khoản super admin lấy từ biến môi trường, không hardcode trong file này.
 */
import "dotenv/config";
import { PrismaClient, type CategoryType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const html = (paragraphs: string[]) => paragraphs.map((p) => `<p>${p}</p>`).join("");
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);

async function main() {
  /* ---------- Tài khoản quản trị ---------- */

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "Thiếu SEED_ADMIN_EMAIL hoặc SEED_ADMIN_PASSWORD trong .env — xem .env.example",
    );
  }
  if (adminPassword.length < 10) {
    throw new Error("SEED_ADMIN_PASSWORD phải dài ít nhất 10 ký tự");
  }

  const admin = await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {},
    create: {
      email: adminEmail.toLowerCase(),
      passwordHash: await bcrypt.hash(adminPassword, 12),
      fullName: "Quản trị viên",
      role: "super_admin",
    },
  });
  console.log(`Tài khoản super admin: ${admin.email}`);

  /* ---------- Danh mục ---------- */

  const categoryData: { type: CategoryType; name: string; slug: string }[] = [
    { type: "destination", name: "Hang động", slug: "hang-dong" },
    { type: "destination", name: "Biển", slug: "bien" },
    { type: "destination", name: "Sông suối", slug: "song-suoi" },
    { type: "destination", name: "Núi rừng", slug: "nui-rung" },
    { type: "destination", name: "Di tích", slug: "di-tich" },
    { type: "article", name: "Tin tức", slug: "tin-tuc" },
    { type: "article", name: "Du lịch", slug: "du-lich" },
    { type: "article", name: "Đời sống", slug: "doi-song" },
    { type: "culture", name: "Lễ hội", slug: "le-hoi" },
    { type: "culture", name: "Nghề truyền thống", slug: "nghe-truyen-thong" },
    { type: "culture", name: "Con người", slug: "con-nguoi" },
    { type: "food", name: "Món ăn", slug: "mon-an" },
    { type: "food", name: "Đặc sản mang về", slug: "dac-san" },
    { type: "guide", name: "Thời điểm đi", slug: "thoi-diem" },
    { type: "guide", name: "Di chuyển", slug: "di-chuyen" },
    { type: "guide", name: "Lưu trú", slug: "luu-tru" },
    { type: "guide", name: "Lịch trình", slug: "lich-trinh" },
    { type: "learning", name: "Lập trình", slug: "lap-trinh" },
    { type: "learning", name: "Tiếng Anh", slug: "tieng-anh" },
    { type: "learning", name: "Tiếng Nhật", slug: "tieng-nhat" },
    { type: "learning", name: "Kỹ năng mềm", slug: "ky-nang-mem" },
    { type: "event", name: "Lễ hội", slug: "su-kien-le-hoi" },
  ];

  for (const [index, row] of categoryData.entries()) {
    await prisma.category.upsert({
      where: { type_slug: { type: row.type, slug: row.slug } },
      update: {},
      create: { ...row, sortOrder: index },
    });
  }

  const cat = async (type: CategoryType, slug: string) =>
    prisma.category.findUniqueOrThrow({ where: { type_slug: { type, slug } } });

  /* ---------- Điểm đến ---------- */

  const destinations = [
    {
      name: "Hang Sơn Đoòng",
      slug: "hang-son-doong",
      categorySlug: "hang-dong",
      region: "Bố Trạch",
      bestTime: "Tháng 1 – tháng 8",
      summary:
        "Hang động lớn nhất thế giới, có rừng nguyên sinh và mây hình thành ngay trong lòng hang.",
      body: [
        "Sơn Đoòng được một người dân địa phương tìm thấy năm 1991 và mãi tới năm 2009 mới được khảo sát đầy đủ. Kết quả đo đạc đưa hang này lên vị trí lớn nhất thế giới xét theo thể tích.",
        "Trong lòng hang có hai hố sụt lớn, nơi ánh sáng mặt trời lọt xuống và nuôi cả một khu rừng nguyên sinh. Độ ẩm và chênh lệch nhiệt độ khiến mây hình thành ngay bên trong hang.",
      ],
      latitude: 17.4505,
      longitude: 106.2875,
      visitInfo: [
        { label: "Hình thức", value: "Tour nhiều ngày, có giấy phép" },
        { label: "Thể lực", value: "Cần sức khỏe tốt, có kinh nghiệm đi rừng" },
      ],
      featured: true,
    },
    {
      name: "Động Phong Nha",
      slug: "dong-phong-nha",
      categorySlug: "hang-dong",
      region: "Bố Trạch",
      bestTime: "Quanh năm",
      summary:
        "Đi thuyền trên sông Son vào tận cửa động — nơi làm nên tên tuổi của cả vườn quốc gia.",
      body: [
        "Khách lên thuyền từ bến Xuân Sơn, xuôi sông Son chừng ba mươi phút rồi thuyền tắt máy, chèo tay đưa vào trong động.",
        "Hệ thống thạch nhũ ở đây hình thành qua hàng triệu năm. Phần lòng động có sông ngầm chảy xuyên suốt.",
      ],
      latitude: 17.5878,
      longitude: 106.2847,
      visitInfo: [
        { label: "Cách đi", value: "Thuyền từ bến Xuân Sơn, khoảng 30 phút" },
        { label: "Phù hợp", value: "Gia đình có trẻ nhỏ và người lớn tuổi" },
      ],
      featured: true,
    },
    {
      name: "Động Thiên Đường",
      slug: "dong-thien-duong",
      categorySlug: "hang-dong",
      region: "Bố Trạch",
      bestTime: "Quanh năm",
      summary: "Thạch nhũ buông như rèm cung điện, lối đi lát gỗ nên hợp cả người lớn tuổi.",
      body: [
        "Động dài hơn 31 km, phần mở cho khách tham quan là khoảng một ki-lô-mét đầu, có cầu thang và sàn gỗ chạy suốt.",
      ],
      visitInfo: [{ label: "Lưu ý", value: "Trong động mát, nên mang áo khoác mỏng" }],
      featured: true,
    },
    {
      name: "Biển Nhật Lệ",
      slug: "bien-nhat-le",
      categorySlug: "bien",
      region: "Đồng Hới",
      bestTime: "Tháng 4 – tháng 8",
      summary: "Bãi cát trắng ngay sát thành phố, chiều xuống cả Đồng Hới kéo nhau ra tắm.",
      body: [
        "Nhật Lệ là bãi biển nằm ngay trong lòng thành phố Đồng Hới, nơi con sông cùng tên đổ ra biển. Bãi thoải, cát mịn và sạch.",
      ],
      latitude: 17.4825,
      longitude: 106.6295,
      visitInfo: [{ label: "Giờ đẹp nhất", value: "Sáng sớm hoặc chiều muộn" }],
      featured: true,
    },
    {
      name: "Suối Nước Moọc",
      slug: "suoi-nuoc-mooc",
      categorySlug: "song-suoi",
      region: "Bố Trạch",
      bestTime: "Tháng 5 – tháng 9",
      summary: "Nước trong xanh mát lạnh chảy giữa rừng, có đường đi bộ và chèo kayak.",
      body: ["Dòng nước trồi lên từ chân núi đá vôi, trong tới mức nhìn rõ đáy."],
      visitInfo: [{ label: "Hoạt động", value: "Tắm suối, đi bộ, chèo kayak" }],
      featured: false,
    },
    {
      name: "Vũng Chùa — Đảo Yến",
      slug: "vung-chua-dao-yen",
      categorySlug: "di-tich",
      region: "Quảng Trạch",
      bestTime: "Quanh năm",
      summary: "Nơi yên nghỉ của Đại tướng Võ Nguyên Giáp, lưng tựa núi, mặt hướng ra biển.",
      body: ["Vũng Chùa nằm dưới chân Đèo Ngang, nhìn ra Đảo Yến."],
      visitInfo: [{ label: "Lưu ý", value: "Ăn mặc chỉnh tề, giữ trật tự khi viếng" }],
      featured: true,
    },
    {
      name: "Đồi cát Quang Phú",
      slug: "doi-cat-quang-phu",
      categorySlug: "bien",
      region: "Đồng Hới",
      bestTime: "Tháng 3 – tháng 8",
      summary: "Những triền cát đổi hình theo gió, đẹp nhất vào lúc mặt trời sắp lặn.",
      body: ["Gió biển liên tục làm đổi hình các triền cát, nên mỗi lần đến lại thấy khác."],
      visitInfo: [{ label: "Lưu ý", value: "Giữa trưa cát rất nóng" }],
      featured: false,
    },
    {
      name: "Đá Nhảy",
      slug: "da-nhay",
      categorySlug: "bien",
      region: "Bố Trạch",
      bestTime: "Tháng 4 – tháng 8",
      summary: "Những khối đá đủ hình thù nhô lên giữa sóng, chụp ảnh lúc bình minh là đẹp nhất.",
      body: ["Bãi nằm dưới chân đèo Lý Hòa. Khi thủy triều xuống có thể đi bộ ra sát mép đá."],
      visitInfo: [{ label: "Lưu ý", value: "Đá trơn, đi giày bám tốt" }],
      featured: false,
    },
  ];

  for (const [index, row] of destinations.entries()) {
    const category = await cat("destination", row.categorySlug);
    await prisma.destination.upsert({
      where: { slug: row.slug },
      update: {},
      create: {
        name: row.name,
        slug: row.slug,
        summary: row.summary,
        contentHtml: html(row.body),
        categoryId: category.id,
        region: row.region,
        bestTime: row.bestTime,
        latitude: row.latitude,
        longitude: row.longitude,
        visitInfo: row.visitInfo,
        status: "published",
        publishedAt: daysAgo(40 - index),
        isFeatured: row.featured,
        viewCount: 500 + index * 137,
      },
    });
  }

  /* ---------- Bài viết ---------- */

  const articles = [
    {
      title: "Lễ hội đua thuyền truyền thống trên sông Kiến Giang",
      slug: "le-hoi-dua-thuyen-song-kien-giang",
      type: "news" as const,
      categoryType: "article" as CategoryType,
      categorySlug: "tin-tuc",
      excerpt:
        "Mỗi độ tháng Tám âm lịch, cả vùng Lệ Thủy lại thức trắng đêm theo tiếng trống giục mái chèo.",
      body: [
        "Hội đua thuyền trên sông Kiến Giang diễn ra vào dịp Quốc khánh 2/9, nhưng không khí đã bắt đầu từ cả tháng trước.",
        "Đêm trước ngày hội, hai bên bờ sông gần như không ai ngủ. Người ta dựng lều, nấu nướng, chờ tới giờ xuất phát lúc rạng sáng.",
      ],
      featured: true,
    },
    {
      title: "Mở thêm tuyến đi bộ khám phá hệ thống hang Tú Làn",
      slug: "mo-tuyen-di-bo-hang-tu-lan",
      type: "news" as const,
      categoryType: "article" as CategoryType,
      categorySlug: "du-lich",
      excerpt: "Tuyến mới dành cho nhóm nhỏ, đi trong ngày, phù hợp với người chưa có kinh nghiệm.",
      body: ["Tuyến rút ngắn hành trình xuống còn một ngày, đi qua ba hang nhỏ và một đoạn suối."],
      featured: false,
    },
    {
      title: "Lễ hội đập trống của người Ma Coong",
      slug: "le-hoi-dap-trong-nguoi-ma-coong",
      type: "culture" as const,
      categoryType: "culture" as CategoryType,
      categorySlug: "le-hoi",
      excerpt: "Một đêm rằm tháng Giêng, tiếng trống vang tới khi mặt trống thủng mới thôi.",
      body: [
        "Người Ma Coong sống ở vùng biên giới phía tây, xã Thượng Trạch. Lễ hội diễn ra vào đêm rằm tháng Giêng hằng năm.",
        "Chiếc trống được làm mới mỗi năm. Theo quan niệm của họ, mặt trống thủng càng sớm thì năm đó càng được mùa.",
      ],
      featured: true,
    },
    {
      title: "Giọng Quảng Bình — thứ tiếng khó lẫn",
      slug: "giong-quang-binh-thu-tieng-kho-lan",
      type: "culture" as const,
      categoryType: "culture" as CategoryType,
      categorySlug: "con-nguoi",
      excerpt: "Nghe nặng mà thương. Đi đâu xa gặp nhau, chỉ cần một câu là nhận ra nhau ngay.",
      body: ["Giọng Quảng Bình nằm ở chỗ giao nhau của nhiều vùng phương ngữ."],
      featured: false,
    },
    {
      title: "Đi Quảng Bình mùa nào thì đẹp",
      slug: "di-quang-binh-mua-nao-dep",
      type: "guide" as const,
      categoryType: "guide" as CategoryType,
      categorySlug: "thoi-diem",
      excerpt: "Tháng 3 đến tháng 8 trời đẹp và khô. Tháng 9 đến tháng 11 hay mưa bão.",
      body: [
        "Mùa khô kéo dài từ khoảng tháng 3 tới tháng 8. Đây là lúc các tour hang động hoạt động đầy đủ nhất.",
        "Từ tháng 9 tới tháng 11 là mùa mưa bão. Nhiều tuyến hang đóng cửa vì nước dâng.",
      ],
      featured: true,
    },
    {
      title: "Đi lại ở Quảng Bình bằng cách nào",
      slug: "di-lai-o-quang-binh",
      type: "guide" as const,
      categoryType: "guide" as CategoryType,
      categorySlug: "di-chuyen",
      excerpt: "Máy bay tới Đồng Hới, tàu Bắc – Nam, hoặc xe khách theo đường Hồ Chí Minh.",
      body: ["Sân bay Đồng Hới có chuyến từ Hà Nội và TP.HCM. Ga Đồng Hới nằm trên tuyến Bắc – Nam."],
      featured: false,
    },
  ];

  for (const [index, row] of articles.entries()) {
    const category = await cat(row.categoryType, row.categorySlug);
    await prisma.article.upsert({
      where: { slug: row.slug },
      update: {},
      create: {
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        content: {},
        contentHtml: html(row.body),
        type: row.type,
        categoryId: category.id,
        authorId: admin.id,
        tags: [],
        status: "published",
        publishedAt: daysAgo(30 - index * 4),
        isFeatured: row.featured,
        viewCount: 300 + index * 211,
      },
    });
  }

  /* ---------- Ẩm thực ---------- */

  const foods = [
    {
      name: "Cháo hàu",
      slug: "chao-hau",
      categorySlug: "mon-an",
      season: "Ngon nhất mùa hè",
      summary: "Hàu sông Nhật Lệ nấu cháo loãng, ngọt nước, ăn nóng là ngon nhất.",
    },
    {
      name: "Khoai deo",
      slug: "khoai-deo",
      categorySlug: "dac-san",
      season: "Quanh năm",
      summary: "Khoai lang phơi nhiều nắng tới khi dẻo quánh — món mang về quen thuộc.",
    },
    {
      name: "Bánh lọc Quảng Bình",
      slug: "banh-loc-quang-binh",
      categorySlug: "mon-an",
      season: "Quanh năm",
      summary: "Vỏ bột lọc trong, nhân tôm thịt, chấm nước mắm ớt cay.",
    },
    {
      name: "Ruốc tháng Sáu",
      slug: "ruoc-thang-sau",
      categorySlug: "dac-san",
      season: "Mùa tháng Sáu",
      summary: "Con ruốc nhỏ đánh vào đúng mùa, làm mắm hoặc rang khô.",
    },
  ];

  for (const [index, row] of foods.entries()) {
    const category = await cat("food", row.categorySlug);
    await prisma.food.upsert({
      where: { slug: row.slug },
      update: {},
      create: {
        name: row.name,
        slug: row.slug,
        summary: row.summary,
        contentHtml: html([row.summary]),
        categoryId: category.id,
        season: row.season,
        status: "published",
        publishedAt: daysAgo(25 - index * 2),
      },
    });
  }

  /* ---------- Sự kiện ---------- */

  await prisma.event.upsert({
    where: { slug: "hoi-dua-thuyen-song-kien-giang" },
    update: {},
    create: {
      name: "Hội đua thuyền sông Kiến Giang",
      slug: "hoi-dua-thuyen-song-kien-giang",
      summary: "Hội đua thuyền truyền thống dịp Quốc khánh, tổ chức ở huyện Lệ Thủy.",
      contentHtml: html(["Các làng trong vùng cử đội tham gia, đua trên sông Kiến Giang."]),
      locationText: "Sông Kiến Giang, Lệ Thủy",
      startAt: new Date("2027-09-02T00:00:00Z"),
      isRecurring: true,
      status: "published",
      publishedAt: daysAgo(14),
    },
  });

  /* ---------- Góc học tập ---------- */

  const courses = [
    {
      title: "Tiếng Anh cho người làm du lịch",
      slug: "tieng-anh-cho-nguoi-lam-du-lich",
      categorySlug: "tieng-anh",
      description:
        "Mẫu câu đón khách, dẫn tour hang động, xử lý tình huống thường gặp ở Phong Nha.",
      lessons: [
        { title: "Làm quen: cách phát âm cơ bản", minutes: 8 },
        { title: "Đón khách ở sân bay Đồng Hới", minutes: 10 },
        { title: "Dẫn khách tham quan hang động", minutes: 12 },
        { title: "Giới thiệu món ăn địa phương", minutes: 9 },
      ],
    },
    {
      title: "Tiếng Nhật N5 — nền tảng đi lao động",
      slug: "tieng-nhat-n5",
      categorySlug: "tieng-nhat",
      description: "Hiragana, Katakana và 300 từ vựng đầu tiên, học từ con số không.",
      lessons: [
        { title: "Bảng chữ Hiragana phần 1", minutes: 14 },
        { title: "Bảng chữ Hiragana phần 2", minutes: 14 },
        { title: "Chào hỏi và giới thiệu bản thân", minutes: 11 },
      ],
    },
    {
      title: "Lập trình web từ đầu — HTML và CSS",
      slug: "lap-trinh-web-tu-dau",
      categorySlug: "lap-trinh",
      description: "Dựng trang web đầu tiên của bạn, không cần biết gì trước đó.",
      lessons: [
        { title: "Trang web được tạo ra thế nào", minutes: 10 },
        { title: "Thẻ HTML cơ bản", minutes: 15 },
        { title: "CSS: màu sắc và khoảng cách", minutes: 16 },
      ],
    },
  ];

  for (const [courseIndex, row] of courses.entries()) {
    const category = await cat("learning", row.categorySlug);
    const course = await prisma.learningCourse.upsert({
      where: { slug: row.slug },
      update: {},
      create: {
        title: row.title,
        slug: row.slug,
        description: row.description,
        categoryId: category.id,
        lessonCount: row.lessons.length,
        status: "published",
        publishedAt: daysAgo(20 - courseIndex * 3),
      },
    });

    for (const [lessonIndex, lesson] of row.lessons.entries()) {
      const lessonSlug = `${row.slug}-bai-${lessonIndex + 1}`;
      await prisma.article.upsert({
        where: { slug: lessonSlug },
        update: {},
        create: {
          title: lesson.title,
          slug: lessonSlug,
          excerpt: `Bài ${lessonIndex + 1} của khóa ${row.title}.`,
          content: {},
          contentHtml: html([
            `Nội dung bài học sẽ do quản trị viên soạn trong CMS. Đây là bản mẫu để kiểm thử.`,
          ]),
          type: "lesson",
          authorId: admin.id,
          courseId: course.id,
          lessonOrder: lessonIndex + 1,
          durationMinutes: lesson.minutes,
          status: "published",
          publishedAt: daysAgo(20 - courseIndex * 3),
        },
      });
    }
  }

  /* ---------- Album ---------- */

  await prisma.album.upsert({
    where: { slug: "phong-nha-mua-nuoc-trong" },
    update: {},
    create: {
      title: "Phong Nha mùa nước trong",
      slug: "phong-nha-mua-nuoc-trong",
      description: "Những ngày sông Son trong nhất trong năm.",
      status: "published",
      publishedAt: daysAgo(10),
    },
  });

  /* ---------- Cấu hình website ---------- */

  const settings: { key: string; value: unknown; group: string }[] = [
    { key: "site_name", value: "Người Quảng Bình", group: "general" },
    { key: "slogan", value: "Vẻ đẹp quê hương trong từng câu chuyện", group: "general" },
    {
      key: "about_short",
      value:
        "Trang thông tin cộng đồng, phi lợi nhuận, giới thiệu và lan tỏa hình ảnh quê hương Quảng Bình.",
      group: "general",
    },
    {
      key: "facebook_page_url",
      value: "https://www.facebook.com/nguoi.quang.binh.chat.phac.gian.di/",
      group: "social",
    },
    {
      key: "footer_text",
      value: "© 2026 Người Quảng Bình. Nội dung phi lợi nhuận, phục vụ quảng bá quê hương.",
      group: "general",
    },
    {
      key: "default_seo_description",
      value:
        "Trang thông tin cộng đồng giới thiệu điểm đến, văn hóa, ẩm thực và con người Quảng Bình.",
      group: "seo",
    },
  ];

  for (const row of settings) {
    await prisma.setting.upsert({
      where: { key: row.key },
      update: {},
      create: { key: row.key, value: row.value as never, group: row.group },
    });
  }

  console.log("Đã tạo xong dữ liệu mẫu.");
}

main()
  .catch((error) => {
    console.error("Seed thất bại:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
