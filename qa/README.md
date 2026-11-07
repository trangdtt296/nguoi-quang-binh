# Kiểm thử — Người Quảng Bình

Bộ test case theo từng chức năng, spec Playwright để chạy tự động, và trang báo cáo.

```
qa/
├── features.json          danh mục chức năng và mã (HOME, DEST, AD-AUTH…)
├── cases/<mã>.json        test case của từng chức năng
├── e2e/<mã>.spec.ts       spec tự động, mỗi case một test, tên test bắt đầu bằng id case
├── results/<mã>.json      kết quả lần chạy gần nhất của từng case (reporter tự ghi)
├── report/index.html      trang báo cáo (tự dựng, mở thẳng bằng trình duyệt)
├── report/artifact.html   cùng nội dung, bản để đăng lên link web
├── artifact.json          link web của báo cáo — /test-case và /test-run tự cập nhật sau mỗi lần chạy
├── support/               fixture (đăng nhập, gọi API, blocked) và reporter
└── scripts/               dựng báo cáo
```

## Dùng trong Claude Code

| Lệnh | Việc |
|---|---|
| `/test-case AD-AUTH` | Đọc source chức năng, sinh hoặc cập nhật `cases/AD-AUTH.json` |
| `/test-case all` | Sinh cho mọi chức năng chưa có test case |
| `/test-run AD-AUTH` | Viết hoặc cập nhật spec, chạy, báo pass/fail/blocked/pending/chưa chạy |
| `/test-run AD-AUTH --no-write` | Chỉ chạy lại spec có sẵn |

## Chạy tay

```bash
cd qa
npm install
npx playwright install chromium
cp .env.example .env               # điền địa chỉ web/API và tài khoản test
npx playwright test e2e/AD-AUTH.spec.ts
npx playwright test --grep AD-AUTH-006   # chạy lẻ một case
npm run report                     # dựng lại báo cáo từ cases + results
```

Trước khi chạy cần bật web (`web/`, cổng 3000) và API (`server/`, cổng 5000).

## Trạng thái

| | |
|---|---|
| **Pass** | Chạy xong, mọi kỳ vọng đúng |
| **Fail** | Kỳ vọng sai, lỗi hoặc quá thời gian |
| **Blocked** | Thiếu điều kiện để chạy: server tắt, thiếu tài khoản trong `.env`, thiếu cấu hình (Cloudinary), hoặc case tốn hạn mức mà chưa bật `QA_ALLOW_RATE_LIMITED=1` |
| **Pending** | Có spec nhưng tạm hoãn (`test.fixme`): case kiểm tra tay, hoặc lỗi đã biết |
| **Chưa chạy** | Có case nhưng chưa có kết quả |

## Lưu ý

- Server khóa đăng nhập **5 lần sai / 15 phút / IP**. Khi bị khóa, cả đăng nhập đúng cũng bị chặn, kéo theo mọi case quản trị bị BLOCKED. Vì vậy case đăng nhập sai chỉ chạy khi bật `QA_ALLOW_RATE_LIMITED=1`. Form liên hệ cũng giới hạn 5 tin/giờ.
- Case quản trị tạo dữ liệu có tiền tố `[QA]` và tự xóa (mềm) khi xong; bản ghi vẫn nằm trong Thùng rác. Không chạy trên database production.
