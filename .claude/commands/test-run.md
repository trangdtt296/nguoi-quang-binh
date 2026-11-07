---
description: Viết spec Playwright cho bộ test case của một chức năng rồi chạy và báo pass/fail/blocked/pending/chưa chạy
argument-hint: <mã chức năng, ví dụ AD-AUTH | nhiều mã cách nhau bởi dấu cách | all> [--no-write để chỉ chạy lại spec có sẵn]
---

Tự động hóa và chạy bộ test case: **$ARGUMENTS**

## Bước làm

1. **Kiểm tra đầu vào.** Đọc `qa/features.json` và `qa/cases/<mã>.json`.
   - Mã sai: liệt kê mã hợp lệ rồi dừng.
   - Chưa có file case: dừng và đề nghị chạy `/test-case <mã>` trước. Không tự sinh case ở đây.
   - `all`: mọi mã đã có file case.
2. **Chuẩn bị môi trường** (chỉ làm phần còn thiếu):
   - `qa/node_modules` chưa có: chạy `npm install` trong `qa/`.
   - Chưa có trình duyệt: chạy `npx playwright install chromium` trong `qa/`.
   - Chưa có `qa/.env`: báo người dùng sao chép từ `qa/.env.example` và điền. Vẫn chạy tiếp được, case thiếu điều kiện sẽ tự thành BLOCKED.
   - Thử gọi `QA_WEB_URL` và `QA_API_URL` (mặc định localhost:3000 và localhost:5000). Không chạy thì nói rõ: toàn bộ case sẽ BLOCKED, và hướng dẫn chạy `npm run dev` ở `web/` và `server/`. **Không tự khởi động server** nếu người dùng chưa đồng ý.
3. **Viết hoặc cập nhật `qa/e2e/<mã>.spec.ts`** (bỏ qua nếu có `--no-write`):
   - Đọc lại source trong `sources` để lấy selector đúng. Ưu tiên `getByRole`, `getByLabel`, `getByText` theo chữ tiếng Việt hiển thị thật. Không dùng class CSS.
   - **Mỗi case một test, tên bắt đầu bằng đúng id**: `test("AD-AUTH-001 Đăng nhập thành công…", …)`. Reporter dựa vào id này để ghi kết quả. Không gộp nhiều case vào một test.
   - Giữ nguyên test của các case đã có; chỉ thêm, sửa test cho case mới hoặc case đã đổi.
   - Case `automation: "manual"`: viết `test.fixme("<id> <tiêu đề>", () => {})` kèm comment lý do → trạng thái **Pending**.
   - Case làm tốn hạn mức: gọi `requireRateLimitedRun("…")` ở đầu test → **Blocked** nếu chưa bật `QA_ALLOW_RATE_LIMITED`.
   - Thiếu điều kiện khác (cần tài khoản editor, cần Cloudinary, cần dữ liệu mẫu…): gọi `blocked("lý do cụ thể")` → **Blocked**. Không để test fail vì môi trường thiếu.
   - Lỗi thật của web phải để **fail**. Không nới assertion cho test qua, không bọc try/catch nuốt lỗi.
   - Dùng sẵn trong `qa/support/fixtures.ts`:
     - `test`, `expect`: luôn import từ `../support/fixtures`, không import từ `@playwright/test`.
     - `adminPage`: page đã đăng nhập super_admin. `adminApi`: gọi API để chuẩn bị dữ liệu; `adminApi.create()` tự xóa khi case xong.
     - `needApi()`: gọi đầu case cần API. `qaName("Bài viết")`: tên dữ liệu test có tiền tố `[QA]`.
     - `apiLogin()`, `signInPage()`: đăng nhập tài khoản khác (ví dụ editor từ `env.editorEmail`).
   - Mỗi case tự chuẩn bị dữ liệu mình cần và không phụ thuộc thứ tự chạy. Không sửa hay xóa dữ liệu không do test tạo ra.
4. **Kiểm tra kiểu**: `npm run typecheck` trong `qa/`, sửa hết lỗi.
5. **Chạy**: trong `qa/`, `npx playwright test e2e/<mã>.spec.ts` (nhiều mã thì liệt kê nhiều file). Reporter tự ghi `qa/results/<mã>.json` và dựng lại `qa/report/index.html`.
6. **Với mỗi case fail**: đọc lỗi, trace và ảnh chụp trong `qa/test-results/`, rồi phân loại:
   - **Spec sai** (selector sai, chờ chưa đủ, hiểu sai hành vi): sửa spec và chạy lại riêng case đó bằng `--grep "<id>"`. Tối đa 2 vòng.
   - **Lỗi thật của web**: giữ fail, ghi vào báo cáo cho người dùng kèm file:dòng nghi ngờ. **Không sửa code web trong lệnh này** trừ khi người dùng yêu cầu.
7. **Cập nhật link web của báo cáo.** Reporter đã dựng lại `qa/report/artifact.html`. Đọc `url` trong `qa/artifact.json`. Nếu trong cuộc trò chuyện này chưa đọc hay đăng artifact đó, gọi công cụ Artifact với `action: "read"` và `url` đó trước. Sau đó đăng file bằng công cụ Artifact, truyền đúng `url` để giữ nguyên link (không truyền `icon`). Không bao giờ đăng thành artifact mới. Nếu chạy lại riêng case fail ở bước 6 thì chỉ đăng một lần, sau lần chạy cuối.
8. **Báo cáo** cho người dùng:
   - Bảng `Mã | Tổng | Pass | Fail | Blocked | Pending | Chưa chạy` (reporter in sẵn ở cuối lần chạy).
   - Danh sách case fail kèm một dòng nguyên nhân, tách rõ lỗi web với lỗi môi trường.
   - Lý do blocked gộp theo nhóm (ví dụ "12 case: server không chạy").
   - Link xem kết quả: `<url trong qa/artifact.json>#<mã>`. Bản trên máy: `qa/report/index.html#<mã>`.

## Trạng thái

| Trạng thái | Khi nào |
|---|---|
| Pass | Test chạy xong, mọi kỳ vọng đúng |
| Fail | Kỳ vọng sai, lỗi hoặc quá thời gian |
| Blocked | Gọi `blocked()` vì thiếu điều kiện: server tắt, thiếu tài khoản, thiếu cấu hình, chưa cho phép tốn hạn mức |
| Pending | `test.fixme`: case kiểm tra tay, hoặc tạm hoãn vì lỗi đã biết |
| Chưa chạy | Case có trong `qa/cases` nhưng chưa có kết quả nào |
