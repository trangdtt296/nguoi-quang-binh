---
description: Sinh bộ test case cho một chức năng theo mã (xem qa/features.json)
argument-hint: <mã chức năng, ví dụ AD-AUTH | nhiều mã cách nhau bởi dấu cách | all>
---

Sinh bộ test case cho chức năng: **$ARGUMENTS**

## Bước làm

1. Đọc `qa/features.json`.
   - Không có tham số, hoặc mã không có trong danh mục: liệt kê bảng mã — tên chức năng rồi dừng. Gợi ý mã gần đúng nếu người dùng gõ sai.
   - `all`: làm lần lượt mọi mã **chưa có** file `qa/cases/<mã>.json`. Muốn sinh lại mã đã có thì phải gọi đích danh mã đó.
2. Đọc **toàn bộ** file trong `sources` của chức năng (cả phía web lẫn server: route, schema zod ở `server/src/routes/admin/schemas.ts`, middleware quyền, rate limit). Test case phải bám đúng hành vi thật trong code: câu báo lỗi đúng từng chữ, giới hạn độ dài thật, quyền thật. Không bịa tính năng không có trong code.
3. Nếu đã có `qa/cases/<mã>.json`: giữ nguyên `id` của các case cũ còn đúng, sửa case đã lệch với code, thêm case mới với số tiếp theo. **Không đánh số lại** — id đã gắn với spec và kết quả chạy.
4. Ghi file `qa/cases/<mã>.json` theo định dạng bên dưới.
5. Chạy `node qa/scripts/build-report.mjs <mã>` để kiểm tra định dạng và dựng lại báo cáo. Có cảnh báo thì sửa cho hết.
   Script phải báo **không còn mục thiết kế nào "chưa có case phủ"**.
6. **Cập nhật link web của báo cáo.** Đọc `url` trong `qa/artifact.json`. Nếu trong cuộc trò chuyện này chưa đọc hay đăng artifact đó, gọi công cụ Artifact với `action: "read"` và `url` đó trước. Sau đó đăng `qa/report/artifact.html` bằng công cụ Artifact, truyền đúng `url` để giữ nguyên link (không truyền `icon`). Không bao giờ đăng thành artifact mới.
7. Báo lại ngắn gọn: số mục thiết kế theo từng kỹ thuật và % bao phủ, số case theo loại và độ ưu tiên, những case để `manual` và lý do, những gì trong code đáng ngờ là lỗi (nếu thấy). Đưa link `<url>#<mã>` để xem, và nhắc chạy `/test-run <mã>` để tự động hóa.

## Thiết kế test trước, viết case sau

Không viết case theo cảm tính. Trước hết, từ source, lập phần `design`: danh sách **mục cần phủ** theo từng kỹ thuật. Sau đó viết case sao cho **mọi mục đều có ít nhất một case phủ** (trường `covers`). Script kiểm tra báo lỗi nếu còn mục chưa phủ, hoặc case trỏ tới mục không tồn tại. Mục tiêu là bao phủ 100%.

Áp dụng mọi kỹ thuật phù hợp với chức năng, không bỏ kỹ thuật nào chỉ vì ngại:

