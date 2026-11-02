# Giai đoạn 1 — Sitemap, User Flow, Danh sách màn hình

## 1. Sitemap — Website công khai

```
/                                   Trang chủ
├── /gioi-thieu                     Giới thiệu Quảng Bình & thương hiệu
├── /diem-den                       Khám phá điểm đến (danh sách + lọc)
│   └── /diem-den/:slug             Chi tiết điểm đến
├── /van-hoa                        Văn hóa & con người
│   └── /van-hoa/:slug              Chi tiết bài văn hóa
├── /am-thuc                        Ẩm thực quê hương
│   └── /am-thuc/:slug              Chi tiết món ăn / đặc sản
├── /tin-tuc                        Tin tức & sự kiện
│   ├── /tin-tuc/:slug              Chi tiết bài viết
│   └── /su-kien/:slug              Chi tiết sự kiện
├── /cam-nang                       Cẩm nang du lịch
│   └── /cam-nang/:slug             Chi tiết bài cẩm nang
├── /goc-hoc-tap                    Góc học tập — danh sách khóa học
│   ├── /goc-hoc-tap/:courseSlug    Chi tiết khóa học (danh sách bài)
│   └── /goc-hoc-tap/:courseSlug/:lessonSlug   Bài học (nội dung + video)
├── /thu-vien                       Thư viện ảnh & video
│   └── /thu-vien/:slug             Chi tiết album
├── /lien-he                        Liên hệ
├── /tim-kiem?q=                    Kết quả tìm kiếm chung
└── /404                            Không tìm thấy
```

Quy tắc URL: tiếng Việt không dấu, gạch nối, không có đuôi `.html`, không có tham số rác — thân thiện SEO.

## 2. Sitemap — Admin CMS

```
/admin/login                        Đăng nhập
/admin                              Dashboard
├── /admin/articles                 Danh sách bài viết
│   ├── /admin/articles/new         Soạn bài mới
│   └── /admin/articles/:id/edit    Sửa bài
├── /admin/destinations             Danh sách điểm đến
│   ├── /admin/destinations/new
│   └── /admin/destinations/:id/edit
├── /admin/foods                    Ẩm thực
│   ├── /admin/foods/new
│   └── /admin/foods/:id/edit
├── /admin/events                   Sự kiện
│   ├── /admin/events/new
│   └── /admin/events/:id/edit
├── /admin/courses                  Khóa học (Góc học tập)
│   ├── /admin/courses/new
│   ├── /admin/courses/:id/edit     sửa khóa + sắp xếp thứ tự bài
│   └── /admin/courses/:id/lessons/new   soạn bài học (có ô link video)
├── /admin/albums                   Thư viện / album
│   ├── /admin/albums/new
│   └── /admin/albums/:id/edit
├── /admin/categories               Quản lý danh mục (theo tab: bài viết/điểm đến/ẩm thực...)
├── /admin/media                    Thư viện media
├── /admin/banners                  Quản lý banner
├── /admin/messages                 Tin nhắn từ form liên hệ
├── /admin/trash                    Thùng rác (khôi phục nội dung đã xóa)
├── /admin/settings                 Thông tin website + SEO mặc định
├── /admin/users                    Tài khoản quản trị  (chỉ super_admin)
└── /admin/profile                  Đổi mật khẩu, thông tin cá nhân
```

## 3. User Flow

### 3.1 Khách đến từ Facebook đọc một bài

```
Fanpage → bấm link bài viết
  → Trang chi tiết bài (ảnh bìa, tiêu đề, nội dung)
  → cuộn xuống: bài viết liên quan + nút chia sẻ Facebook
  → bấm bài liên quan → vòng lặp đọc tiếp
  hoặc → bấm nút "Theo dõi Fanpage"
```
Mục tiêu: giữ người đọc ở lại thêm ít nhất 1 bài. Vì vậy khối "bài liên quan" là bắt buộc ở mọi trang chi tiết.

### 3.2 Khách tìm điểm đi chơi

```
Trang chủ → khối "Khám phá điểm đến" → bấm Xem tất cả
  → /diem-den
      → lọc theo danh mục (hang động / biển / sông suối / núi rừng / di tích)
      → hoặc lọc theo khu vực
      → hoặc gõ ô tìm kiếm
      → kết quả cập nhật, có đếm số kết quả
      → phân trang
  → bấm một card → /diem-den/:slug
      → ảnh bìa lớn, album ảnh, mô tả, lịch sử
      → bản đồ vị trí
      → hướng dẫn tham quan, lưu ý
      → bài viết liên quan
```

### 3.3 Khách gửi góp ý

```
/lien-he → điền form (họ tên, email, nội dung)
  → validate phía client (báo lỗi ngay dưới ô nhập)
  → submit → validate phía server
  → thành công: hiện thông báo xanh, xóa form
  → thất bại: hiện thông báo đỏ, giữ nguyên dữ liệu đã nhập
  → dữ liệu vào bảng contact_messages, admin đọc trong CMS
```

### 3.4 Admin đăng một bài viết

```
/admin/login → nhập email + mật khẩu
  → sai: báo lỗi, sau 5 lần sai bị chặn tạm (rate limit)
  → đúng: nhận JWT → chuyển tới /admin
/admin → Dashboard (số liệu tổng quan)
  → menu trái → Bài viết → nút "Soạn bài mới"
  → nhập tiêu đề (slug tự sinh, sửa được)
  → chọn danh mục, nhập mô tả ngắn
  → soạn nội dung bằng TipTap (chèn ảnh từ thư viện media)
  → chọn ảnh đại diện
  → mở tab SEO: SEO title, meta description, ảnh Open Graph
  → chọn trạng thái: Lưu nháp / Xuất bản / Lên lịch (chọn ngày giờ)
  → bấm "Xem trước" → mở tab mới xem đúng như trang thật
  → bấm Lưu → hiện toast thành công → quay về danh sách
  → nếu "Xuất bản": bài hiện ngay trên website công khai
```

