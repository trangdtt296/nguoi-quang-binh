import Link from "next/link";
import { CalendarDays, Bus, Home as HomeIcon, Compass } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { ContentImage } from "@/components/shared/content-image";
import {
  ArticleRow,
  CourseCard,
  DestinationCard,
  FoodCard,
} from "@/components/content/cards";
import { ButtonLink, SectionHeading, EmptyState } from "@/components/ui";
import {
  getAlbums,
  getArticles,
  getCourses,
  getFeaturedDestinations,
  getFeaturedFoods,
  getSiteSettings,
} from "@/lib/queries";
import { formatDate } from "@/lib/format";

const guideHighlights = [
  {
    icon: CalendarDays,
    title: "Thời điểm nên đi",
    desc: "Tháng 3 đến tháng 8 trời đẹp. Tháng 9–11 hay mưa bão, cân nhắc kỹ.",
  },
  {
    icon: Bus,
    title: "Cách di chuyển",
    desc: "Máy bay tới Đồng Hới, tàu Bắc – Nam, hoặc xe khách đường Hồ Chí Minh.",
  },
  {
    icon: HomeIcon,
    title: "Ở đâu",
    desc: "Khách sạn ở Đồng Hới, homestay ở Phong Nha nếu muốn gần hang động.",
  },
  {
    icon: Compass,
    title: "Lịch trình gợi ý",
    desc: "Ba ngày hai đêm là vừa đủ cho hang động, biển và một buổi ăn chơi.",
  },
];

