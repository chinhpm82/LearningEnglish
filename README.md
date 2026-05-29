# LearningEnglish - Ứng Dụng Tự Học Tiếng Anh Phù Hợp & Lưu Trình Độ (CEFR Standard) 🚀

**LearningEnglish** là ứng dụng Single-Page (SPA) gọn nhẹ và tối giản, được thiết kế để mang lại trải nghiệm **tự học từ vựng và luyện kỹ năng tiếng Anh cơ bản**. Ứng dụng tích hợp cơ chế phân phối từ vựng phù hợp và hệ thống tích sao (gamification) cơ bản giúp người học theo dõi tiến trình của mình mà không cần hệ thống máy chủ phức tạp.

*Lưu ý: Ứng dụng đang trong quá trình phát triển tích cực, liên tục hoàn thiện và cập nhật thêm các tính năng thực tế khác.*

---

## 📊 THỐNG KÊ KHO DỮ LIỆU HỌC TẬP (DATABASE)

Ứng dụng sở hữu kho dữ liệu học tập được phân loại theo khung tham chiếu ngôn ngữ chung Châu Âu (CEFR) và các chuyên ngành cụ thể:

### 1. Kho Từ Vựng Oxford 5000 (Tổng cộng: 6,215 từ)
Toàn bộ từ vựng được phân chia vào các danh mục phù hợp với trình độ của từng học viên:

| Nhóm Từ Vựng | Số Lượng Từ | Trình Độ CEFR Áp Dụng | Mô Tả & Phương Pháp Tiếp Cận |
| :--- | :---: | :---: | :--- |
| **`oxford`** (Phổ thông cơ bản) | **2,970 từ** | `A1` (Từ < 6 ký tự)<br>`A2` (Từ 6 - 8 ký tự)<br>`B1` (Từ > 8 ký tự & Idioms) | Tập trung vào phản xạ giao tiếp cốt lõi, từ vựng thông dụng hàng ngày. |
| **`academic`** (Học thuật tổng quát) | **1,658 từ** | `B2` | Các từ học thuật phục vụ cho việc đọc hiểu tài liệu chuyên môn. |
| **`spec-social`** (Chuyên ngành Xã hội) | **1,268 từ** | `C1` | Từ vựng ngành Kinh tế, Luật, Văn hóa, Nghệ thuật, Truyền thông. |
| **`spec-science`** (Chuyên ngành Khoa học) | **236 từ** | `C1` | Từ vựng ngành Y tế, Sinh học, Vật lý, Môi trường. |
| **`spec-tech`** (Chuyên ngành Kỹ thuật) | **83 từ** | `C1` | Từ vựng ngành IT, Khoa học Máy tính, Kỹ thuật. |
| **`custom`** (Sổ tay cá nhân) | *Không giới hạn* | Mọi trình độ | Do học viên tự nhập thủ công kèm nghĩa để lưu trữ và ôn tập riêng. |

*Học viên trình độ **`C2` (Thành thạo)** được mở khóa toàn quyền truy cập toàn bộ **6,215 từ** để ôn tập.*

### 2. Các Phân Hệ Học Tập Khác
*   **Đề Kiểm Tra Xếp Lớp (Entrance Test):** **16 câu trắc nghiệm khách quan** cơ bản gồm 4 phần kỹ năng đều nhau (Grammar, Vocabulary, Reading, Listening - mỗi phần 4 câu) giúp phân loại học viên vào 6 cấp độ CEFR (`A1` - `C2`).
*   **Mẫu Câu Giao Tiếp:** **Hàng trăm mẫu câu tiếng Anh thực dụng** được phân chia theo 5 tình huống thực tế: *Greeting* (Chào hỏi), *Travel* (Du lịch), *Dining* (Ăn uống), *Work* (Công sở), và *Social* (Giao tiếp xã hội).
*   **Chuyên Đề Ngữ Pháp:** **15+ Bài học ngữ pháp cốt lõi** từ cấp độ cơ bản đến phức tạp (Các thì, Mệnh đề quan hệ, Câu điều kiện...), đi kèm công thức, ví dụ song ngữ và bộ câu hỏi thực hành giải thích chi tiết.
*   **Luyện Dịch Song Ngữ:** **Hàng chục truyện ngắn & audio podcasts** hỗ trợ luyện dịch trực tiếp với cơ chế so khớp bản dịch cơ bản.

