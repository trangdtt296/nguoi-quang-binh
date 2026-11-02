# Giai đoạn 1 — Kiến trúc hệ thống

## 1. Sơ đồ tổng thể

```
┌─────────────────┐     ┌─────────────────┐
│  Khách truy cập │     │     Admin       │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │  HTTPS                │  HTTPS + JWT
         ▼                       ▼
┌──────────────────────────────────────────┐
│  FRONTEND  (Next.js + TypeScript)        │
│  Vercel — miễn phí, SSR + CDN toàn cầu   │
│  ├── Website công khai  (/)              │
│  └── Admin CMS          (/admin)         │
└────────────────┬─────────────────────────┘
                 │  REST API (JSON)
                 ▼
┌──────────────────────────────────────────┐
│  BACKEND  (Node.js + Express + TS)       │
│  Render — miễn phí                       │
│  ├── /api/v1/...       API công khai     │
│  ├── /api/v1/admin/... API quản trị      │
│  └── Middleware: auth, rbac, validate    │
└────────┬────────────────────┬────────────┘
         │                    │
         ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│  PostgreSQL      │  │   Cloudinary     │
│  Neon — free     │  │   Ảnh — free     │
└──────────────────┘  └──────────────────┘
```

Frontend và Admin nằm chung một ứng dụng React nhưng **tách route và tách bundle** (lazy load `/admin`), để khách truy cập không phải tải code admin.

## 2. Công nghệ

### Frontend
| Hạng mục | Chọn | Lý do |
|---|---|---|
| Framework | **Next.js 15 (App Router) + React + TypeScript** | SSR cho SEO — xem mục 3 |
| CSS | Tailwind CSS | Theo yêu cầu |
| Routing | Next.js App Router | Có sẵn, theo thư mục |
| Data fetching | TanStack Query | Tự cache, tự xử lý loading/error — đáp ứng yêu cầu IX.9 |
| Form | React Hook Form + Zod | Validate phía client, dùng chung schema với backend |
| Editor | TipTap | Theo yêu cầu |
| Icon | Lucide React | Theo yêu cầu |
| SEO | Metadata API của Next.js | Thẻ meta + Open Graph sinh ở phía server |

### Backend
| Hạng mục | Chọn | Lý do |
|---|---|---|
| Runtime | Node.js 20 + Express + TypeScript | Theo yêu cầu |
| ORM | Prisma | Có migration + seed sẵn, type-safe, dễ đọc schema |
| Auth | JWT (access + refresh) | Theo yêu cầu |
| Mã hóa mật khẩu | bcrypt | Chuẩn |
| Validate | Zod | Dùng chung schema với frontend |
| Upload | Multer → Cloudinary SDK | Không lưu file trên đĩa (Render free không có ổ đĩa bền) |
| Bảo mật | helmet, cors, express-rate-limit | Chặn brute-force đăng nhập |
| Log | pino | Nhẹ |

### Hạ tầng — tất cả miễn phí
| Thành phần | Dịch vụ | Gói free | Giới hạn cần biết |
|---|---|---|---|
| Frontend | Vercel | Có | Không ngủ |
| Backend | Render | 512 MB RAM, 750 giờ/tháng | **Ngủ sau 15 phút không truy cập**, thức dậy ~1 phút. Không gửi được SMTP cổng 25/465/587 |
| Database | Neon | 1 GB Postgres/project, không cần thẻ | Compute tự ngủ sau 5 phút nhưng thức gần như tức thì |
| Ảnh | Cloudinary | Có gói free | Giới hạn dung lượng/băng thông — cần kiểm tra hạn mức hiện tại khi đăng ký |

**Không chọn Render Postgres** vì database free của Render hết hạn sau 30 ngày kể từ khi tạo — dễ mất dữ liệu giữa chừng.

**Form liên hệ:** do Render free chặn SMTP, form liên hệ sẽ **lưu vào bảng `contact_messages`** và admin đọc trong CMS, thay vì gửi email. Nếu sau này cần email, dùng Resend/SendGrid qua API (không qua cổng SMTP).

## 3. ✅ Đã chốt: SEO — dùng Next.js (phương án B)

> **Quyết định ngày 02/11/2026:** frontend dùng **Next.js (App Router) + TypeScript + Tailwind**, backend Express giữ nguyên. Lý do: SEO và chia sẻ Facebook là mục đích tồn tại của website này.
>
> Thay đổi kéo theo so với bản nháp ban đầu: bỏ Vite và React Router (Next.js có sẵn routing), bỏ react-helmet-async (dùng Metadata API của Next), thư mục `client/` đổi thành `web/` với cấu trúc `app/`. Các lựa chọn còn lại (TanStack Query, React Hook Form + Zod, TipTap, Lucide) giữ nguyên.

<details>
<summary>Phân tích dẫn tới quyết định (giữ lại để tham khảo)</summary>


Yêu cầu IX.12 là "tối ưu SEO", nhưng React + Vite tạo ra **SPA**: máy chủ trả về một trang HTML rỗng, nội dung do JavaScript dựng sau. Google có thể render JS nhưng chậm và không chắc chắn; Facebook khi quét link để lấy ảnh Open Graph thì **không chạy JavaScript**, nên bài chia sẻ lên Fanpage sẽ không hiện ảnh và mô tả — đúng cái yêu cầu X cần.

