# Giai đoạn 1 — Cấu trúc thư mục & Hệ thống thiết kế

## 1. Cấu trúc repo

```
nguoi-quang-binh/
├── README.md
├── .gitignore
├── docs/                          ← tài liệu thiết kế (thư mục này)
│
├── server/                        ← Backend: Node + Express + TypeScript
│   ├── src/
│   │   ├── index.ts               khởi động server
│   │   ├── app.ts                 cấu hình Express, middleware toàn cục
│   │   ├── config/
│   │   │   ├── env.ts             đọc & validate biến môi trường bằng Zod
│   │   │   ├── database.ts        Prisma client
│   │   │   └── cloudinary.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts            xác thực JWT
│   │   │   ├── rbac.ts            phân quyền theo vai trò
│   │   │   ├── validate.ts        validate request bằng Zod
│   │   │   ├── errorHandler.ts    bắt lỗi tập trung
│   │   │   └── rateLimit.ts
│   │   ├── modules/               mỗi module = 1 thư mục khép kín
│   │   │   ├── auth/              controller · service · route · schema
│   │   │   ├── articles/
│   │   │   ├── destinations/
│   │   │   ├── foods/
│   │   │   ├── events/
│   │   │   ├── categories/
│   │   │   ├── albums/
│   │   │   ├── media/
│   │   │   ├── banners/
│   │   │   ├── settings/
│   │   │   ├── contact/
│   │   │   ├── stats/
│   │   │   └── seo/               sitemap.xml, robots.txt, prerender meta
│   │   ├── utils/
│   │   │   ├── slugify.ts         bỏ dấu tiếng Việt
│   │   │   ├── apiResponse.ts     chuẩn hóa phản hồi
│   │   │   └── pagination.ts
│   │   └── types/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── web/                           ← Frontend: Next.js 15 (App Router) + TypeScript
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx                  layout gốc, font, metadata mặc định
    │   │   ├── page.tsx                    Trang chủ
    │   │   ├── globals.css                 Tailwind + biến CSS
    │   │   ├── (public)/                   nhóm route công khai, chung Header/Footer
    │   │   │   ├── layout.tsx
    │   │   │   ├── gioi-thieu/page.tsx
    │   │   │   ├── diem-den/page.tsx
    │   │   │   ├── diem-den/[slug]/page.tsx
    │   │   │   ├── van-hoa/page.tsx
    │   │   │   ├── van-hoa/[slug]/page.tsx
    │   │   │   ├── am-thuc/page.tsx
    │   │   │   ├── am-thuc/[slug]/page.tsx
    │   │   │   ├── tin-tuc/page.tsx
    │   │   │   ├── tin-tuc/[slug]/page.tsx
    │   │   │   ├── su-kien/[slug]/page.tsx
    │   │   │   ├── cam-nang/page.tsx
    │   │   │   ├── cam-nang/[slug]/page.tsx
    │   │   │   ├── thu-vien/page.tsx
    │   │   │   ├── thu-vien/[slug]/page.tsx
    │   │   │   ├── lien-he/page.tsx
    │   │   │   └── tim-kiem/page.tsx
    │   │   ├── admin/                      CMS, layout riêng, client-side
    │   │   │   ├── layout.tsx              AuthProvider + ToastProvider
    │   │   │   ├── login/page.tsx
    │   │   │   └── (protected)/            route group: cần đăng nhập, không đổi URL
    │   │   │       ├── layout.tsx          AdminShell (sidebar + header + chặn truy cập)
    │   │   │       ├── page.tsx            Dashboard
    │   │   │       ├── articles/…          list · new · [id]/edit
    │   │   │       ├── destinations/… · foods/… · events/…
    │   │   │       ├── courses/… · albums/… · banners/…
    │   │   │       ├── categories/ · media/ · messages/
    │   │   │       └── trash/ · settings/ · users/
    │   │   ├── sitemap.ts                  sinh sitemap.xml
    │   │   ├── robots.ts
    │   │   └── not-found.tsx
    │   ├── lib/
    │   │   ├── api.ts                      fetch wrapper + xử lý lỗi
    │   │   ├── auth.ts                     lưu & làm mới token
    │   │   ├── queryClient.ts
    │   │   └── utils.ts
    │   ├── types/                          kiểu dữ liệu dùng chung
    │   ├── hooks/                          useDestinations, useArticles, useAuth…
    │   └── components/
    │       ├── ui/                         Button, Card, Input, Badge, Modal, Toast,
    │       │                               Skeleton, Pagination, EmptyState, ErrorState
    │       ├── layout/                     Header, Footer, MobileMenu, Breadcrumb
    │       ├── shared/                     ShareButtons, ImageLightbox,
    │       │                               FacebookPagePlugin, MapEmbed
    │       ├── content/                    DestinationCard, ArticleCard, FoodCard,
    │       │                               EventCard, AlbumCard, FilterBar
    │       └── admin/                      DataTable, RichTextEditor, MediaPicker,
    │                                       ImageUploader, StatusBadge, ConfirmDialog
    ├── public/
    ├── .env.example
    ├── tailwind.config.ts
    ├── next.config.ts
    ├── package.json
    └── tsconfig.json
```

