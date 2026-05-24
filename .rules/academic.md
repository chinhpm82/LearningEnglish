# HỆ THỐNG ĐÁNH GIÁ TRÌNH ĐỘ VÀ PHÂN LOẠI HỌC LIỆU (ACADEMIC FRAMEWORK)

Khi xây dựng một hệ thống kiểm tra trình độ (Placement Test) chuyên về **Đọc (Reading)** và **Viết (Writing)** (hoặc kết hợp thêm **Listening**), hệ thống cần một mô hình toán học và cấu trúc đề bài rõ ràng để làm "căn cứ" phân loại học viên theo các khung chuẩn như CEFR (A1, A2, B1, B2, C1, C2). 

Dưới đây là giải pháp toàn diện về Căn cứ khoa học, Cấu trúc bài test và Thuật toán tính điểm được áp dụng làm **Tiêu chuẩn học thuật cốt lõi** cho hệ thống LearningEnglish.

---

## PHẦN 1: CĂN CỨ KHOA HỌC ĐỂ ĐÁNH GIÁ (FRAMEWORK)

Trọng tâm đánh giá tập trung vào **Ngôn ngữ tiếp nhận (Phần Đọc/Nghe)** và **Ngôn ngữ tạo lập (Phần Viết/Ngữ pháp)**. Căn cứ để tính toán và phân loại học liệu (cũng như câu hỏi) sẽ dựa trên 3 trụ cột:

### 1. Độ khó của Từ vựng (Vocabulary Profile)
Dựa trên tần suất xuất hiện từ vựng của Cambridge hoặc Oxford:
*   **A1 - A2 (Sơ cấp):** Từ vựng thuộc nhóm 1000 - 2000 từ thông dụng nhất.
*   **B1 - B2 (Trung cấp):** Từ vựng thuộc nhóm 3000 - 5000 từ, bắt đầu xuất hiện các từ phái sinh (collocations, phrasal verbs).
*   **C1 - C2 (Cao cấp):** Từ vựng học thuật (Academic Word List), thành ngữ (idioms), từ hiếm gặp.

### 2. Độ phức tạp của Cấu trúc (Grammar Complexity)
*   **Sơ cấp:** Sử dụng các thì đơn giản (Hiện tại đơn, Quá khứ đơn), câu đơn.
*   **Trung cấp:** Sử dụng các thì hoàn thành, câu điều kiện (loại 1, 2), mệnh đề quan hệ, câu bị động.
*   **Cao cấp:** Sử dụng câu điều kiện trộn, đảo ngữ, câu giả định, mệnh đề danh từ.

### 3. Độ dài và tính trừu tượng của Văn bản (Text Readability)
*   Đo lường bằng công thức ngôn ngữ học (như **Flesch-Kincaid**). 
*   Văn bản càng dài, câu chứa càng nhiều mệnh đề phụ, ý nghĩa càng ẩn dụ/học thuật thì cấp độ CEFR được gán càng cao.

---

## PHẦN 2: THIẾT KẾ MA TRẬN BÀI TEST TOÀN DIỆN (NGHE - ĐỌC - NGỮ PHÁP)

Khi hệ thống mở rộng đánh giá năng lực ngôn ngữ toàn diện dạng trắc nghiệm khách quan (tương tự bài thi TOEIC Listening & Reading), ngân hàng đề (Question Bank) cần được cấu trúc chặt chẽ.

### 1. Thuộc tính (Tags) cốt lõi của mỗi câu hỏi
Mỗi câu hỏi phải được gắn 3 thuộc tính để hệ thống tính toán:
1.  **Skill:** `Listening` | `Reading` | `Grammar/Vocabulary`
2.  **Level:** `A1` | `A2` | `B1` | `B2` | `C1` | `C2`
3.  **Question Type:** Loại câu hỏi (VD: nhìn tranh chọn câu đúng, điền từ, đọc hiểu).

### 2. Cấu trúc chi tiết 3 Kỹ Năng
#### 🎧 Kỹ năng 1: Nghe (Listening)
Chuyển từ Nghe bắt từ (nhận diện âm thanh) sang Nghe hiểu ý nghĩa/suy luận.
*   **Mức độ Dễ (A1-A2):** Nghe tranh hoặc Nghe hội thoại ngắn 1 câu. Học viên nghe mô tả/câu hỏi và chọn bức tranh/câu trả lời đúng nhất.
*   **Mức độ Trung bình (B1-B2):** Hội thoại ngắn (Short Conversations, 3-4 lượt). Nắm chi tiết: Ai, Cái gì, Ở đâu, Khi nào.
*   **Mức độ Khó (C1-C2):** Bài độc thoại (Short Talks/Lectures, 1-2 phút). Vừa nghe vừa suy luận ý chính, thái độ người nói.

#### 🔤 Kỹ năng 2: Chọn câu đúng (Grammar & Vocabulary)
Kiểm tra kiến thức nền tảng (dễ chấm điểm nhất).
*   **Dạng bài:** Sửa lỗi sai ngữ pháp, Hoàn thành câu (Sentence Completion).
*   **Mức dễ:** Kiểm tra từ loại (danh, tính, động, trạng), các thì cơ bản.
*   **Mức khó:** Kiểm tra cụm từ cố định (collocations), từ vựng nâng cao, cấu trúc đặc biệt (đảo ngữ, giả định).

