# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Tích hợp nút **"Đổi từ khác" (🔄)** ở tiêu đề bảng "Từ vựng hôm nay" trên Dashboard giúp đổi từ ngẫu nhiên tức thì.
- Cho phép người dùng **tự do thay đổi tên hiển thị và ảnh đại diện thú cưng (avatar)** ngay cả ở **Chế độ Khách (Offline/Guest Mode)**, lưu trữ an toàn trong IndexedDB và LocalStorage (tự động đồng bộ lên Cloud khi đăng nhập sau này).

### Changed
- Cải tiến cơ chế chọn từ gợi ý ở mục "Từ vựng hôm nay" thành **gợi ý ngẫu nhiên** dựa trên trình độ hiện tại của người học (mặc định A1 cho người mới), thay vì cố định một từ theo ngày như trước.
- Thêm cơ chế **CSS Cache-buster (v=1.0.2)** trong file `index.html` để buộc trình duyệt tải lại file CSS mới nhất, tránh bị lưu bộ nhớ đệm (cache) cũ.

### Fixed
- Sửa lỗi hiển thị chữ dư thừa "LearningEnglish" và icon ngọn lửa Streak ở góc trên bên trái màn hình máy tính (ẩn thanh điều hướng `mobile-top-bar` và lớp phủ `mobile-menu-overlay` mặc định trên desktop).
