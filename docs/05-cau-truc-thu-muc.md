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
    │   │   │   ├── layout.tsx              sidebar + header + kiểm tra đăng nhập
    │   │   │   ├── login/page.tsx
    │   │   │   ├── page.tsx                Dashboard
    │   │   │   ├── articles/…               list · new · [id]/edit
    │   │   │   ├── destinations/…
    │   │   │   ├── foods/… · events/… · albums/…
    │   │   │   ├── categories/page.tsx
    │   │   │   ├── media/page.tsx
    │   │   │   ├── banners/page.tsx
    │   │   │   ├── messages/page.tsx
    │   │   │   ├── trash/page.tsx
    │   │   │   ├── settings/page.tsx
    │   │   │   ├── users/page.tsx
    │   │   │   └── profile/page.tsx
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

**Nguyên tắc:** mỗi file một nhiệm vụ, file component không quá ~200 dòng, logic gọi API nằm trong `hooks/` chứ không viết thẳng trong page, mọi thành phần lặp lại đều nằm trong `components/ui`.

## 2. Hệ thống thiết kế

### 2.1 Bảng màu

Bảng màu theo hướng **mệnh Thủy** (chủ website sinh 1996 — Bính Tý, Giản Hạ Thủy): lấy xanh dương và xanh đen làm bản mệnh, trắng – bạc – ghi sáng làm màu tương sinh (Kim sinh Thủy). Bỏ hẳn vàng đất, nâu, cam gạch (Thổ khắc Thủy) và xanh lá (Mộc — Thủy sinh Mộc, bị tiết khí).

```css
/* Bản mệnh — biển, trời và lòng hang */
--color-primary-50:  #eef7fb;
--color-primary-100: #d7ecf5;
--color-primary-500: #1d7ca8;   /* xanh dương chủ đạo */
--color-primary-700: #145a7a;
--color-primary-900: #0c3a4f;

/* Nước sâu — thay cho xanh rừng cũ */
--color-deep:        #1f5f7d;
--color-abyss:       #0b2e3f;   /* nền khối tối, gần xanh đen */

/* Tương sinh (Kim) — bạc, ghi sáng; thay cho màu cát */
--color-aqua:        #6fb3d1;   /* nhấn nhẹ: nhãn, chấm thông báo */
--color-silver:      #c9d6de;
--color-silver-50:   #eef3f6;

/* Trung tính */
--color-ink:         #1a2127;   /* chữ chính */
--color-muted:       #5f6d78;   /* chữ phụ */
--color-line:        #e3e8ec;
--color-surface:     #ffffff;
--color-surface-alt: #f6f9fb;
```

Cách dùng: xanh dương dẫn dắt toàn trang; xanh đen `--color-abyss` cho các khối tối (văn hóa, Góc học tập, kêu gọi theo dõi Fanpage); bạc và ghi sáng cho nền ảnh giữ chỗ và nhãn phụ; `--color-aqua` dùng rất tiết chế làm điểm nhấn. Nền trắng và xám rất nhạt để ảnh lên màu.

**Lưu ý về độ tương phản:** `--color-aqua` quá nhạt để làm màu chữ trên nền trắng (chỉ đạt khoảng 2:1, dưới chuẩn 4.5:1), nên chỉ dùng làm nền với chữ đậm `#06303f` phía trên, hoặc làm nét trang trí. Màu chữ luôn lấy từ `--color-ink`, `--color-muted`, `--color-primary-700` trở lên.

### 2.2 Typography

- Tiêu đề: **Be Vietnam Pro** (weight 600–700) — font Việt hiện đại, dấu tiếng Việt chuẩn.
- Nội dung: **Inter** hoặc **Source Serif 4** cho phần thân bài (chất tạp chí, dễ đọc đoạn dài).
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
