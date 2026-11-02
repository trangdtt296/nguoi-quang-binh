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

## Đã xong trong lượt này

- Khởi tạo dự án, design system (màu, font, component dùng chung)
- Header có menu responsive, Footer
- Trang chủ đầy đủ các khối
- Trang Điểm đến: lọc theo loại hình và khu vực, tìm kiếm, sắp xếp, phân trang
- Trang chi tiết điểm đến: album, thông tin tham quan, bản đồ, chia sẻ
- Trang 404

## Chưa xong

Các mục Giới thiệu, Văn hóa, Ẩm thực, Tin tức, Cẩm nang, Góc học tập, Thư
viện, Liên hệ, Tìm kiếm hiện là trang tạm nói rõ "đang được dựng". Sẽ làm ở
lượt tiếp theo của Giai đoạn 2.
