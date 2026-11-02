# Giai đoạn 1 — Thiết kế Database (PostgreSQL)

## 1. Sơ đồ quan hệ

```
        users ──────┬──────< articles >──────── categories
          │         │             │
          │         │             ├──< article_media >── media
          │         │             └──< article_destinations >── destinations
          │         │
          │         ├──< destinations >─────── categories
          │         │         ├──< destination_media >── media
          │         │         └──< events
          │         │
          │         ├──< foods >─────────────── categories
          │         ├──< events >────────────── categories
          │         └──< albums >──< album_media >── media
          │
          └──< media (uploaded_by)

        banners          (độc lập)
        settings         (bảng key-value, 1 dòng/khóa)
        contact_messages (độc lập)
        page_views       (ghi lượt xem đa hình)
```

## 2. Quy ước chung cho mọi bảng nội dung

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | `uuid` PK, mặc định `gen_random_uuid()` | Dùng UUID để không lộ số lượng bản ghi |
| `created_at` | `timestamptz` NOT NULL DEFAULT now() | |
| `updated_at` | `timestamptz` NOT NULL | Prisma tự cập nhật |
| `deleted_at` | `timestamptz` NULL | Soft delete; NULL = còn sống |

Index mặc định: `slug` (unique, có điều kiện `deleted_at IS NULL`), `status`, `published_at DESC`, các khóa ngoại.

## 3. Chi tiết các bảng

### 3.1 `users` — tài khoản quản trị
| Cột | Kiểu | Ràng buộc |
|---|---|---|
| id | uuid | PK |
| email | varchar(255) | UNIQUE, NOT NULL |
| password_hash | varchar(255) | NOT NULL (bcrypt) |
| full_name | varchar(150) | NOT NULL |
| avatar_url | text | NULL |
| role | enum `user_role` | NOT NULL, mặc định `editor` |
| is_active | boolean | NOT NULL, mặc định true |
| last_login_at | timestamptz | NULL |

`user_role` = `editor` | `admin` | `super_admin`

Không lưu quyền chi tiết thành bảng riêng — với 3 vai trò cố định, bảng `roles`/`permissions` chỉ làm phức tạp thêm. Nếu sau này cần phân quyền linh hoạt thì tách ra sau.

### 3.2 `categories` — danh mục dùng chung
| Cột | Kiểu | Ràng buộc |
|---|---|---|
| id | uuid | PK |
| type | enum `category_type` | NOT NULL |
| name | varchar(150) | NOT NULL |
| slug | varchar(180) | NOT NULL |
| description | text | NULL |
| parent_id | uuid | FK → categories.id, NULL |
| cover_image_url | text | NULL |
| sort_order | int | NOT NULL, mặc định 0 |
| is_active | boolean | NOT NULL, mặc định true |

`category_type` = `article` | `destination` | `food` | `event` | `culture` | `guide`

UNIQUE `(type, slug)` — cho phép danh mục "bien" tồn tại ở cả `destination` lẫn `article`.

Một bảng dùng chung cho tất cả loại danh mục, phân biệt bằng `type`. Lý do: màn hình quản lý danh mục chỉ cần một bộ CRUD với tab lọc, thay vì sáu bộ giống hệt nhau.

### 3.3 `articles` — bài viết (tin tức, văn hóa, cẩm nang)
| Cột | Kiểu | Ràng buộc |
|---|---|---|
| id | uuid | PK |
| title | varchar(255) | NOT NULL |
| slug | varchar(280) | NOT NULL |
| excerpt | varchar(500) | NULL — mô tả ngắn |
| content | jsonb | NOT NULL — nội dung TipTap |
| content_html | text | NULL — bản render sẵn, dùng cho SEO/prerender |
| cover_image_url | text | NULL |
| type | enum `article_type` | NOT NULL |
| category_id | uuid | FK → categories.id, NULL |
| author_id | uuid | FK → users.id, NOT NULL |
| tags | text[] | mặc định `{}` |
| status | enum `content_status` | NOT NULL, mặc định `draft` |
| published_at | timestamptz | NULL — dùng cho cả lên lịch |
| view_count | int | NOT NULL, mặc định 0 |
| is_featured | boolean | NOT NULL, mặc định false |
| seo_title | varchar(255) | NULL |
| seo_description | varchar(320) | NULL |
| og_image_url | text | NULL |

