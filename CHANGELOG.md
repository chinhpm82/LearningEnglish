# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Tích hợp nút **"Đổi từ khác" (🔄)** ở tiêu đề bảng "Từ vựng hôm nay" trên Dashboard giúp đổi từ ngẫu nhiên tức thì.

### Changed
- Cải tiến cơ chế chọn từ gợi ý ở mục "Từ vựng hôm nay" thành **gợi ý ngẫu nhiên** dựa trên trình độ hiện tại của người học (mặc định A1 cho người mới), thay vì cố định một từ theo ngày như trước.
- Thêm cơ chế **CSS Cache-buster (v=1.0.2)** trong file `index.html` để buộc trình duyệt tải lại file CSS mới nhất, tránh bị lưu bộ nhớ đệm (cache) cũ.

### Fixed
- **Bảo mật & Hiển thị Hồ sơ Khách**: Sửa lỗi rò rỉ tên cá nhân và ảnh đại diện sau khi đăng xuất. Ở Chế độ Khách (Offline/Guest), widget hồ sơ và lời chào luôn hiển thị thông tin chung là `"Học viên (Khách)"` / `"Khách"` cùng avatar Cáo mặc định (`🦊`), bảo vệ tuyệt đối dữ liệu cá nhân.
- **Ràng buộc Quyền đổi hồ sơ**: Giới hạn việc đổi tên/ảnh đại diện **chỉ khả dụng khi đã đăng nhập Google thành công**. Nhấp vào avatar ở chế độ offline sẽ hiện cảnh báo yêu cầu đăng nhập. Ẩn biểu tượng đổi ảnh `🐾` và đổi con trỏ chuột thành mặc định khi chưa đăng nhập.
- **Khắc phục Lỗi treo đồng bộ dữ liệu**: Giải quyết triệt để lỗi màn hình tải dữ liệu người dùng xoay vô tận (`Đang khởi tạo lộ trình...` hoặc chỉ số bị kẹt ở `0%`) khi mạng yếu hoặc Firebase phản hồi chậm. Bổ sung cơ chế giới hạn thời gian chờ đồng bộ (timeout 5 giây) kết hợp tự động dựng giao diện bằng dữ liệu bộ nhớ cục bộ (offline-first fallback) tức thì khi tải ứng dụng.
- **Đồng bộ Tên hiển thị**: Sửa lỗi tên hiển thị mới đổi cục bộ không được lưu lên Firebase Firestore do thiếu tham số khi gọi hàm `saveStreak`.
- Sửa lỗi hiển thị chữ dư thừa "LearningEnglish" và icon ngọn lửa Streak ở góc trên bên trái màn hình máy tính (ẩn thanh điều hướng `mobile-top-bar` và lớp phủ `mobile-menu-overlay` mặc định trên desktop).