| Mã | Kỹ thuật | Áp dụng khi | Cách lập mục |
|---|---|---|---|
| `EP` | Phân vùng tương đương | Mọi ô nhập, tham số URL, bộ lọc | Mỗi ô: các lớp hợp lệ và không hợp lệ (rỗng, chỉ khoảng trắng, sai định dạng, đúng định dạng nhưng không tồn tại, ký tự đặc biệt/tiếng Việt có dấu…). Ghi `kind`: "Hợp lệ" / "Không hợp lệ". Mỗi lớp không hợp lệ cần một case riêng, không gộp hai lớp sai vào một case. |
| `BVA` | Phân tích giá trị biên | Ô có min/max theo `web/src/lib/field-limits.ts` (FIELD_LIMITS, COUNT_LIMITS), số, ngày, số dòng tối đa, phân trang, hạn mức của server | Với mỗi biên: min−1, min, max, max+1 (thêm min+1, max−1 nếu biên quan trọng). Ghi rõ con số, ví dụ "99, 100, 101 ký tự". Ô có `maxLength` thì max+1 nghĩa là ô tự cắt về max. |
| `DT` | Bảng quyết định | Kết quả phụ thuộc tổ hợp nhiều điều kiện (vai trò × trạng thái, tồn tại × đúng mật khẩu × đang hoạt động…) | Liệt kê điều kiện trong `conditions`; mỗi quy tắc (cột của bảng) là một mục. Rút gọn quy tắc có "không quan tâm" (-) nhưng không bỏ tổ hợp có hành vi khác. Đối chiếu thứ tự kiểm tra trong code để tìm tổ hợp lộ thông tin hoặc sai thứ tự. |
| `ST` | Chuyển trạng thái | Có vòng đời: phiên đăng nhập, trạng thái nội dung (nháp → xuất bản → lưu trữ → thùng rác → khôi phục), đọc/chưa đọc | Mỗi chuyển tiếp hợp lệ là một mục; thêm chuyển tiếp **không hợp lệ** quan trọng (editor cố xuất bản, khôi phục cái chưa xóa…). |
| `UC` | Kịch bản sử dụng | Luồng đầu–cuối người dùng thật làm | Luồng chính và luồng thay thế. |
| `PW` | Kiểm thử cặp | ≥ 3 tham số kết hợp với nhau (bộ lọc loại × trạng thái × tìm kiếm × trang) | Tập tổ hợp phủ mọi cặp giá trị; mỗi tổ hợp là một mục. |
| `EG` | Đoán lỗi | Luôn luôn | Bấm hai lần, mất mạng, phản hồi chậm, chuỗi tấn công (`<script>`, `' OR 1=1 --`), emoji, chuỗi rất dài, dán nội dung, quay lại bằng nút Back, mở hai tab, slug không tồn tại, id sai định dạng. |
| `CL` | Checklist | Yêu cầu phi chức năng | Nhãn và trợ năng, thẻ meta và SEO, trạng thái rỗng và đang tải, giao diện điện thoại, câu chữ thông báo. |

**Giới hạn độ dài của ô nhập lấy từ `web/src/lib/field-limits.ts`** (giới hạn thực tế của giao diện), không lấy theo độ rộng cột trong database. Vẫn đọc server để biết server kiểm tra gì thêm (định dạng, quyền, hạn mức). Nếu gặp giới hạn ở web lỏng hơn server (web cho nhập dài hơn mức server chấp nhận, hoặc min của web thấp hơn min của server) thì đó là lỗi: viết case cho chỗ đó và báo lại cho người dùng.

## Phạm vi cần phủ

Số case do phần thiết kế quyết định, không đặt chỉ tiêu. Một case có thể phủ nhiều mục nếu cùng một thao tác kiểm tra được chúng (ví dụ đăng nhập thành công phủ cả lớp email hợp lệ lẫn quy tắc DT tương ứng), nhưng không gộp các lớp không hợp lệ. Cân nhắc lần lượt:

- **functional**: luồng chính đi đúng (xem, tạo, sửa, xóa, lọc, phân trang, tìm kiếm…).
- **validation**: từng ràng buộc của form và schema (bắt buộc, độ dài tối thiểu/tối đa, định dạng URL/email/số, quan hệ giữa các trường như ngày kết thúc sau ngày bắt đầu). Giá trị biên ghi rõ con số.
- **negative**: dữ liệu không tồn tại (slug sai → 404), API lỗi, mất kết nối, bấm hai lần.
- **permission**: editor / admin / super_admin thấy và làm được gì. Ví dụ editor chỉ lưu nháp, không thấy nút xóa.
- **security**: truy cập trang quản trị khi chưa đăng nhập, token hết hạn, khóa đăng nhập do sai nhiều lần.
- **ui / a11y / seo**: chỉ những điểm có ý nghĩa: trạng thái rỗng, đang tải, nhãn cho trình đọc màn hình, thẻ meta, giao diện điện thoại.