`article_type` = `news` | `culture` | `guide` | `lesson`
`content_status` = `draft` | `published` | `scheduled` | `archived`

Lưu nội dung dạng `jsonb` (TipTap) để sửa lại chính xác, kèm `content_html` để backend trả nhanh cho bot và cho trang chi tiết.

**Quy tắc hiển thị công khai:** `status = 'published' AND published_at <= now() AND deleted_at IS NULL`. Bài `scheduled` tự lên sóng khi tới giờ mà không cần job chạy nền — chỉ nhờ điều kiện truy vấn này.

### 3.3b Góc học tập — bổ sung cho `articles` + bảng `learning_courses`

Bài học **dùng chính bảng `articles`** với `type = 'lesson'`, thêm 4 cột:

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `course_id` | uuid FK → learning_courses.id, NULL | Bài thuộc khóa nào |
| `lesson_order` | int, NULL | Thứ tự bài trong khóa (1, 2, 3…) |
| `video_url` | text, NULL | Link video bài giảng (YouTube nhúng) |
| `duration_minutes` | int, NULL | Thời lượng, hiện trên card |

UNIQUE `(course_id, lesson_order)` khi `deleted_at IS NULL` — tránh hai bài cùng số thứ tự.

Bảng mới **`learning_courses`** (khóa học / chuỗi bài):

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id, title, slug, description, cover_image_url | | như các bảng nội dung khác |
| `category_id` | uuid FK → categories (`type = 'learning'`) | Lập trình / Tiếng Anh / Tiếng Nhật / Khác |
| `level` | enum `course_level` | `beginner` \| `intermediate` \| `advanced` |
| `lesson_count` | int | Tính lại khi thêm/bớt bài, để không phải đếm mỗi lần tải trang |
| `status`, `published_at`, `view_count`, `is_featured`, `seo_*` | | như `articles` |
| `created_at`, `updated_at`, `deleted_at` | | |

`category_type` có thêm giá trị `learning`.

**Không có** bảng `enrollments`, `progress` hay tài khoản người học: người xem vẫn ẩn danh, vào đọc bài và xem video, không đăng nhập. Nếu sau này muốn đánh dấu "đã học xong" thì mới cần thêm, và khi đó phải mở hệ thống tài khoản cho người dùng cuối — một thay đổi lớn, nên cân nhắc riêng.

**Video:** chỉ lưu link YouTube trong `video_url`, không tự host. Lý do: Cloudinary gói free không chịu nổi video dài, còn YouTube miễn phí, có sẵn trình phát, tự nén theo đường truyền và tự có phụ đề.

### 3.4 `destinations` — điểm đến
| Cột | Kiểu | Ràng buộc |
|---|---|---|
| id | uuid | PK |
| name | varchar(255) | NOT NULL |
| slug | varchar(280) | NOT NULL |
| summary | varchar(500) | NULL |
| content | jsonb | NULL |
| content_html | text | NULL |
| cover_image_url | text | NULL |
| category_id | uuid | FK → categories.id |
| region | varchar(120) | NULL — khu vực, dùng để lọc |
| address | text | NULL |
| latitude | numeric(10,7) | NULL |
| longitude | numeric(10,7) | NULL |
| best_time | varchar(200) | NULL — thời điểm đẹp nhất |
| visit_info | jsonb | NULL — giờ mở cửa, cách đi, lưu ý |
| status | enum `content_status` | NOT NULL |
| published_at | timestamptz | NULL |
| view_count | int | mặc định 0 |
| is_featured | boolean | mặc định false |
| seo_title, seo_description, og_image_url | | như articles |

### 3.5 `foods` — ẩm thực & đặc sản
Cấu trúc giống `destinations`, bỏ tọa độ, thêm:
| Cột | Kiểu | Ghi chú |
|---|---|---|
| origin_story | text | Nguồn gốc, câu chuyện món ăn |
| where_to_eat | jsonb | Danh sách nơi thưởng thức (tên, địa chỉ) |
| season | varchar(120) | Mùa nào có |

