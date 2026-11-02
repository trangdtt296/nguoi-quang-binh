# Giai đoạn 1 — Phân tích yêu cầu

Dự án: **NGƯỜI QUẢNG BÌNH**
Slogan: *Vẻ đẹp quê hương trong từng câu chuyện.*
Ngày lập: 02/11/2026

---

## 1. Định vị sản phẩm

Website truyền thông – quảng bá cộng đồng, mở rộng từ Fanpage Facebook "Người Quảng Bình".

**Có:** nội dung biên tập (bài viết, điểm đến, văn hóa, ẩm thực, tin tức, cẩm nang, thư viện ảnh), Góc học tập, CMS để admin tự đăng bài, SEO, chia sẻ Facebook.

### Góc học tập (bổ sung 02/11/2026)

Khu vực chia sẻ kiến thức cho cộng đồng: lập trình, tiếng Anh, tiếng Nhật và các lĩnh vực khác. Mỗi khóa là một chuỗi bài học xếp theo thứ tự; mỗi bài là một bài viết, có thể kèm video.

**Định hướng nội dung:** gắn với người Quảng Bình để không lạc khỏi định vị chung của website — học tiếng Anh để làm du lịch, học tiếng Nhật để đi lao động nước ngoài, học lập trình để làm từ xa khỏi phải xa quê. Tên mục trên menu: "Góc học tập".

**Đánh đổi đã biết:** đây là chủ đề khác với du lịch – văn hóa, nên làm loãng tín hiệu chủ đề mà Google đọc được từ website. Giảm thiểu bằng cách: đặt `/goc-hoc-tap` thành một nhánh riêng, không trộn bài học vào mục Tin tức hay Cẩm nang, và viết mô tả khóa học gắn với bối cảnh địa phương.

**Không làm:** tài khoản người học, theo dõi tiến độ, bài kiểm tra, chứng chỉ, thu phí. Người xem vẫn ẩn danh.

**Không có (đã loại khỏi phạm vi theo yêu cầu):** bán tour, giỏ hàng, thanh toán, đặt tour, quản lý đơn hàng, mọi nghiệp vụ thương mại điện tử.

Hệ quả kiến trúc: không cần bảng `orders`, `bookings`, `payments`, không cần tài khoản người dùng cuối. Chỉ có tài khoản quản trị. Khách truy cập là ẩn danh.

## 2. Đối tượng người dùng

| Vai trò | Mô tả | Quyền |
|---|---|---|
| Khách truy cập | Người quan tâm Quảng Bình, đến từ Facebook hoặc Google | Chỉ đọc, không đăng nhập |
| Editor | Cộng tác viên viết bài | Tạo/sửa nội dung của mình, không xuất bản, không xóa |
| Admin | Quản trị viên nội dung | Toàn quyền nội dung, media, banner, SEO |
| Super Admin | Chủ website | Thêm/xóa tài khoản, sửa cấu hình website |

## 3. Phân tích website tham khảo

### 3.1 quangbinhtourism.vn

Cấu trúc quan sát được:

- Menu phẳng theo chủ đề trải nghiệm: Danh lam thắng cảnh / Ẩm thực / Văn hóa lễ hội / Di tích / Điểm du lịch / Dịch vụ.
- Trang chủ là chuỗi khối nội dung xếp dọc: hero → lưới điểm đến (có tab lọc: Phong Nha – Kẻ Bàng / Địa điểm khác) → lưới trải nghiệm (tab: danh lam / ẩm thực / lễ hội / di tích / danh nhân) → danh sách tour → danh sách lưu trú.
- Card nội dung tối giản: ảnh + tiêu đề, không mô tả.
- Footer nhiều cột: giới thiệu, điểm đến nổi bật, cẩm nang, thông báo pháp lý.

**Điểm đáng học:** dùng **tab để gom nhiều danh mục vào một khối** giúp trang chủ không bị dài; phân loại nội dung theo *trải nghiệm* (ăn gì, xem gì, lễ hội gì) sát với cách người đi du lịch nghĩ, hơn là phân loại theo kiểu hành chính.

**Điểm không nên lặp lại:** card chỉ có ảnh + tiêu đề nên người đọc không biết bài nói gì trước khi bấm vào; trang chủ lặp nhiều lưới giống nhau, thiếu nhịp; không có mô tả ngắn và ngày đăng nên nội dung trông cũ.