---

## ⚡ CÁC TÍNH NĂNG CHÍNH & CÁCH THỨC HOẠT ĐỘNG

Ứng dụng được tổ chức hoạt động dựa trên các quy trình cụ thể sau:

### 1. Phát Âm Hỗ Trợ (Web Speech API)
Tích hợp engine **Web Speech API (`window.speechSynthesis`)** để phát âm giọng đọc Anh - Mỹ cơ bản, tốc độ đọc được điều chỉnh phù hợp ở mức `0.85x` cho người mới học.

### 2. Ôn Tập Spaced Repetition (Leitner SRS)
Cơ chế Leitner chia từ vựng làm 3 Hộp (Box). Chu kỳ ôn tập tiếp theo (`nextReview`) tự động giãn cách hợp lý tùy theo trình độ năng lực CEFR hiện tại của học viên:
*   **Nhóm Sơ cấp (A1 - A2):** Tần suất lặp lại ngắn hơn (Hộp 2: **1.5 ngày**, Hộp 3: **4 ngày**).
*   **Nhóm Trung cấp (B1 - B2):** Tần suất tiêu chuẩn (Hộp 2: **3 ngày**, Hộp 3: **7 ngày**).
*   **Nhóm Cao cấp (C1 - C2):** Tần suất kéo dài hơn (Hộp 2: **5 ngày**, Hộp 3: **12 ngày**).
*   *Trả lời sai sẽ hạ cấp về Hộp 1 để ôn tập lại ngay.*

### 3. Trộn Từ Gợi Ý Flashcard
Khi học Flashcards, ứng dụng sử dụng cơ chế lấy mẫu ngẫu nhiên có trọng số để bốc từ học tập theo tỉ lệ phù hợp: **70% từ cấp độ hiện tại, 20% từ cấp độ cũ lân cận (ôn tập), và 10% từ cấp độ tiếp theo (thử thách thêm)**. Mọi từ vựng đến hạn ôn tập (due review) từ mọi cấp độ luôn được ưu tiên đẩy lên đầu hàng đợi.

### 4. Tính Điểm Bài Viết Tự Động (Writing Assessment)
Hệ thống tính điểm đoạn văn tự động thang điểm 100 dựa trên 5 tiêu chuẩn đánh giá cơ bản:
1.  **Length (Độ dài - 25đ):** Đề xuất theo cấp độ đề bài (Beginner: 50-80 từ, Intermediate: 80-120 từ, Advanced: 100-150 từ), tự động co giãn yêu cầu `targetMin` từ **15% đến 30%** dựa theo chênh lệch trình độ thực tế của học viên.
2.  **Vocabulary Suggestion (Từ vựng gợi ý - 25đ):** Cộng `+5đ` cho mỗi từ khóa học thuật gợi ý được lồng ghép thành công (Regex so khớp ranh giới từ `\b`).
3.  **Lexical Diversity (TTR - 20đ):** Tính điểm đa dạng từ vựng qua chỉ số Type-Token Ratio.
4.  **Connectors (Từ nối - 15đ):** Đánh giá tính liên kết văn bản qua sự xuất hiện của các trạng từ liên kết (firstly, however, moreover...).
5.  **Syntax (Cú pháp - 15đ):** Tách câu và kiểm tra viết hoa đầu dòng (Trừ `3đ` mỗi lỗi).