### 3.6 `events` — sự kiện, lễ hội
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id, name, slug, content, cover_image_url | | như trên |
| category_id | uuid | FK → categories |
| destination_id | uuid | FK → destinations, NULL — sự kiện diễn ra ở đâu |
| location_text | varchar(255) | Khi không gắn với điểm đến cụ thể |
| start_at / end_at | timestamptz | NOT NULL / NULL |
| is_recurring | boolean | Lễ hội thường niên |
| status, published_at, seo_* | | như trên |

### 3.7 `media` — thư viện ảnh/video
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | uuid | PK |
| public_id | varchar(255) | ID trên Cloudinary, dùng để xóa |
| url | text | NOT NULL |
| thumbnail_url | text | |
| type | enum `media_type` | `image` \| `video` \| `embed` |
| file_name | varchar(255) | |
| mime_type | varchar(100) | |
| size_bytes | bigint | Để tính dung lượng đã dùng |
| width / height | int | |
| alt_text | varchar(255) | Quan trọng cho SEO |
| caption | varchar(500) | |
| folder | varchar(120) | Phân loại trong thư viện |
| uploaded_by | uuid | FK → users |

### 3.8 `albums` + `album_media`
`albums`: id, title, slug, description, cover_image_url, category_id, status, published_at, sort_order, seo_*.
`album_media`: `album_id`, `media_id`, `sort_order` — PK kép `(album_id, media_id)`.

Tương tự có `article_media` và `destination_media` cho album ảnh của bài viết / điểm đến, và `article_destinations` để nối bài viết với điểm đến (phục vụ khối "bài viết liên quan" ở trang chi tiết điểm đến).

### 3.9 `banners`
id, title, subtitle, image_url, mobile_image_url, link_url, position (enum: `home_hero` | `home_middle` | `sidebar`), sort_order, is_active, start_at, end_at.

### 3.10 `settings` — cấu hình website
| Cột | Kiểu |
|---|---|
| key | varchar(100) PK |
| value | jsonb |
| group | varchar(50) — `general` \| `contact` \| `social` \| `seo` |
| updated_at | timestamptz |

Khóa dự kiến: `site_name`, `slogan`, `logo_url`, `favicon_url`, `about_short`, `hotline`, `email`, `address`, `facebook_page_url`, `facebook_page_id`, `youtube_url`, `tiktok_url`, `default_seo_title`, `default_seo_description`, `default_og_image`, `footer_text`.

Dùng key-value để thêm cấu hình mới không phải migrate bảng.

### 3.11 `contact_messages`
id, full_name, email, phone, subject, message, ip_address, is_read, created_at.

### 3.12 `page_views` — thống kê
| Cột | Kiểu |
|---|---|
| id | bigserial PK |
| content_type | varchar(30) — `article` \| `destination` \| `food` \| `event` \| `album` |
| content_id | uuid |
| viewed_date | date — gộp theo ngày |
| view_count | int |

UNIQUE `(content_type, content_id, viewed_date)` — mỗi ngày một dòng, tăng dần. Cách này giữ bảng nhỏ (quan trọng vì Neon free chỉ 1 GB) mà vẫn vẽ được biểu đồ lượt xem theo ngày cho Dashboard.

## 4. Migration & Seed

- Prisma Migrate: `prisma/migrations/`, chạy `npm run db:migrate`.
- Seed (`prisma/seed.ts`) tạo sẵn:
  - 1 tài khoản `super_admin` (email + mật khẩu lấy từ `.env`, không hardcode).
  - Bộ danh mục đầy đủ cho 6 `category_type`.
  - 8 điểm đến mẫu, 6 món ăn, 6 bài viết (2 tin tức, 2 văn hóa, 2 cẩm nang), 3 sự kiện, 2 album, 2 banner, toàn bộ settings.
  - Ảnh mẫu dùng link Unsplash có giấy phép tự do, ghi nguồn trong `alt_text`.

Chạy `npm run db:seed` là có dữ liệu demo ngay, đáp ứng yêu cầu IX.15.
