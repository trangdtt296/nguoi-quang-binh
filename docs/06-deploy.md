# Giai đoạn 5 — Đưa website lên mạng

Ba chỗ miễn phí, mỗi chỗ một việc:

| Chỗ | Việc | Vùng |
| --- | --- | --- |
| **Neon** | Database Postgres | Singapore |
| **Render** | Backend API | Singapore |
| **Vercel** | Website và khu quản trị | tự chọn |
| **Cloudinary** | Lưu ảnh | — |

Neon và Vercel đã xong từ trước. Phần còn lại là Render, rồi nối Vercel vào
Render.

---

## 1. Đưa backend lên Render

File `render.yaml` ở gốc repo đã khai sẵn mọi thứ, nên không phải điền tay.

1. Vào <https://dashboard.render.com> → **New** → **Blueprint**.
2. Chọn repo `trangdtt296/nguoi-quang-binh`. Nếu chưa thấy repo, bấm
   **Configure account** để cấp quyền cho Render như đã làm với Vercel.
3. Render đọc `render.yaml` và hỏi lần lượt các biến còn thiếu:

   - `DATABASE_URL` — chép nguyên chuỗi trong file `.env` trên máy bạn, kể cả
     phần `?sslmode=require` ở cuối.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` —
     lấy ở Cloudinary → Dashboard. Để trống cũng được, API vẫn chạy, chỉ là
     không tải ảnh lên được.

   Hai chuỗi `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET` Render tự sinh, không
   phải nhập.

4. Bấm **Apply**. Lần build đầu mất khoảng 3–5 phút.

Build xong, địa chỉ API có dạng `https://nguoi-quang-binh-api.onrender.com`.
Mở `https://<địa-chỉ-đó>/health` trên trình duyệt, thấy JSON báo ok là chạy.

### Gói miễn phí ngủ khi không ai dùng

Render tắt service sau 15 phút không có ai gọi. Lần gọi tiếp theo mất khoảng
50 giây để thức lại. Không phải lỗi. Nếu sau này thấy chậm quá thì có hai cách:
nâng lên gói trả phí, hoặc đặt một dịch vụ ping định kỳ gọi `/health` cho nó
khỏi ngủ.

---

## 2. Trỏ Vercel sang Render

Website đang hỏi API ở `localhost`, nên trên mạng nó không thấy gì.

1. Vào Vercel → project `nguoi-quang-binh` → **Settings** → **Environment
   Variables**.
2. Thêm:

   | Tên | Giá trị |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | `https://nguoi-quang-binh-api.onrender.com/api/v1` |
   | `NEXT_PUBLIC_SITE_URL` | địa chỉ Vercel của website |

   Nhớ phần `/api/v1` ở cuối `NEXT_PUBLIC_API_URL` — API mount ở đó, thiếu
   thì mọi lời gọi trả về 404.

3. Vào tab **Deployments** → deploy mới nhất → **Redeploy**. Biến môi trường
   chỉ có tác dụng từ lần build sau, sửa xong mà không deploy lại thì không
   đổi gì.

---

## 3. Cho Render biết địa chỉ website

`render.yaml` đã đặt `CORS_ORIGIN` là `https://nguoi-quang-binh.vercel.app`.
Nếu địa chỉ Vercel thật khác, sửa lại:

Render → service → **Environment** → sửa `CORS_ORIGIN` và `SITE_URL` →
**Save changes**. Render tự deploy lại.

Nhiều địa chỉ thì cách nhau bằng dấu phẩy, không có dấu cách:

```
CORS_ORIGIN=https://nguoi-quang-binh.vercel.app,https://nguoiquangbinh.vn
```

Thiếu bước này thì đăng nhập quản trị sẽ báo lỗi mạng, dù backend vẫn chạy —
trình duyệt chặn trước khi lời gọi đến được server.

---

## 4. Tạo tài khoản quản trị trên database thật

Database Neon là cùng một database bạn đang dùng ở máy, nên nếu đã chạy
`npm run db:seed` từ máy thì tài khoản có rồi, đăng nhập được luôn.

Nếu chưa, chạy trên máy (vẫn trỏ vào Neon):

```bash
cd server
npm run db:seed
```

---

## 5. Kiểm lại theo thứ tự

1. `https://<render>/health` → trả JSON ok.
2. Mở website trên Vercel → thấy bài viết, điểm đến đã xuất bản.
3. Vào `/admin/login` → đăng nhập được.
4. Đăng một bài mới, xuất bản, mở trang công khai → bài hiện ra.
5. Tải một ảnh lên trong Thư viện media → ảnh hiện, URL là `res.cloudinary.com`.

Bước nào vướng thì xem bảng dưới.

---

## Lỗi hay gặp

**"Không kết nối được tới máy chủ"** khi đăng nhập
Ba khả năng, kiểm theo thứ tự: `NEXT_PUBLIC_API_URL` thiếu `/api/v1` ở cuối;
`CORS_ORIGIN` trên Render chưa có địa chỉ Vercel; hoặc service Render đang
ngủ — chờ 50 giây rồi thử lại.

**Build trên Render hỏng ở bước migration**
Thường do `DATABASE_URL` sai hoặc thiếu `?sslmode=require`. Xem log build,
Render in nguyên thông báo của Prisma.

**Website chạy nhưng trống trơn**
API không gọi được. Mở Console của trình duyệt (F12), xem lời gọi nào đỏ.
Các trang công khai được viết để không vỡ khi API hỏng, nên trống chứ không
báo lỗi — dễ tưởng là chưa có dữ liệu.

**Tải ảnh báo `UPLOAD_UNAVAILABLE`**
Ba biến Cloudinary trên Render còn trống.

**Mixed content, trang HTTPS không gọi được `http://localhost`**
Không sửa được bằng cấu hình. Trang trên Vercel chỉ gọi được API chạy HTTPS.
Muốn thử với backend ở máy thì chạy cả frontend ở máy.