Trang công khai render phía server (lấy dữ liệu trong Server Component) để có SEO; khu `/admin` chạy phía client vì cần token và tương tác liên tục.

**Lớp dữ liệu khu quản trị** (cập nhật 05/11/2026):

- `lib/http.ts` — địa chỉ API, `ApiError`, đọc phản hồi, `getErrorMessage`. Dùng chung cho admin và form liên hệ.
- `lib/admin/api-client.ts` — gọi API kèm token, tự làm mới token khi hết hạn.
- `lib/admin/queries.ts` — query key và hook react-query (`useListQuery`, `useDetailQuery`, `useSaveMutation`, `useDeleteMutation`, `useUploadMedia`…). Key luôn bắt đầu bằng đường dẫn API, nên invalidate theo đường dẫn là danh sách, chi tiết và thùng rác cùng tải lại.
- `lib/admin/form-utils.ts` — mảnh schema zod và hàm đổi giá trị form sang dữ liệu API.
- `components/admin/form-fields.tsx` — ô nhập gắn sẵn react-hook-form (`FormInput`, `FormSelect`, `FormRows`…).
- `components/admin/form-parts.tsx` — `useResourceForm` (luồng tạo/sửa chung), thanh đầu trang, tab SEO và Xuất bản.

**Nguyên tắc:** mỗi file một nhiệm vụ, file component không quá ~200 dòng, logic gọi API nằm trong `hooks/` chứ không viết thẳng trong page, mọi thành phần lặp lại đều nằm trong `components/ui`.

### Quy ước đặt tên (chốt 03/11/2026)

Tên biến, hàm, component, file và `id` trong HTML viết bằng **tiếng Anh**.

Hai ngoại lệ có chủ đích:

1. **Thư mục trong `web/src/app/`** giữ tiếng Việt: `diem-den`, `am-thuc`, `van-hoa`, `tin-tuc`, `cam-nang`, `goc-hoc-tap`, `thu-vien`, `gioi-thieu`, `lien-he`, `tim-kiem`.

   Lý do: trong Next.js App Router, tên thư mục **chính là** đường dẫn URL, không tách rời được. `/diem-den` thân thiện với người tìm Google bằng tiếng Việt hơn `/destinations`. Đây là đánh đổi có ý thức giữa tính nhất quán của code và hiệu quả SEO — ưu tiên SEO vì đó là lý do website này tồn tại.

2. **Chú thích (comment)** viết bằng tiếng Việt, để chủ dự án và người hướng dẫn đọc được.

Nội dung hiển thị cho người đọc đương nhiên là tiếng Việt.

## 2. Hệ thống thiết kế

### 2.1 Bảng màu

Bảng màu theo hướng **mệnh Thủy** (chủ website sinh 1996 — Bính Tý, Giản Hạ Thủy), chọn nhánh **đen – trắng – bạc – ghi sáng**: đen là bản mệnh, trắng và bạc là Kim sinh Thủy. Không dùng vàng đất, nâu, cam gạch (Thổ khắc Thủy), không dùng xanh lá (Mộc — Thủy sinh Mộc, bị tiết khí), và không dùng xanh dương làm màu dẫn.

```css
/* Bản mệnh — đen và than chì */
--color-primary-50:  #f2f4f6;
--color-primary-100: #e3e7ea;
--color-primary-500: #2b3339;   /* màu chính: nút, chip đang chọn */
--color-primary-700: #1b2227;
--color-primary-900: #0d1114;

--color-deep:        #39454d;   /* ghi đậm, dùng cho chữ phụ nổi bật */
--color-abyss:       #0d1114;   /* nền khối tối, gần như đen */

/* Tương sinh (Kim) — bạc và ghi sáng */
--color-silver:      #c3ccd2;
--color-silver-50:   #f2f4f6;

/* Trung tính */
--color-ink:         #14181c;   /* chữ chính */
--color-muted:       #6b7780;   /* chữ phụ */
--color-line:        #e4e7ea;
--color-surface:     #ffffff;
--color-surface-alt: #f7f8f9;
```