Ba hướng:

**A. Vite SPA + prerender thẻ meta ở backend**
Express chặn request đến từ bot (Googlebot, facebookexternalhit) và trả về HTML có sẵn thẻ meta + nội dung tóm tắt. Giữ nguyên stack theo yêu cầu, thêm ~1 file middleware. Chia sẻ Facebook hoạt động. Điểm yếu: nội dung đầy đủ vẫn do JS dựng, Google vẫn phải render.

**B. Đổi frontend sang Next.js (App Router)**
Server-side rendering thật, SEO tốt nhất, vẫn là React + TypeScript + Tailwind. Backend Express giữ nguyên. Điểm yếu: lệch nhẹ so với mô tả "ReactJS" trong yêu cầu; cần thêm một dịch vụ chạy SSR (Vercel vẫn free cho Next.js).

**C. Giữ SPA thuần, chấp nhận SEO yếu**
Nhanh nhất, nhưng không đáp ứng yêu cầu IX.12 và X.

→ **Đã chọn phương án B.**

</details>

### Các quyết định khác đã chốt (02/11/2026)

- **Phân quyền:** 3 cấp — `editor` / `admin` / `super_admin`, đúng như thiết kế bảng `users`.
- **Ảnh dữ liệu mẫu:** dùng Unsplash/Pexels (giấy phép tự do), ghi nguồn trong `alt_text`. Khi có ảnh thật từ Fanpage thì thay sau qua CMS, không phải sửa code.

## 4. Thiết kế API

Chuẩn REST, prefix `/api/v1`. Mọi phản hồi theo một khuôn:

```jsonc
// Thành công
{ "success": true, "data": { ... }, "meta": { "page": 1, "limit": 12, "total": 48 } }

// Lỗi
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
```

### API công khai (không cần đăng nhập)
```
GET  /api/v1/destinations          ?category=&region=&q=&page=&limit=&sort=
GET  /api/v1/destinations/:slug
GET  /api/v1/articles              ?category=&type=&q=&page=&limit=&featured=
GET  /api/v1/articles/:slug
GET  /api/v1/foods                 ?category=&page=&limit=
GET  /api/v1/foods/:slug
GET  /api/v1/events                ?upcoming=&page=&limit=
GET  /api/v1/events/:slug
GET  /api/v1/courses               ?category=&level=&page=&limit=
GET  /api/v1/courses/:slug                    (kèm danh sách bài theo thứ tự)
GET  /api/v1/courses/:slug/:lessonSlug        (bài học + bài trước/sau)
GET  /api/v1/albums                ?page=&limit=
GET  /api/v1/albums/:slug
GET  /api/v1/categories            ?type=
GET  /api/v1/banners               ?position=
GET  /api/v1/settings
GET  /api/v1/search                ?q=        (tìm chung nhiều loại nội dung)
POST /api/v1/contact                          (có rate limit)
POST /api/v1/views/:type/:id                  (đếm lượt xem)
GET  /sitemap.xml
GET  /robots.txt
```

### API quản trị (cần JWT)
```
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
PATCH  /api/v1/auth/password

GET    /api/v1/admin/dashboard/stats

CRUD   /api/v1/admin/articles       GET, POST, GET/:id, PATCH/:id, DELETE/:id
CRUD   /api/v1/admin/destinations
CRUD   /api/v1/admin/foods
CRUD   /api/v1/admin/events
CRUD   /api/v1/admin/categories
CRUD   /api/v1/admin/courses
CRUD   /api/v1/admin/lessons            (bài học: articles có type = 'lesson')
PATCH  /api/v1/admin/courses/:id/reorder  (sắp xếp lại thứ tự bài)
CRUD   /api/v1/admin/albums
CRUD   /api/v1/admin/banners
CRUD   /api/v1/admin/users          (chỉ super_admin)
GET/PATCH /api/v1/admin/settings

POST   /api/v1/admin/media/upload
GET    /api/v1/admin/media          ?type=&q=&page=
DELETE /api/v1/admin/media/:id
GET    /api/v1/admin/contact-messages
PATCH  /api/v1/admin/contact-messages/:id    (đánh dấu đã đọc)
```

### Phân quyền
```
editor      : đọc tất cả; tạo/sửa nội dung do mình tạo; không xuất bản; không xóa
admin       : toàn quyền nội dung, media, banner, danh mục, SEO
super_admin : như admin + quản lý tài khoản + sửa settings website
```

Thực hiện bằng middleware `requireAuth` → `requireRole(['admin','super_admin'])` gắn vào từng route.

## 5. Quy ước kỹ thuật

- **Soft delete:** cột `deleted_at`; mọi truy vấn mặc định lọc `deleted_at IS NULL`. Admin có mục "Thùng rác" để khôi phục.
- **Slug:** sinh tự động từ tiêu đề tiếng Việt (bỏ dấu, gạch nối), kiểm tra trùng thì thêm hậu tố số. Admin sửa được tay.
- **Thời gian:** lưu UTC trong database, hiển thị theo giờ Việt Nam.
- **Phân trang:** mặc định `limit=12`, tối đa 50.
- **Biến môi trường:** không commit `.env`, chỉ commit `.env.example`.
- **Lượt xem:** tăng bằng một request riêng, chống spam bằng rate limit theo IP.