## Định dạng `qa/cases/<mã>.json`

```json
{
  "code": "AD-AUTH",
  "name": "Quản trị — Đăng nhập, đăng xuất, phiên",
  "generatedAt": "2026-11-05T10:00:00.000Z",
  "design": [
    {
      "technique": "EP",
      "target": "Ô Email",
      "note": "Không bắt buộc. Nguồn quy tắc: login/page.tsx (schema) và server/src/routes/admin/auth.ts",
      "items": [
        { "id": "EP-EMAIL-1", "kind": "Hợp lệ", "desc": "Email đúng của tài khoản đang hoạt động" },
        { "id": "EP-EMAIL-2", "kind": "Không hợp lệ", "desc": "Để trống" }
      ]
    },
    {
      "technique": "DT",
      "target": "Kết quả đăng nhập",
      "conditions": ["Email tồn tại", "Mật khẩu đúng", "Tài khoản hoạt động"],
      "items": [{ "id": "DT-LOGIN-1", "desc": "Y · Y · Y → vào /admin" }]
    }
  ],
  "cases": [
    {
      "id": "AD-AUTH-001",
      "title": "Đăng nhập thành công bằng tài khoản hợp lệ",
      "type": "functional",
      "priority": "P1",
      "automation": "auto",
      "covers": ["EP-EMAIL-1", "DT-LOGIN-1"],
      "preconditions": ["Có tài khoản super_admin đang hoạt động"],
      "steps": ["Mở /admin/login", "Nhập email và mật khẩu đúng", "Bấm Đăng nhập"],
      "expected": ["Chuyển tới /admin", "Header hiện họ tên và vai trò của tài khoản"],
      "data": { "email": "QA_ADMIN_EMAIL", "password": "QA_ADMIN_PASSWORD" },
      "notes": "Không bắt buộc. Ghi chú cho người chạy tay hoặc người viết spec."
    }
  ]
}
```

- `design[].technique`: một trong `EP` `BVA` `DT` `ST` `UC` `PW` `EG` `CL`. `target`: ô, luồng hoặc đối tượng được phân tích. `items[].id`: dạng `<kỹ thuật>-<ĐỐI TƯỢNG>-<số>`, không trùng trong file.
- `covers`: bắt buộc, liệt kê id các mục thiết kế case này phủ. Kỹ thuật hiển thị trên báo cáo được suy ra từ đây.
- `id`: `<mã>-NNN`, 3 chữ số, tăng dần, không trùng.
- `type`: `functional` | `validation` | `negative` | `ui` | `security` | `permission` | `a11y` | `performance` | `seo`.
- `priority`: `P1` (luồng chính, hỏng là chặn người dùng) | `P2` (quan trọng) | `P3` (phụ).
- `automation`: `auto` nếu Playwright làm được ổn định; `manual` nếu cần mắt người (bố cục, chất lượng ảnh), cần chờ thật lâu (token hết hạn sau 15 phút), hoặc phụ thuộc dịch vụ ngoài khó điều khiển. Ghi lý do vào `notes`.
- `steps` và `expected`: câu tiếng Việt ngắn, cụ thể, kiểm chứng được. Viết "Hiện lỗi 'Vui lòng nhập email' dưới ô Email", không viết "Hiện lỗi phù hợp".
- `data`: dữ liệu dùng trong case. Tài khoản thì ghi tên biến môi trường (`QA_ADMIN_EMAIL`), **không bao giờ ghi mật khẩu thật**. Dữ liệu tạo mới thì ghi tiền tố `[QA]`.
- Case làm tốn hạn mức của server (đăng nhập sai, gửi form liên hệ) phải nói rõ trong `notes`. Spec sẽ chỉ chạy chúng khi bật `QA_ALLOW_RATE_LIMITED=1`.
