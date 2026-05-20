# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Bảng xếp hạng chỉ hiện 1 người dùng**: Chuyển đổi hệ thống Bảng xếp hạng (Leaderboard) từ Firestore sang **Firebase Realtime Database** (`/leaderboard/{uid}`). Firestore Security Rules trước đó chỉ cho phép mỗi user đọc document của chính mình, khiến query collection-wide chỉ trả về 1 kết quả. RTDB cho phép tất cả user đã xác thực đọc toàn bộ node `/leaderboard`, đảm bảo mọi học viên đều hiện trên bảng xếp hạng.
- Đồng bộ tự động dữ liệu leaderboard (tên, ảnh, sao, streak) lên RTDB mỗi khi `saveStreak` chạy.
- Tự động tạo profile leaderboard cho user mới ngay khi đăng nhập thành công (`ensureUserProfile`).

### Added
- Tích hợp nút **"Đổi từ khác" (🔄)** ở tiêu đề bảng "Từ vựng hôm nay" trên Dashboard giúp đổi từ ngẫu nhiên tức thì.

### Changed
- Cải tiến cơ chế chọn từ gợi ý ở mục "Từ vựng hôm nay" thành **gợi ý ngẫu nhiên** dựa trên trình độ hiện tại của người học (mặc định A1 cho người mới), thay vì cố định một từ theo ngày như trước.
- Thêm cơ chế **CSS Cache-buster (v=1.0.2)** trong file `index.html` để buộc trình duyệt tải lại file CSS mới nhất, tránh bị lưu bộ nhớ đệm (cache) cũ.
- **Tối ưu hóa Tốc độ Khởi chạy (Self-Healing Optimization)**: Thay đổi cơ chế tự chữa lỗi dữ liệu (self-healing) trong `db-manager.js` để chỉ lưu ghi chú (`store.put`) cho các từ thực sự thay đổi hoặc từ mới thay vì ghi đè lại toàn bộ hơn 5,000 từ. Rút ngắn thời gian khởi tạo dữ liệu cục bộ từ 5-15 giây xuống còn dưới 5ms, khắc phục hoàn toàn hiện trạng treo vô hạn hoặc kẹt 0% khi mở lại ứng dụng.

### Fixed
- **Bảo mật & Hiển thị Hồ sơ Khách**: Sửa lỗi rò rỉ tên cá nhân và ảnh đại diện sau khi đăng xuất. Ở Chế độ Khách (Offline/Guest), widget hồ sơ và lời chào luôn hiển thị thông tin chung là `"Học viên (Khách)"` / `"Khách"` cùng avatar Cáo mặc định (`🦊`), bảo vệ tuyệt đối dữ liệu cá nhân.
- **Ràng buộc Quyền đổi hồ sơ**: Giới hạn việc đổi tên/ảnh đại diện **chỉ khả dụng khi đã đăng nhập Google thành công**. Nhấp vào avatar ở chế độ offline sẽ hiện cảnh báo yêu cầu đăng nhập. Ẩn biểu tượng đổi ảnh `🐾` và đổi con trỏ chuột thành mặc định khi chưa đăng nhập.
- **Khắc phục Lỗi treo đồng bộ dữ liệu**: Giải quyết triệt để lỗi màn hình tải dữ liệu người dùng xoay vô tận (`Đang khởi tạo lộ trình...` hoặc chỉ số bị kẹt ở `0%`) khi mạng yếu hoặc Firebase phản hồi chậm. Bổ sung cơ chế giới hạn thời gian chờ đồng bộ (timeout 5 giây) kết hợp tự động dựng giao diện bằng dữ liệu bộ nhớ cục bộ (offline-first fallback) tức thì khi tải ứng dụng.
- **Đồng bộ Tên hiển thị**: Sửa lỗi tên hiển thị mới đổi cục bộ không được lưu lên Firebase Firestore do thiếu tham số khi gọi hàm `saveStreak`.
- Sửa lỗi hiển thị chữ dư thừa "LearningEnglish" và icon ngọn lửa Streak ở góc trên bên trái màn hình máy tính (ẩn thanh điều hướng `mobile-top-bar` và lớp phủ `mobile-menu-overlay` mặc định trên desktop).
- **Ẩn Logo Trùng lặp trên Di động**: Thiết lập ẩn class `.brand` khi mở thanh menu trượt ở chế độ hiển thị di động/máy tính bảng (dưới 1024px) để tránh dư thừa trùng lặp tiêu đề ứng dụng LearningEnglish.