export default async function HomePage() {
  const [settings, destinations, culture, news, foods, courses, albums] =
    await Promise.all([
      getSiteSettings(),
      getFeaturedDestinations(6),
      getArticles({ type: "culture", limit: 3 }),
      getArticles({ type: "news", limit: 5 }),
      getFeaturedFoods(4),
      getCourses(),
      getAlbums(2),
    ]);

  const [leadStory, ...otherNews] = news.items;

  return (
    <>
      <Hero slogan={settings.slogan} />

      {/* Giới thiệu */}
      <section className="bg-surface-alt py-14 md:py-22">
        <div className="container-page flex flex-wrap items-center gap-14">
          <div className="flex-1 basis-[420px]">
            <p className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-deep">
              Về quê hương
            </p>
            <h2 className="text-[28px] font-bold leading-tight tracking-[-0.01em] md:text-[36px]">
              Một dải đất hẹp, chứa cả kỳ quan
            </h2>
            <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-muted">
              Quảng Bình nằm nơi khúc ruột miền Trung, chỗ hẹp nhất chỉ hơn 40 cây số
              từ biển lên tới biên giới. Vậy mà trong dải đất ấy có vườn quốc gia được
              UNESCO công nhận, hang động lớn nhất hành tinh, những bãi cát trắng trải
              dài và một nền ẩm thực mặn mòi vị biển.
            </p>
            <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-muted">
              Từ ngày 1/7/2025, Quảng Bình hợp nhất với Quảng Trị thành tỉnh Quảng Trị,
              trung tâm đặt tại Đồng Hới. Tên tỉnh đổi, nhưng đất và người thì vẫn vậy.
            </p>
            <ButtonLink href="/gioi-thieu" variant="ghost" className="mt-7">
              Tìm hiểu thêm
            </ButtonLink>
          </div>
          <ContentImage
            alt="Ảnh toàn cảnh Phong Nha — Kẻ Bàng"
            ratio="4/3"
            className="flex-1 basis-[380px] rounded-[12px]"
            sizes="(max-width: 768px) 100vw, 480px"
          />
        </div>
      </section>

      {/* Điểm đến */}
      <section className="py-14 md:py-22">
        <div className="container-page">
          <SectionHeading
            eyebrow="Khám phá"
            title="Điểm đến nổi bật"
            lede="Hang động, biển, sông suối, núi rừng và di tích — chọn nơi bạn muốn đặt chân tới."
            action={
              <ButtonLink href="/diem-den" variant="ghost">
                Xem tất cả
              </ButtonLink>
            }
          />
          {destinations.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map((item) => (
                <DestinationCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyState title="Chưa có điểm đến nào được đăng" />
          )}
        </div>
      </section>

      {/* Văn hóa */}
      <section className="bg-abyss py-14 text-white md:py-22">
        <div className="container-page">
          <SectionHeading
            tone="dark"
            eyebrow="Văn hóa & con người"
            title="Chất phác, giản dị"
            lede="Những câu chuyện về lễ hội, nghề cũ và người Quảng Bình — kể bằng giọng của chính người trong cuộc."
            action={
              <ButtonLink
                href="/van-hoa"
                variant="ghost"
                className="border-white/45 text-white hover:border-white"
              >
                Xem tất cả
              </ButtonLink>
            }
          />
          {culture.items.length ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {culture.items.map((item) => (
                <Link key={item.id} href={`/van-hoa/${item.slug}`} className="group block">
                  <ContentImage
                    alt={`Ảnh bài viết ${item.title}`}
                    ratio="4/3"
                    className="rounded-[12px]"
                  />
                  <h3 className="mt-4.5 font-serif text-[22px] font-semibold leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-silver">
                    {item.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="Chưa có bài viết văn hóa nào" />
          )}
        </div>
      </section>

      {/* Ẩm thực */}
      <section className="py-14 md:py-22">
        <div className="container-page">
          <SectionHeading
            eyebrow="Ẩm thực quê hương"
            title="Mặn mòi vị biển"
            lede="Món ăn nào cũng có một câu chuyện và một mùa riêng của nó."
            action={
              <ButtonLink href="/am-thuc" variant="ghost">
                Xem tất cả món
              </ButtonLink>
            }
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {foods.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Tin tức */}
      <section className="bg-surface-alt py-14 md:py-22">
        <div className="container-page">
          <SectionHeading
            eyebrow="Tin tức & sự kiện"
            title="Chuyện mới ở quê"
            action={
              <ButtonLink href="/tin-tuc" variant="ghost">
                Tất cả tin tức
              </ButtonLink>
            }
          />
          {leadStory ? (
            <div className="flex flex-wrap gap-8">
              <div className="min-w-0 flex-[999_1_520px]">
                <Link
                  href={`/tin-tuc/${leadStory.slug}`}
                  className="group block overflow-hidden rounded-[12px] border border-line bg-surface transition-shadow hover:shadow-[0_10px_28px_rgba(13,17,20,0.1)]"
                >
                  <ContentImage
                    alt={`Ảnh bài viết ${leadStory.title}`}
                    ratio="16/9"
                    sizes="(max-width: 768px) 100vw, 640px"
                  />
                  <div className="p-6">
                    <h3 className="font-serif text-[26px] font-semibold leading-snug md:text-[28px]">
                      {leadStory.title}
                    </h3>
                    <p className="mt-3 text-[15.5px] leading-relaxed text-muted">
                      {leadStory.excerpt}
                    </p>
                    <p className="mt-4 text-[13px] text-muted">
                      {formatDate(leadStory.publishedAt)} · {leadStory.authorName}
                    </p>
                  </div>
                </Link>
              </div>
              <div className="flex min-w-0 flex-1 basis-[340px] flex-col gap-4.5">
                {otherNews.map((item) => (
                  <ArticleRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="Chưa có tin tức nào" />
          )}
        </div>
      </section>

      {/* Cẩm nang */}
      <section className="py-14 md:py-22">
        <div className="container-page">
          <SectionHeading eyebrow="Cẩm nang du lịch" title="Đi Quảng Bình cần biết gì" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {guideHighlights.map(({ icon: Icon, title, desc }) => (
              <Link
                key={title}
                href="/cam-nang"
                className="block rounded-[12px] border border-line bg-surface p-6 transition-colors hover:border-ink"
              >
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-primary-50 text-ink">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3 className="text-[17px] font-semibold">{title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Góc học tập */}
      <section className="border-t border-line bg-surface-alt py-14 md:py-22">
        <div className="container-page">
          <SectionHeading
            eyebrow="Góc học tập"
            title="Biết thêm một chữ, rộng thêm một đường"
            lede="Ngoại ngữ, lập trình, và nhiều thứ khác. Mỗi khóa chia thành từng bài, học đến đâu biết đến đó."
            action={
              <ButtonLink href="/goc-hoc-tap" variant="ghost">
                Xem các khóa học
              </ButtonLink>
            }
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((item) => (
              <CourseCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Thư viện */}
      <section className="py-14 md:py-22">
        <div className="container-page">
          <SectionHeading
            eyebrow="Thư viện"
            title="Quảng Bình qua ống kính"
            action={
              <ButtonLink href="/thu-vien" variant="ghost">
                Xem album
              </ButtonLink>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {albums.flatMap((album) =>
              album.items.slice(0, 2).map((media) => (
                <Link
                  key={media.id}
                  href={`/thu-vien/${album.slug}`}
                  className="group block"
                >
                  <ContentImage
                    src={media.url}
                    alt={media.altText}
                    ratio="4/3"
                    className="rounded-[12px]"
                  />
                </Link>
              )),
            )}
          </div>
        </div>
      </section>

      {/* Fanpage */}
      <section className="bg-abyss py-14 text-white md:py-20">
        <div className="container-page flex flex-wrap items-center justify-between gap-8">
          <div className="flex-1 basis-[460px]">
            <h2 className="text-[28px] font-bold leading-tight md:text-[34px]">
              Cùng kể chuyện quê mình
            </h2>
            <p className="mt-3 max-w-[60ch] text-[17px] leading-relaxed text-silver">
              Theo dõi Fanpage Người Quảng Bình để không bỏ lỡ câu chuyện nào — và gửi
              ảnh, gửi chuyện của chính bạn.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={settings.facebookPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-[8px] bg-white px-5 text-[15px] font-semibold text-ink transition-colors hover:bg-silver-50"
            >
              Theo dõi Fanpage
            </a>
            <ButtonLink
              href="/lien-he"
              variant="ghost"
              className="border-white/45 text-white hover:border-white"
            >
              Gửi câu chuyện
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
