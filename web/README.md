# web — Frontend Người Quảng Bình

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4.

## Chạy dự án

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

Mở http://localhost:3000.

Lệnh khác:

| Lệnh | Việc |
|---|---|
| `npm run dev` | Chạy ở chế độ phát triển |
| `npm run build` | Build bản production |
| `npm run start` | Chạy bản đã build |
| `npm run typecheck` | Kiểm tra kiểu TypeScript |

## Dữ liệu

Giai đoạn này chưa có backend. Mọi hàm lấy dữ liệu nằm trong
`src/lib/queries.ts` và đọc từ dữ liệu mẫu trong `src/lib/mock/`.

Các hàm đều `async` và trả về đúng hình dạng dữ liệu mà API ở Giai đoạn 3 sẽ
trả về. Khi nối API thật, chỉ sửa phần thân các hàm trong `queries.ts` —
không component nào phải sửa theo.

## Ảnh

Chưa có ảnh thật. `ContentImage` hiện ô giữ chỗ màu bạc kèm mô tả khi chưa có
`src`. Khi admin tải ảnh lên qua CMS (Cloudinary), chỉ cần dữ liệu có `url` là
ảnh hiện ra, không phải sửa component.

## Quy ước đặt tên

Tên biến, hàm, component, file và `id` trong HTML viết bằng **tiếng Anh**.

Hai ngoại lệ có chủ đích:

- **Tên thư mục trong `src/app/`** giữ tiếng Việt, vì trong Next.js tên thư
  mục chính là đường dẫn URL. `/diem-den` thân thiện với người tìm bằng tiếng
  Việt hơn `/destinations`.
- **Chú thích (comment)** viết bằng tiếng Việt.

Nội dung hiển thị cho người đọc đương nhiên là tiếng Việt.

## Các trang đã dựng

| Đường dẫn | Nội dung |
|---|---|
| `/` | Trang chủ |
| `/gioi-thieu` | Giới thiệu vùng đất và trang web |
| `/diem-den` · `/diem-den/[slug]` | Điểm đến: lọc, tìm kiếm, sắp xếp, phân trang; chi tiết có album và bản đồ |
| `/tin-tuc` · `/tin-tuc/[slug]` | Tin tức & sự kiện |
| `/van-hoa` · `/van-hoa/[slug]` | Văn hóa & con người |
| `/cam-nang` · `/cam-nang/[slug]` | Cẩm nang du lịch |
| `/am-thuc` · `/am-thuc/[slug]` | Ẩm thực, chi tiết có câu chuyện món ăn |
| `/goc-hoc-tap` | Danh sách khóa học, lọc theo lĩnh vực |
| `/goc-hoc-tap/[courseSlug]` | Chi tiết khóa học, danh sách bài theo thứ tự |
| `/goc-hoc-tap/[courseSlug]/[lessonSlug]` | Bài học, có khối video và điều hướng bài trước/sau |
| `/thu-vien` · `/thu-vien/[slug]` | Album ảnh, xem ảnh lớn ngay trong trang |
| `/lien-he` | Form góp ý, validate hai lớp |
| `/tim-kiem` | Tìm kiếm chung, không phân biệt dấu |
| `/sitemap.xml` · `/robots.txt` | Sinh tự động từ dữ liệu |

## Chưa xong

- **Trang sự kiện riêng** (`/su-kien/[slug]`) — dữ liệu đã có, chưa dựng màn hình.
- **Nối API thật** — hiện vẫn đọc dữ liệu mẫu. Form liên hệ đã gọi API thật,
  nên chưa chạy backend thì nó sẽ báo lỗi gửi.
- **Admin CMS** — Giai đoạn 4.