Cách dùng: nền trắng là chủ đạo, chữ đen, các khối nhấn dùng nền gần đen `--color-abyss` với chữ trắng; bạc dùng cho nền ảnh giữ chỗ, đường viền và nhãn phụ. Toàn trang không có màu rực, nên **hình ảnh trở thành nguồn màu duy nhất** — đúng tinh thần tạp chí. Hệ quả: ảnh phải đẹp và được cắt đúng tỉ lệ, vì không còn màu nền nào đỡ cho nó.

**Hai lưu ý khi code:**

1. Không còn màu riêng cho liên kết, nên **mọi liên kết nằm trong đoạn văn phải gạch chân** (`text-decoration: underline`). Nếu chỉ đổi sắc độ xám thì người đọc không phân biệt được đâu là liên kết — đây là lỗi tiếp cận thật, không phải chuyện thẩm mỹ.
2. Trạng thái trong CMS (Đã xuất bản / Bản nháp / Lên lịch) giờ chỉ khác nhau sắc độ xám. Phải kèm chữ rõ ràng trong nhãn, không được chỉ dựa vào màu để phân biệt.

### 2.2 Typography

- Tiêu đề: **Be Vietnam Pro** (weight 600–700) — font Việt hiện đại, dấu tiếng Việt chuẩn.
- Tiêu đề lớn và trích dẫn: **Lora** (chất tạp chí, dễ đọc đoạn dài).

> **Bắt buộc:** mọi font dùng trong dự án phải có bộ ký tự `vietnamese` trên Google Fonts. Source Serif 4 từng được chọn nhưng không có subset này, khiến `next/font` dựng lỗi khi build — đã thay bằng Lora. Trước khi đổi sang font khác, kiểm tra subset trước.
- Thang cỡ chữ: 12 / 14 / 16 / 18 / 22 / 28 / 36 / 48 / 64 px.
- Dòng chữ thân bài rộng tối đa 68 ký tự.

### 2.3 Nguyên tắc bố cục

- Container 1280px, lề hai bên 24px (mobile 16px).
- Lưới 12 cột, khoảng cách 24px.
- Khoảng cách dọc giữa các khối lớn: 96px (desktop), 56px (mobile).
- Bo góc: 12px cho card, 8px cho nút, 999px cho nhãn.
- Đổ bóng rất nhẹ, chỉ dùng khi hover.
- Ảnh luôn có tỉ lệ cố định (16:9 cho card ngang, 4:5 cho card dọc) để không nhảy layout khi tải.

### 2.4 Chuyển động

- Hover card: ảnh phóng 1.04, bóng hiện ra, 250ms ease-out.
- Chuyển trang: fade 150ms.
- Không dùng animation chạy nền, không parallax nặng — ưu tiên tốc độ.
- Tôn trọng `prefers-reduced-motion`.

### 2.5 Logo

Hướng đề xuất: chữ "NGƯỜI QUẢNG BÌNH" đặt dưới một ký hiệu đồ họa đơn giản gợi **vòm hang động mở ra đường chân trời biển** — hai hình ảnh nhận diện nhất của vùng đất, vẽ bằng nét liền, một màu, chạy tốt ở cả kích thước avatar Facebook (180×180) lẫn header website. Sẽ làm bản SVG ở Giai đoạn 2 để bạn duyệt.

## 3. Biến môi trường

### `server/.env.example`
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CORS_ORIGIN=http://localhost:5173
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

### `web/.env.example`
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_FACEBOOK_PAGE_URL=https://www.facebook.com/nguoi.quang.binh.chat.phac.gian.di/
API_URL_INTERNAL=http://localhost:5000/api/v1
```

Không commit `.env`. `.gitignore` chặn `.env`, `node_modules`, `dist`, `.DS_Store`.

## 4. Kế hoạch các giai đoạn sau

| Giai đoạn | Nội dung | Ước lượng |
|---|---|---|
| 2 | Khởi tạo dự án, design system, Header/Footer, Trang chủ, Điểm đến + chi tiết, Tin tức + chi tiết, các trang còn lại, responsive | 3–4 lượt làm việc |
| 3 | Prisma schema, migration, seed, toàn bộ API, auth, phân quyền, upload | 2–3 lượt |
| 4 | Admin CMS: dashboard + 18 màn hình | 3–4 lượt |
| 5 | Nối FE–BE, kiểm thử CRUD, phân quyền, upload, responsive, SEO; sửa lỗi; hướng dẫn deploy | 2 lượt |

Mỗi giai đoạn kết thúc bằng: danh sách file đã tạo/sửa, cách chạy và kiểm tra, danh sách việc chưa xong. Chỉ sang giai đoạn sau khi bạn đã kiểm tra và đồng ý.