#### 📖 Kỹ năng 3: Đọc hiểu (Reading)
*   **Điền đoạn văn (Cloze Test):** Khuyết 3-5 chỗ trống. Kiểm tra khả năng đọc hiểu mạch lạc (Coherence).
*   **Đọc hiểu văn bản (Reading Comprehension):** Đọc email, quảng cáo, bài báo để trả lời câu hỏi lựa chọn. Độ khó tăng dần theo độ dài và số lượng thông tin cần tổng hợp.

---

## PHẦN 3: PHƯƠNG PHÁP CHẤM ĐIỂM VÀ TÍNH TOÁN TRÌNH ĐỘ

Để tính ra trình độ tổng, hệ thống quy định 2 cách tiếp cận (tùy thuộc vào chiến lược triển khai code):

### Cách 1: Bài test Tuyến tính cố định (Linear Test có Trọng Số)
Học viên làm một bài test cố định (Ví dụ: 45 câu, mỗi kỹ năng 15 câu).

*   **Bước 1: Tính điểm riêng (Sub-scores).** Tính % chính xác của riêng phần Nghe, Đọc, và Ngữ pháp. Đừng gộp chung ngay từ đầu.
*   **Bước 2: Áp dụng công thức trọng số.** Nghe và Đọc hiểu đo lường xử lý ngữ cảnh thực tế nên chiếm trọng số cao hơn.
    > `Điểm tổng = (Điểm Nghe × 0.4) + (Điểm Đọc × 0.4) + (Điểm Ngữ Pháp × 0.2)`
*   **Bước 3: Quy đổi ra CEFR.** 
    *(Tham khảo Ma trận dành cho bài test 40 câu trắc nghiệm)*
    *   **0 - 10 điểm:** Lớp **A1** (Đúng chủ yếu câu dễ)
    *   **11 - 20 điểm:** Lớp **A2**
    *   **21 - 28 điểm:** Lớp **B1** (Làm tốt câu trung bình)
    *   **29 - 34 điểm:** Lớp **B2**
    *   **35 - 38 điểm:** Lớp **C1**
    *   **39 - 40+ điểm:** Lớp **C2** (Tuyệt đối)

### Cách 2: Vòng lọc phân loại (Multi-stage Adaptive Test) – Tối ưu cho AI
Cách này giúp giảm thời gian làm bài, tiết kiệm thời gian cho học viên giỏi và tránh nản chí cho học viên yếu.

1.  **Vòng 1: Khởi động (Mức B1):**
    Gồm 9-12 câu trộn cả 3 kỹ năng ở mức độ trung bình (B1).
2.  **Vòng 2: Rẽ nhánh thích ứng:**
    *   **Nhóm 1 (Đúng > 75%):** Đánh giá Khá/Giỏi. Vòng tiếp theo chỉ xuất hiện câu hỏi mức B2 và C1.
    *   **Nhóm 2 (Đúng 40% - 75%):** Tiếp tục lộ trình trung bình (test sâu hơn ở mức A2 và B1) để tìm nút thắt.
    *   **Nhóm 3 (Đúng < 40%):** Đánh giá mất gốc/yếu. Tự động hạ xuống toàn bộ câu hỏi dễ mức A1 và A2.
3.  **Vòng 3: Chốt trình độ:**
    Tính toán tỷ lệ chính xác trên tổng số câu khó/dễ đã làm để đưa ra kết luận (VD: Đạt B2 Nghe nhưng chỉ A2 Ngữ pháp).

---

## PHẦN 4: ĐÁNH GIÁ KỸ NĂNG VIẾT (INDIRECT WRITING)
Do hệ thống không có người chấm bài luận (Essay), bạn có thể đo lường tư duy viết và kiến thức tạo lập văn bản của học viên thông qua các dạng câu hỏi trắc nghiệm/sắp xếp tự động:

*   **Dạng 1: Tìm lỗi sai (Error Identification):** Cho một câu có 4 phần gạch chân, học viên phải tìm phần sai ngữ pháp hoặc sai cách dùng từ. *(Căn cứ: Đo lường độ chính xác - Accuracy)*.
*   **Dạng 2: Viết lại câu (Sentence Transformation):** Cho câu gốc, chọn câu có nghĩa tương đương nhưng dùng cấu trúc nâng cao hơn (ví dụ chuyển từ chủ động sang bị động, hoặc dùng đảo ngữ).
*   **Dạng 3: Sắp xếp câu thành đoạn văn (Paragraph Coherence):** Cho 5 câu độc lập bị xáo trộn, bắt học viên kéo thả sắp xếp lại theo thứ tự logic. *(Căn cứ: Đo lường tính mạch lạc - Coherence)*.
*   **Dạng 4: Điền từ tự do (Open Cloze):** Cho đoạn văn khuyết từ, học viên phải tự gõ từ thích hợp vào ô trống (không cho sẵn tùy chọn A, B, C, D). Dạng này kiểm tra cực tốt khả năng tự sản sinh ngôn ngữ của học viên.

---

## 💡 HƯỚNG DẪN QUẢN TRỊ DATABASE DÀNH CHO CODE
> [!TIP]
> Thay vì chỉ lưu tổng điểm, cơ sở dữ liệu (Firestore) bắt buộc phải lưu kết quả chi tiết theo cấu trúc:
> `[User_ID] | [Question_ID] | [Skill (VD: Listening)] | [Level (VD: B1)] | [Status: Correct/Incorrect]`
> 
> Việc lưu trữ hạt mịn (fine-grained data) này giúp AI sau này có thể phân tích sâu hơn: *"Học viên này có kỹ năng Nghe rất tốt (B2) nhưng Ngữ pháp lại rất yếu (A2)"*, từ đó cung cấp lộ trình học cá nhân hóa cực kỳ chính xác.