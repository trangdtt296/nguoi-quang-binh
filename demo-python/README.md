# Demo automation test: Đăng nhập (Playwright + Python)

Demo cho người mới: máy tự mở trình duyệt, tự nhập, tự bấm và tự kiểm tra kết quả.

| File | Nội dung |
|---|---|
| `tests/test_login_manual.py` | **Phần 1:** một test case viết tay (đăng nhập thành công) |
| `tests/test_login_ai.py` | **Phần 2:** bộ test case do AI sinh (tạo lúc demo) |
| `conftest.py` | Đọc `.env`, cấu hình trình duyệt |
| `pytest.ini` | Mở trình duyệt thật, chạy chậm 0,8 giây mỗi thao tác, chụp ảnh khi fail |

## Chuẩn bị (một lần)

```powershell
cd demo-python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m playwright install chromium
copy .env.example .env      # rồi điền ADMIN_EMAIL, ADMIN_PASSWORD
```

## Trước khi chạy: bật web và API

```powershell
cd server; npm run dev      # cửa sổ 1, cổng 5000
cd web;    npm run dev      # cửa sổ 2, cổng 3000
```

## Chạy demo

```powershell
cd demo-python

# Bản PASS
.\.venv\Scripts\python.exe -m pytest tests/test_login_manual.py

# Bản FAIL (cố tình dùng mật khẩu sai)
$env:DEMO_FAIL="1"; .\.venv\Scripts\python.exe -m pytest tests/test_login_manual.py; Remove-Item Env:DEMO_FAIL

# Xuất báo cáo HTML
.\.venv\Scripts\python.exe -m pytest --html=report.html --self-contained-html
```

Ảnh chụp màn hình lúc fail nằm ở `test-results/`.

> **Lưu ý:** server khóa đăng nhập sau **5 lần sai trong 15 phút** (theo IP). Chạy bản FAIL một lần là đủ.
> Nếu bị khóa, đợi 15 phút hoặc khởi động lại server (`npm run dev`).