### 3.2 quangbinhtravel.vn/tours

Cấu trúc quan sát được:

- Trang danh sách có breadcrumb, tiêu đề trang, ô tìm kiếm riêng.
- Bộ lọc nhiều tầng: nhóm thẻ chủ đề, lọc theo điểm khởi hành, thanh hiển thị số kết quả + sắp xếp mới/cũ.
- Card dày thông tin: ảnh, tiêu đề, mô tả ngắn cắt gọn, khối thông tin có cấu trúc (thời gian, điểm đón, bữa ăn…), khối giá, nút hành động.
- Phân trang dạng số có dấu lược, nút trước/sau.
- Dưới danh sách còn có khối giới thiệu thương hiệu, bài viết nổi bật, khối "lý do chọn", khối liên hệ.

**Điểm đáng học:** **mô hình trang danh sách** — breadcrumb + tìm kiếm + bộ lọc + đếm kết quả + sắp xếp + phân trang. Đây là bộ khung chuẩn, mình áp dụng cho trang Điểm đến, Tin tức, Ẩm thực. Khối thông tin có cấu trúc trong card cũng hay: với điểm đến mình thay bằng *khu vực, loại hình, thời điểm đẹp nhất*.

**Điểm không áp dụng:** toàn bộ phần giá, giảm giá, nút đặt tour — ngoài phạm vi dự án. Bộ lọc của họ quá nhiều thẻ, gây rối; mình giới hạn còn 2 trục lọc (danh mục + khu vực).

### 3.3 Kết luận định hướng riêng

Kết hợp: **cách phân loại theo trải nghiệm** của trang 1 + **bộ khung trang danh sách** của trang 2, trình bày theo phong cách **tạp chí du lịch** (ảnh lớn, khoảng trắng rộng, typography có thứ bậc rõ) — khác hẳn phong cách lưới ảnh dày đặc của cả hai trang tham khảo.

Không sao chép: logo, bảng màu, bố cục pixel, hình ảnh, nội dung chữ, mã nguồn của hai trang trên. Toàn bộ nhận diện, nội dung mẫu và CSS là của dự án này.

## 4. Lưu ý về địa danh

Từ 01/7/2025, theo Nghị quyết 202/2025/QH15, tỉnh Quảng Bình đã hợp nhất với tỉnh Quảng Trị thành tỉnh **Quảng Trị**, trung tâm hành chính đặt tại Đồng Hới.

Xử lý trong sản phẩm: giữ thương hiệu "Người Quảng Bình" (tên vùng đất, tên Fanpage); trong trang Giới thiệu và phần dữ liệu địa chỉ, ghi rõ địa phận hiện thuộc tỉnh Quảng Trị. Bảng `destinations` có trường `address` dạng tự do nên không bị ràng buộc bởi đơn vị hành chính cũ.

## 5. Ràng buộc đã chốt với khách hàng

1. Toàn bộ hạ tầng phải **miễn phí** (xem `02-kien-truc.md`, mục Hosting).
2. Nội dung hiển thị phải lấy từ database qua API, không hardcode.
3. Mọi nút bấm phải có hành động thật, không có chức năng giả.
4. Có dữ liệu mẫu (seed) để demo ngay sau khi cài.

## 6. Rủi ro đã nhận diện

| Rủi ro | Ảnh hưởng | Cách xử lý |
|---|---|---|
| Backend free ngủ sau 15 phút không truy cập | Lần tải đầu chậm ~1 phút | Ping định kỳ; thông báo loading rõ ràng; demo thì mở trước |
| SPA thuần kém SEO | Trái yêu cầu "tối ưu SEO" | **Cần quyết định** — xem `02-kien-truc.md` mục 3 |
| Bản quyền ảnh du lịch | Rủi ro pháp lý | Chỉ dùng ảnh có giấy phép tự do (Unsplash/Pexels) hoặc ảnh do chủ Fanpage sở hữu; ghi nguồn |
| Dung lượng ảnh lớn làm chậm trang | Điểm SEO thấp | Qua Cloudinary, tự resize + WebP + lazy load |
| Nhúng nội dung Fanpage | Có thể vi phạm điều khoản Facebook | Chỉ dùng Page Plugin chính thức, không crawl dữ liệu |