### 5. Kiểm Tra Liêm Chính Học Thuật (Safety & Integrity)
Để ghi nhận nỗ lực thực tế, hệ thống hỗ trợ giám sát hành vi viết cơ bản:
*   Phạt sao chép văn bản (Copy-paste): Khấu trừ từ **15đ đến 70đ**.
*   Phạt tốc độ gõ bất thường (>130 WPM): Trừ **45đ**.
*   Phạt lặp từ rác (Spam Penalty): Giới hạn điểm tối đa ở **10/100** nếu chỉ số đa dạng từ vựng TTR < 0.28.
*   Phạt thoát tab/chuyển đổi ứng dụng: Khấu trừ `10đ` mỗi lần.
*   Phát hiện văn phong khuôn mẫu của ChatGPT (filler phrases): Khấu trừ `20đ`.

### 6. Trắc Nghiệm Từ Vựng (Quiz)
Sinh ngẫu nhiên bộ 10 câu hỏi trắc nghiệm từ vựng. Hệ thống tự động quét kho từ vựng toàn cục để chọn ra 3 đáp án nhiễu có nghĩa tiếng Việt khác biệt hoàn toàn để tạo độ thử thách phù hợp.

### 7. Luyện Dịch Truyện & Podcasts
Học viên nghe audio podcast hoặc đọc truyện ngắn và gõ bản dịch sang tiếng Việt. Hệ thống sử dụng thuật toán **Fuzzy Matching** cơ bản để chấm điểm bản dịch:
*   Độ khớp **>= 80%**: Đạt loại Xuất sắc, nhận **+30 ⭐**.
*   Độ khớp **50% - 80%**: Đạt loại Khá, nhận **+15 ⭐**.

### 8. Lộ Trình Nhiệm Vụ Hàng Ngày (Daily Roadmap)
Tự động khởi tạo **3 nhiệm vụ ngẫu nhiên mỗi sáng** (ví dụ: Hoàn thành 10 câu quiz, ôn tập 15 thẻ flashcard, đạt điểm viết cao...) phù hợp với trình độ CEFR hiện tại của bạn. Hoàn thành sẽ nhận thêm sao vàng để lưu trữ.

### 9. Đồng Bộ Đám Mây & Bảng Xếp Hạng
*   Tích hợp **Google Authentication** và đồng bộ tiến độ học tập hai chiều tự động lên **Firebase Firestore**.
*   Đồng bộ điểm số trực tiếp lên **Bảng Xếp Hạng Công Khai (Realtime Database Leaderboard)** để tranh tài cùng các học viên khác.
*   Tích hợp **Lớp đệm Cache (Caching Layer)** và cơ chế **Tự phục hồi dữ liệu lệch khoá (Self-Healing)** giúp ứng dụng chạy ổn định, tối ưu hóa truy vấn dữ liệu đám mây và bảo vệ chuỗi Streak học tập bền vững.

### 10. Giao Diện Kính Mờ (Glassmorphism)
Thiết kế giao diện Modern Dark Mode: Các thẻ kính mờ (Glassmorphism), hiệu ứng chuyển động mượt nhẹ (Micro-animations), và bảng màu HSL dịu mắt phù hợp tự học vào ban đêm.

---

## ⭐ HỆ THỐNG PHẦN THƯỞNG GAMIFICATION (TÍCH SAO)

Tiến trình học tập của bạn được ghi nhận phù hợp qua hệ thống Sao Vàng (Gold Stars) và Chuỗi Ngày Học (Streak) thời gian thực:

| Hoạt Động Học Tập | Số Sao Thưởng (Stars) | Điều Kiện Nhận Thưởng |
| :--- | :---: | :--- |
| **Ôn Tập Flashcards** | **+10 ⭐** | Hoàn thành ôn tập toàn bộ số lượng thẻ trong deck. |
| **Trắc Nghiệm Từ Vựng** | **Tối đa +15 ⭐** | `5 ⭐` cơ bản + `1 ⭐` cho mỗi câu trả lời đúng. |
| **Luyện Viết AI (Writing)** | **Dynamic Delta** | Quy đổi `stars = Score / 2`. Chỉ được nhận thêm sao khi điểm bài viết mới vượt qua kỷ lục cũ của chính mình ở chủ đề đó. |
| **Học Bài Ngữ Pháp Mới** | **+10 ⭐** | Hoàn thành làm bài quiz ngữ pháp lần đầu tiên. |
| **Ôn Tập Ngữ Pháp Cũ** | **+4 ⭐** | Làm lại bài quiz ngữ pháp đã hoàn thành trước đó. |
| **Luyện Dịch Xuất Sắc** | **+30 ⭐** | Bản dịch khớp `>= 80%` so với bản dịch chuẩn. |
| **Luyện Dịch Khá Tốt** | **+15 ⭐** | Bản dịch khớp `50%` đến dưới `80%`. |
| **Thuộc Câu Giao Tiếp** | **+1 ⭐** | Tích chọn "Đã thuộc ✅" cho một mẫu câu giao tiếp mới. |
| **Thêm Từ Vào Sổ Tay** | **+5 ⭐** | Thêm một từ vựng mới tự chọn vào sổ tay cá nhân. |
| **Hoàn Thành Checklist** | **+5 ⭐ / +10 ⭐** | Hoàn thành mục tiêu đề ra trong nhiệm vụ hàng ngày. |
| **Thi Đấu Arena (Solo/Win)**| **+15 ⭐** | Đạt hạng nhất hoặc hoàn thành 10 câu solo Arena. |
| **Thi Đấu Arena (Hòa/Thua)**| **+8 ⭐ / +2 ⭐** | Điểm hòa hoặc tham gia khuyến khích giải đấu. |

---

## ⌨️ PHÍM TẮT TIỆN LỢI TRÊN MÁY TÍNH

Tối ưu hóa tốc độ lướt thẻ từ vựng khi sử dụng PC/Laptop:
*   **Phím Space (Dấu cách):** Lật thẻ qua lại giữa mặt trước và mặt sau.
*   **Phím Mũi tên Trái (←):** Đánh dấu **Chưa thuộc ❌** (Hạ thẻ về Hộp 1).
*   **Phím Mũi tên Phải (→):** Đánh dấu **Đã thuộc/Đúng ✅** (Nâng thẻ lên Hộp cao hơn).
*   **Phím Enter hoặc Phím V:** Phát âm từ vựng / câu tiếng Anh hiện tại.

---

## ⚙️ HƯỚNG DẪN TRIỂN KHAI CỤC BỘ & LÊN INTERNET

### Chạy Cục Bộ (Local Dev Server)
Ứng dụng chạy hoàn toàn ở phía Client, không cần biên dịch phức tạp:
1.  Tải mã nguồn về máy tính.
2.  Mở bằng VS Code.
3.  Click chuột phải vào tệp `index.html` và chọn **Open with Live Server** (hoặc chạy dev server tĩnh bất kỳ trên cổng `http://127.0.0.1:5500`) để trải nghiệm mượt mà tính năng lưu trữ IndexedDB.

### Triển Khai Lên Internet Miễn Phí (GitHub Pages)
Đưa ứng dụng lên môi trường mạng để tự học mọi lúc mọi nơi trên điện thoại:
1.  Đẩy mã nguồn lên một Repository trên tài khoản GitHub cá nhân của bạn.
2.  Truy cập Repository -> Chọn **Settings** (Cài đặt) -> Chọn mục **Pages** ở danh mục bên trái.
3.  Tại phần **Build and deployment** -> **Source**: Chọn `Deploy from a branch`.
4.  Tại phần **Branch**: Chọn nhánh `main` và thư mục `/ (root)` -> Bấm **Save**.
5.  Đợi khoảng 1 phút, bạn sẽ có một đường dẫn trực tuyến miễn phí dạng: `https://<ten-tai-khoan>.github.io/<ten-repository>/` để bắt đầu học tập!

Chúc bạn có những trải nghiệm tự học tiếng Anh hữu ích cùng **LearningEnglish**! 🎓🌟
