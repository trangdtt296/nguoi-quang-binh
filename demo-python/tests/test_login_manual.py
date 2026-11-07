"""
Test case viết TAY: Đăng nhập thành công với tài khoản hợp lệ.

Đây là cách làm truyền thống trước khi có AI: người kiểm thử tự đọc giao diện,
tự nghĩ ra các bước, rồi gõ từng dòng code để máy làm thay mình.
"""
import os

from playwright.sync_api import Page, expect


def test_dang_nhap_thanh_cong(page: Page, config):
    # Chạy với DEMO_FAIL=1 thì cố tình dùng mật khẩu sai, để xem một test FAIL trông thế nào.
    password = "mat-khau-sai-de-demo" if os.getenv("DEMO_FAIL") == "1" else config.password

    # Bước 1: mở trang đăng nhập quản trị
    page.goto(config.web_url + "/admin/login")

    # Bước 2: gõ email vào ô "Email"
    page.get_by_label("Email").fill(config.email)

    # Bước 3: gõ mật khẩu vào ô "Mật khẩu"
    page.get_by_label("Mật khẩu").fill(password)

    # Bước 4: bấm nút "Đăng nhập"
    page.get_by_role("button", name="Đăng nhập").click()

    # Bước 5 (kiểm tra kết quả): trang phải chuyển sang /admin ...
    expect(page).to_have_url(config.web_url + "/admin", timeout=10_000)

    # ... và thấy nút "Đăng xuất", nghĩa là đã vào được trang quản trị
    expect(page.get_by_role("button", name="Đăng xuất")).to_be_visible()

    # Dừng 2 giây để người xem kịp nhìn màn hình kết quả trước khi trình duyệt đóng
    page.wait_for_timeout(2000)
