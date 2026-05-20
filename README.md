# LearningEnglish - Tự Học Tiếng Anh Thông Minh 🚀

**LearningEnglish** là ứng dụng web Single-Page (SPA) tinh tế, gọn nhẹ và tối giản, được thiết kế đặc biệt dành riêng cho việc **tự học từ vựng và câu giao tiếp tiếng Anh** hiệu quả nhất mà **không cần server, cơ sở dữ liệu hay lưu trữ file phương tiện (audio/hình ảnh) đắt đỏ**.

Ứng dụng được xây dựng theo triết lý tối ưu hóa tài nguyên tối đa: sử dụng hệ thống phát âm có sẵn của trình duyệt và lưu trữ dữ liệu hoàn toàn dưới LocalStorage/IndexedDB của người học.

---

## ⚠️ LƯU Ý QUAN TRỌNG CHO DEVELOPERS & CODING AGENTS

Hệ thống đánh giá, thang điểm trắc nghiệm, thuật toán thích ứng CEFR, cách tính chuỗi học tập (streak), phân loại từ vựng và cơ chế tính sao (stars) của ứng dụng đều tuân thủ nghiêm ngặt theo các tiêu chuẩn học thuật cốt lõi.

👉 **Trước khi thay đổi bất kỳ dòng mã nào liên quan đến logic chấm điểm, tính năng game hóa, hoặc dữ liệu khóa học**, bạn **BẮT BUỘC** phải đọc và tuân theo chỉ dẫn chi tiết tại:
*   [**Tài liệu Quy tắc Học thuật (.rules/academic_rules.md)**](file:///.rules/academic_rules.md)

Mọi thay đổi tùy tiện không thông qua tài liệu này có thể làm ảnh hưởng tiêu cực đến trải nghiệm sư phạm và chất lượng đánh giá học viên!

---

## ✨ Điểm Nổi Bật Của LearningEnglish

1.  **Hệ thống phát âm chuẩn (Không tốn băng thông)**: Tích hợp trực tiếp **Web Speech API (`window.speechSynthesis`)** để phát âm từ vựng và câu giao tiếp chuẩn giọng Mỹ/Anh hoàn toàn miễn phí và mượt mà.
2.  **Học theo Phương pháp Leitner (Spaced Repetition)**: Thuật toán tự động tính toán thời gian ôn tập tối ưu cho từng từ dựa trên mức độ thuộc bài của bạn.
    *   **Hộp 1**: Từ mới (Cần học lại hàng ngày).
    *   **Hộp 2**: Từ đang nhớ (Học lại sau 3 ngày).
    *   **Hộp 3**: Từ đã thuộc (Học lại sau 7 ngày).
3.  **Trắc nghiệm ôn tập thông minh (Quiz)**: Tự động sinh ngẫu nhiên 10 câu hỏi trắc nghiệm từ kho dữ liệu, có đáp án gây nhiễu động, đo thời gian trả lời và cập nhật tỷ lệ chính xác.
4.  **Sổ tay cá nhân (Wordbook)**: Tự do thêm, tìm kiếm và quản lý từ vựng của riêng bạn ngoài kho dữ liệu có sẵn.
5.  **Mẫu câu giao tiếp thực tế**: Tích hợp các câu tiếng Anh thông dụng theo các tình huống thường gặp (Chào hỏi, Du lịch, Mua sắm, Công sở).
6.  **Giao diện Glassmorphism đỉnh cao**: Thiết kế Modern Dark Mode sang trọng, thân thiện với mắt khi học ban đêm, tối ưu cho cả điện thoại và máy tính.

---

## 🎨 Sơ Đồ Thiết Kế Hệ Thống (Architecture)

```
[Trình duyệt Người dùng] 
       │
       ├─► [Giao diện HTML5 / CSS3 Glassmorphism]
       │
       ├─► [Web Speech API] ──► (Phát âm giọng đọc Anh-Mỹ chuẩn miễn phí)
       │
       └─► [LocalStorage/IndexedDB] ──► (Lưu tiến trình học, Sổ tay cá nhân & Streak)
```

---

## ⚙️ Hướng Dẫn Chạy Ứng Dụng Cục Bộ (Locally)

Vì LearningEnglish là một ứng dụng client-side thuần túy, bạn không cần cài đặt NodeJS hay Python để chạy.

*   **Cách 1 (Đơn giản nhất)**: Nhấp đúp (Double-click) chuột vào tệp `index.html` để mở trực tiếp trên trình duyệt (Chrome, Edge, Safari, Firefox).
*   **Cách 2 (Sử dụng Dev Server - Khuyên Dùng)**: Nếu bạn có tiện ích mở rộng như **Live Server** trên VS Code, bạn có thể bấm **Go Live** để chạy ứng dụng trên cổng `http://127.0.0.1:5500`.

---

## 🚀 Triển Khai Lên Internet Hoàn Toàn Miễn Phí (GitHub Pages)

Vì ứng dụng không cần backend, **GitHub Pages** là nơi tuyệt vời và miễn phí 100% để bạn đưa LearningEnglish lên môi trường mạng để học trên mọi thiết bị di động cá nhân:

1.  Đẩy mã nguồn này lên một kho lưu trữ (Repository) trên tài khoản GitHub của bạn:
    ```bash
    git init
    git add .
    git commit -m "Khởi tạo ứng dụng LearningEnglish"
    git remote add origin <URL-KHO-LƯU-TRỮ-CỦA-BẠN>
    git branch -M main
    git push -u origin main
    ```
2.  Truy cập vào kho lưu trữ trên GitHub -> Chọn **Settings** (Cài đặt) -> Chọn mục **Pages** ở danh mục bên trái.
3.  Tại phần **Build and deployment** -> **Source**: Chọn `Deploy from a branch`.
4.  Tại phần **Branch**: Chọn nhánh `main` và thư mục `/ (root)` -> Bấm **Save**.
5.  Đợi khoảng 1-2 phút, GitHub sẽ cấp cho bạn một đường dẫn URL dạng: `https://<ten-tai-khoan>.github.io/LearningEnglish/`. Giờ đây bạn có thể mở đường dẫn này trên điện thoại để tự học mọi lúc mọi nơi!

---

## ⌨️ Phím Tắt Tiện Lợi Khi Lướt Flashcard

Để việc học tập nhanh hơn trên máy tính, bạn có thể thao tác hoàn toàn bằng bàn phím:
*   **Phím Space (Cách)**: Lật thẻ qua lại giữa Mặt trước và Mặt sau.
*   **Phím Mũi tên Trái (←)**: Đánh dấu từ "Chưa thuộc" (Đưa về Hộp 1).
*   **Phím Mũi tên Phải (→)**: Đánh dấu từ "Đã thuộc" (Tăng cấp Hộp).
*   **Phím Enter hoặc Phím V**: Phát âm từ vựng.

Chúc bạn có những trải nghiệm tự học tiếng Anh tuyệt vời cùng LearningEnglish!