### 3.5 Admin xóa nội dung

```
Danh sách → nút xóa → hộp thoại xác nhận (nêu rõ tên nội dung)
  → xác nhận → soft delete (deleted_at = now)
  → biến khỏi website công khai và danh sách
  → xuất hiện trong /admin/trash
  → tại đó: Khôi phục hoặc Xóa vĩnh viễn (xác nhận lần hai)
```

## 4. Danh sách màn hình

### Website công khai (14 màn hình)
| # | Màn hình | Thành phần chính |
|---|---|---|
| 1 | Trang chủ | Hero slider, giới thiệu, lưới điểm đến có tab, khối văn hóa, khối ẩm thực, tin mới, cẩm nang, thư viện, khối Fanpage |
| 2 | Giới thiệu | Nội dung tĩnh lấy từ settings, ảnh, thông tin thương hiệu |
| 3 | Danh sách điểm đến | Breadcrumb, tìm kiếm, lọc danh mục + khu vực, đếm kết quả, sắp xếp, lưới card, phân trang |
| 4 | Chi tiết điểm đến | Hero ảnh, thông tin nhanh, nội dung, album, bản đồ, lưu ý, bài liên quan, chia sẻ |
| 5 | Văn hóa & con người | Danh sách bài theo chuyên mục con |
| 6 | Chi tiết bài văn hóa | Như trang chi tiết bài viết |
| 7 | Ẩm thực | Lưới món ăn, lọc theo danh mục |
| 8 | Chi tiết món ăn | Ảnh, mô tả, nguồn gốc, câu chuyện, nơi thưởng thức |
| 9 | Tin tức & sự kiện | Bài nổi bật, danh sách, lọc danh mục, tìm kiếm, phân trang |
| 10 | Chi tiết bài viết | Ảnh bìa, meta (ngày, tác giả, danh mục), nội dung, chia sẻ FB, bài liên quan |
| 11 | Cẩm nang | Danh sách bài theo nhóm: thời điểm, di chuyển, lưu trú, lịch trình |
| 12 | Thư viện | Lưới album, lightbox xem ảnh lớn, video nhúng |
| 13 | Liên hệ | Thông tin, form góp ý, bản đồ, liên kết Fanpage |
| 14 | Tìm kiếm / 404 | Kết quả gom nhiều loại nội dung; trang lỗi có gợi ý quay về |
| 15 | Góc học tập | Lọc theo lĩnh vực (lập trình / tiếng Anh / tiếng Nhật…), lưới card khóa học |
| 16 | Chi tiết khóa học | Mô tả khóa, trình độ, danh sách bài theo thứ tự |
| 17 | Bài học | Video nhúng, nội dung bài, danh sách bài bên cạnh, nút bài trước / bài sau |

**Tổng công khai: 17 màn hình.**

### Admin CMS (18 màn hình)
| # | Màn hình | Ghi chú |
|---|---|---|
| 1 | Đăng nhập | Có rate limit |
| 2 | Dashboard | Thẻ số liệu, biểu đồ lượt xem, bài mới nhất, xem nhiều nhất |
| 3 | Danh sách bài viết | Lọc trạng thái/danh mục, tìm kiếm, phân trang, thao tác hàng loạt |
| 4 | Soạn/sửa bài viết | TipTap, tab Nội dung / SEO / Cài đặt xuất bản |
| 5 | Danh sách điểm đến | Như #3 |
| 6 | Soạn/sửa điểm đến | Thêm album ảnh, tọa độ bản đồ, thông tin tham quan |
| 7 | Danh sách ẩm thực | |
| 8 | Soạn/sửa món ăn | |
| 9 | Danh sách sự kiện | Hiện thời gian diễn ra, trạng thái |
| 10 | Soạn/sửa sự kiện | Ngày bắt đầu/kết thúc, địa điểm |
| 11 | Danh sách album | |
| 12 | Soạn/sửa album | Chọn nhiều ảnh, sắp xếp thứ tự |
| 12b | Khóa học + bài học | Tạo khóa, kéo thả sắp xếp thứ tự bài, soạn bài có ô link video |
| 13 | Quản lý danh mục | Tab theo loại nội dung, kéo thả đổi thứ tự |
| 14 | Thư viện media | Lưới ảnh, upload kéo thả, tìm kiếm, xem dung lượng, xóa |
| 15 | Quản lý banner | Vị trí hiển thị, thứ tự, bật/tắt |
| 16 | Tin nhắn liên hệ | Danh sách, đánh dấu đã đọc |
| 17 | Thùng rác | Khôi phục / xóa vĩnh viễn |
| 18 | Cài đặt + Tài khoản | Thông tin website, SEO mặc định, mạng xã hội; quản lý user |

**Tổng: 36 màn hình** (17 công khai + 19 quản trị).

## 5. Trạng thái giao diện bắt buộc

Mọi màn hình có tải dữ liệu phải xử lý đủ 4 trạng thái (yêu cầu IX.9):

| Trạng thái | Cách thể hiện |
|---|---|
| Loading | Skeleton khung xám đúng hình dạng nội dung, không dùng spinner toàn trang |
| Error | Thông báo lỗi + nút "Thử lại" |
| Empty | Hình minh họa nhẹ + câu giải thích + hành động gợi ý (ví dụ "Xóa bộ lọc") |
| Success | Toast góc màn hình, tự ẩn sau 3 giây |
