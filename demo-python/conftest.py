"""Cấu hình chung cho mọi test: đọc .env và đặt kích thước cửa sổ trình duyệt."""
import os
from dataclasses import dataclass, field

import pytest
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


@dataclass(frozen=True)
class Config:
    web_url: str
    email: str
    # repr=False: khi test fail, pytest in giá trị biến ra màn hình — không để lộ mật khẩu.
    password: str = field(repr=False)


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    # Cửa sổ đủ to để người xem nhìn rõ trên máy chiếu.
    return {**browser_context_args, "viewport": {"width": 1280, "height": 800}}


@pytest.fixture(scope="session")
def config() -> Config:
    """Địa chỉ web và tài khoản test lấy từ file .env."""
    return Config(
        web_url=os.getenv("WEB_URL", "http://localhost:3000").rstrip("/"),
        email=os.getenv("ADMIN_EMAIL", ""),
        password=os.getenv("ADMIN_PASSWORD", ""),
    )
