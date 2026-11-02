# server — Backend Người Quảng Bình

Node.js + Express + TypeScript + Prisma + PostgreSQL.

## Chạy lần đầu

**1. Tạo database.** Vào [neon.tech](https://neon.tech), đăng ký miễn phí, tạo
một project. Copy chuỗi kết nối (có dạng `postgresql://...?sslmode=require`).

**2. Tạo file cấu hình.**

```bash
cd server
cp .env.example .env
```

Mở `.env` và điền:
- `DATABASE_URL` — chuỗi vừa copy từ Neon
- `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET` — hai chuỗi ngẫu nhiên khác nhau,
  sinh bằng: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `SEED_ADMIN_EMAIL` và `SEED_ADMIN_PASSWORD` — tài khoản quản trị đầu tiên

**3. Cài đặt và khởi tạo.**

```bash
npm install
npm run db:migrate    # tạo bảng trong database
npm run db:seed       # nạp dữ liệu mẫu
npm run dev
```

API chạy ở http://localhost:5000. Kiểm tra: mở http://localhost:5000/health.

## Các lệnh

| Lệnh | Việc |
|---|---|
| `npm run dev` | Chạy dev, tự khởi động lại khi sửa code |
| `npm run build` | Biên dịch TypeScript ra thư mục `dist` |
| `npm start` | Chạy bản đã build |
| `npm run typecheck` | Kiểm tra kiểu, không xuất file |
| `npm run db:migrate` | Tạo và chạy migration (dùng khi phát triển) |
| `npm run db:deploy` | Chạy migration đã có (dùng khi deploy) |
| `npm run db:seed` | Nạp dữ liệu mẫu |
| `npm run db:studio` | Mở giao diện xem và sửa dữ liệu ở localhost:5555 |

## Xem dữ liệu trong database

```bash
npm run db:studio
```

Mở trình duyệt ở `localhost:5555`, các bảng hiện ra dạng bảng tính, sửa trực
tiếp được. Tiện khi kiểm thử: thao tác trên web xong, mở Studio xem dữ liệu
đã vào đúng chưa.

Ngoài ra Neon có sẵn SQL Editor ngay trên web, không cần cài gì.

## Cấu trúc

```
src/
├── index.ts              khởi động server
├── app.ts                cấu hình Express, gắn middleware và route
├── config/               env, prisma, logger
├── middleware/           auth, rbac, validate, error-handler, rate-limit
├── utils/                api response, slug, bộ lọc công khai
└── routes/
    ├── public/           API công khai, không cần đăng nhập
    ├── admin/            API quản trị, cần JWT
    └── seo.ts            sitemap.xml, robots.txt
prisma/
├── schema.prisma         thiết kế database
└── seed.ts               dữ liệu mẫu
```

## Phân quyền

| Vai trò | Quyền |
|---|---|
| `editor` | Tạo và sửa nội dung do mình tạo. Không xuất bản, không xóa |
| `admin` | Toàn quyền nội dung, media, banner, danh mục |
| `super_admin` | Như admin, thêm quản lý tài khoản và cấu hình website |

Editor gửi `status: "published"` sẽ bị hạ về `draft` — phải để admin duyệt.

## Khuôn phản hồi

```jsonc
// Thành công
{ "success": true, "data": { }, "meta": { "page": 1, "limit": 12, "total": 48, "totalPages": 4 } }

// Lỗi
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] } }
```

## Danh sách endpoint

Xem đầy đủ trong [docs/02-kien-truc.md](../docs/02-kien-truc.md), mục 4.

Công khai: `/api/v1/destinations`, `/articles`, `/foods`, `/events`,
`/courses`, `/albums`, `/categories`, `/banners`, `/settings`, `/search`,
`POST /contact`, `POST /views/:type/:id`.

Quản trị: `/api/v1/auth/*` và `/api/v1/admin/*`.

## Điều cần biết khi deploy

- **Form liên hệ không gửi email.** Render gói free chặn cổng SMTP 25/465/587,
  nên tin nhắn được lưu vào bảng `contact_messages` cho admin đọc trong CMS.
  Muốn gửi email thật thì dùng Resend hoặc SendGrid qua API.
- **Ảnh không lưu trên đĩa.** Render gói free không có ổ đĩa bền, nên ảnh đẩy
  thẳng lên Cloudinary, database chỉ giữ đường dẫn.
- **Service ngủ sau 15 phút** không có truy cập, thức dậy mất khoảng một phút.
  Lần gọi API đầu sau khi để lâu sẽ chậm.
- Khi deploy, chạy `npm run db:deploy` thay vì `db:migrate`.

## Chưa kiểm chứng

Toàn bộ code Giai đoạn 3 **chưa chạy thử được** trong môi trường phát triển vì
máy không tải được thư viện từ npm. Chạy lần đầu nhiều khả năng còn lỗi vặt —
báo lại để sửa.
