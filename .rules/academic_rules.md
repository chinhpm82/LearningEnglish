# BẢN ĐỒ QUY TẮC SƯ PHẠM & HỆ THỐNG ĐÁNH GIÁ HỌC VIÊN (ACADEMIC RULES & STANDARDS)

Tài liệu này tổng hợp toàn bộ các điều kiện then chốt, quy tắc học thuật, và tiêu chuẩn đánh giá được cài đặt trong ứng dụng **LearningEnglish**. Các quy tắc này ảnh hưởng trực tiếp đến chất lượng bài giảng, cách đánh giá trình độ và cơ chế trả thưởng của học viên. 

> [!IMPORTANT]
> **HƯỚNG DẪN DÀNH CHO AGENT CODE:**
> Khi thực hiện bất kỳ thay đổi nào trong mã nguồn (đặc biệt là trong `app.js`, `challenge.js` hoặc các file dữ liệu trong `data/`), **tuyệt đối không được thay đổi các quy tắc, công thức toán học và logic nghiệp vụ dưới đây** trừ khi có yêu cầu bằng văn bản rõ ràng từ người dùng. Mọi sự thay đổi tùy tiện sẽ làm sai lệch chất lượng đánh giá học thuật và hệ thống gamification của ứng dụng.

---

## 1. QUY ĐỊNH VỀ CÁCH TÍNH ĐIỂM ĐỐI VỚI CÁC BÀI KIỂM TRA ĐÁNH GIÁ, TRẮC NGHIỆM

### A. Bài Kiểm Tra Đánh Giá Đầu Vào (CEFR Entrance Placement Test)
*   **Cấu trúc đề:** Gồm đúng **16 câu hỏi trắc nghiệm khách quan** được lưu trữ trong `PLACEMENT_QUESTIONS` (`data/placement-questions.js`), chia đều làm 4 phần kỹ năng cốt lõi (mỗi phần 4 câu):
    1.  `grammar` (Ngữ pháp): Câu hỏi từ `pq-g1` đến `pq-g4`.
    2.  `vocabulary` (Từ vựng): Câu hỏi từ `pq-v1` đến `pq-v4`.
    3.  `reading` (Đọc hiểu): Câu hỏi từ `pq-r1` đến `pq-r4`.
    4.  `listening` (Nghe phản xạ): Câu hỏi từ `pq-l1` đến `pq-l4`.
*   **Cách chấm điểm:** 
    *   Mỗi câu trả lời đúng được tính **1 điểm**. Tổng điểm tối đa là **16 điểm**.
    *   Hệ thống lưu trữ chi tiết điểm số của từng kỹ năng vào `state.placementStats` để vẽ biểu đồ năng lực học viên trên Dashboard:
        ```javascript
        state.placementStats = {
            grammar: grammarCorrect,   // Tối đa 4
            reading: readingCorrect,   // Tối đa 4
            vocab: vocabCorrect,       // Tối đa 4 (Vocabulary)
            listening: listeningCorrect // Tối đa 4 (Listening)
        };
        ```

### B. Bài Trắc Nghiệm Từ Vựng Thông Thường (Vocabulary Quiz)
*   **Cấu trúc:** Mặc định gồm **10 câu hỏi ngẫu nhiên** được lấy từ danh mục từ vựng tương ứng.
*   **Logic tạo câu hỏi:**
    *   Mỗi câu hỏi sẽ chọn ra 1 từ làm mục tiêu (`wordObj`).
    *   Hệ thống tự động quét kho từ vựng toàn cục để lấy ngẫu nhiên 3 từ khác có nghĩa tiếng Việt khác biệt hoàn toàn để làm phương án nhiễu (`distractors`).
    *   Trộn ngẫu nhiên đáp án đúng và 3 đáp án nhiễu thành mảng 4 lựa chọn để hiển thị trên UI.
*   **Điểm số:** Được tính bằng tổng số câu trả lời đúng trên tổng số câu hỏi (`quizScore` / 10).

### C. Bài Luyện Viết Đoạn Văn & Chấm Điểm AI (Writing Essay Assessment)
*   **Thang điểm:** **100 điểm** được tính tự động dựa trên 5 tiêu chí học thuật:
    1.  **Độ dài đoạn văn (Length Score - Tối đa 25 điểm):**
        *   Yêu cầu số từ tối thiểu (`targetMin`) và tối đa (`targetMax`) thay đổi linh hoạt theo cấp độ của chủ đề:
            *   *Beginner:* 50 - 80 từ.
            *   *Intermediate:* 80 - 120 từ.
            *   *Advanced:* 100 - 150 từ.
        *   **Cơ chế điều chỉnh sư phạm thích ứng (Adaptive CEFR):** Hệ thống tự động giảm yêu cầu đối với học viên vượt cấp và tăng yêu cầu đối với học viên trình độ cao viết chủ đề thấp:
            *   Học viên cấp thấp (*Beginner*) viết bài cấp cao (*Advanced*): Giảm **30%** `targetMin`.
            *   Học viên cấp trung (*Intermediate*) viết bài cấp cao (*Advanced*): Giảm **15%** `targetMin`.
            *   Học viên cấp thấp (*Beginner*) viết bài cấp trung (*Intermediate*): Giảm **20%** `targetMin`.
            *   Học viên cấp cao (*Advanced*) viết bài cấp thấp (*Beginner*): Tăng **20%** `targetMin` để thử thách.
        *   *Công thức tính điểm độ dài:*
            *   Nằm trong khoảng `[targetMin, targetMax]`: Đạt **25 điểm**.
            *   Dưới mức tối thiểu: `Math.round((actualWords / targetMin) * 20)`.
            *   Vượt mức tối đa: `Math.max(15, 25 - Math.round((actualWords - targetMax) / 10))`.
    2.  **Từ vựng gợi ý (Vocabulary Score - Tối đa 25 điểm):**
        *   Mỗi chủ đề viết đi kèm một danh sách các từ vựng học thuật bắt buộc.
        *   Mỗi từ gợi ý được học viên lồng ghép thành công vào đoạn văn một cách hợp lệ (so khớp không phân biệt hoa thường bằng Regex ranh giới từ `\b`) sẽ được cộng **+5 điểm** (tối đa 5 từ = 25 điểm).
    3.  **Sự đa dạng từ vựng (Lexical Diversity - Tối đa 20 điểm):**
        *   Sử dụng chỉ số **TTR (Type-Token Ratio)** bằng cách lấy số từ duy nhất (unique words) chia cho tổng số từ của bài viết.
        *   *Công thức tính điểm:* `Math.round(TTR * 20)`.
    4.  **Từ nối liên kết văn bản (Structural Connectors - Tối đa 15 điểm):**
        *   Hệ thống kiểm tra sự xuất hiện của các từ nối liên kết logic ý tưởng: *firstly, secondly, thirdly, furthermore, moreover, additionally, however, on the other hand, in addition, therefore, ultimately, in conclusion, to sum up, first of all, last but not least*.
        *   Mỗi từ nối xuất hiện trong bài viết được tính **+5 điểm** (tối đa 15 điểm).
    5.  **Cú pháp & Viết hoa (Syntax & Capitalization - Tối đa 15 điểm):**
        *   Hệ thống tự động tách các câu trong bài viết và kiểm tra ký tự đầu tiên của mỗi câu sau các dấu chấm câu (`.`, `!`, `?`) đã được viết hoa hay chưa.
        *   *Công thức tính điểm:* Bắt đầu từ 15 điểm, trừ **3 điểm cho mỗi câu không viết hoa đầu dòng** (điểm tối thiểu là 5 điểm).
*   **Hệ Thống Khung Phạt Sư Phạm & Liêm Chính Học Thuật (Safety & Integrity Penalties):**
    *   **Phạt từ vựng không hợp lệ:** Nếu đoạn văn chứa ít hơn 5 từ tiếng Anh hợp lệ, bài viết bị tính **0 điểm** (`nonEnglishPenalty`).
    *   **Phạt độ dài tối thiểu cực đoan:** Nếu bài viết dưới 15 từ, điểm tối đa bị giới hạn nghiêm khắc ở **12/100** để ngăn chặn gian lận nhập ký tự ngẫu nhiên (`shortLengthPenalty`).
    *   **Phạt lặp từ rác (Spam Penalty):** Nếu chỉ số đa dạng từ vựng TTR < 0.28 (phát hiện hành vi gõ lặp đi lặp lại một vài từ rác), điểm tối đa bị giới hạn ở **10/100** (`spamPenalty`).
    *   **Khấu trừ điểm liêm chính học thuật (Integrity Score Penalty):** Hệ thống giám sát telemetry hành vi thực tế của học viên khi viết bài (thời gian làm bài, số lần sao chép - dán, số lần thoát tab/ứng dụng). Điểm liêm chính bắt đầu từ 100 điểm:
        *   Dán một khối lượng lớn văn bản (Copy-paste block): Trừ **70 điểm**.
        *   Mỗi lần dán văn bản nhỏ: Trừ **15 điểm / lần**.
        *   Tốc độ gõ siêu tốc bất khả thi (>130 WPM): Trừ **45 điểm** (nghi vấn dùng AI/Copy).
        *   Tốc độ gõ bất thường (>70 WPM): Trừ **20 điểm**.
        *   Mỗi lần thoát tab/đổi ứng dụng: Trừ **10 điểm / lần** (khấu trừ tối đa 25 điểm).
        *   Sử dụng văn phong khuôn mẫu kinh điển đặc trưng của ChatGPT (ví dụ: *in today's fast-paced world, double-edged sword, plays a crucial role...* xuất hiện từ 3 cụm trở lên): Trừ **20 điểm**.
        *   *Công thức áp dụng phạt:* Nếu điểm liêm chính `integrityScore < 95`, điểm số cuối cùng của bài viết sẽ bị khấu trừ tỷ lệ tương ứng:
            ```javascript
            finalScore = Math.round(totalScore * (integrityScore / 100));
            ```

---

## 2. QUY ĐỊNH VỀ CÁCH XẾP LOẠI HỌC VIÊN (STUDENT CEFR GRADING)

Trình độ của học viên được phân cấp tự động và bảo mật theo khung tham chiếu ngôn ngữ chung Châu Âu (CEFR) gồm **8 mức độ** dựa theo kết quả tổng điểm bài Placement Test đầu vào:

| Tổng điểm (Số câu đúng) | Trình Độ (Mã) | Tên Hiển Thị Trình Độ | Mô Tả Sư Phạm |
| :---: | :---: | :---: | :--- |
| **0 - 2** | `A1` | Sơ cấp (A1) | Người mới bắt đầu học, vốn từ hạn chế. |
| **3 - 4** | `A2` | Sơ cấp (A2) | Có thể giao tiếp rất cơ bản trong các tình huống quen thuộc. |
| **5 - 6** | `A3` | Tiền trung cấp (A3) | Có nền tảng vững vàng hơn, chuẩn bị lên trung cấp. |
| **7 - 8** | `B1` | Trung cấp (B1) | Có khả năng hiểu các điểm chính của các chủ đề quen thuộc. |
| **9 - 10** | `B2` | Trung cấp (B2) | Tự tin giao tiếp và hiểu các nội dung phức tạp hơn. |
| **11 - 12** | `B3` | Tiền cao cấp (B3) | Có phản xạ tốt, chuẩn bị bước vào các nội dung chuyên sâu. |
| **13 - 14** | `C1` | Cao cấp (C1) | Hiểu được nhiều dạng văn bản dài và giao tiếp lưu loát. |
| **15 - 16** | `C2` | Thành thạo (C2) | Sử dụng tiếng Anh tự nhiên như người bản xứ. |

---

## 3. QUY ĐỊNH VỀ CÁCH XẾP LOẠI TỪ VỰNG (VOCABULARY CEFR ADAPTATION)

Hệ thống Spaced Repetition (Leitner SRS) lọc từ vựng cá nhân hóa theo trình độ hiện tại của học viên thông qua hàm `filterWordsByLevel` nhằm tránh phân phối từ quá dễ gây nhàm chán hoặc quá khó gây nản lòng:

*   **Trình độ A1:** Chọn các từ thuộc danh mục cốt lõi `oxford` có **độ dài từ nhỏ hơn 6 ký tự** hoặc từ tự thêm trong sổ tay (`custom`).
*   **Trình độ A2:** Chọn các từ thuộc danh mục cốt lõi `oxford` có **độ dài từ 6 đến 8 ký tự** hoặc từ tự thêm (`custom`).
*   **Trình độ A3:** Chọn các từ thuộc danh mục cốt lõi `oxford` có **độ dài lớn hơn 8 ký tự** hoặc từ tự thêm (`custom`).
*   **Trình độ B1:** Lọc các từ thuộc danh mục `oxford` hoặc từ chỉ nhóm **Thành ngữ** `idioms` hoặc từ tự thêm (`custom`).
*   **Trình độ B2:** Chỉ hiển thị từ vựng thuộc danh mục **Học thuật nâng cao** `academic` hoặc từ tự thêm (`custom`).
*   **Trình độ B3:** Hiển thị kết hợp từ vựng **Học thuật** `academic`, **Thành ngữ** `idioms` hoặc từ tự thêm (`custom`).
*   **Trình độ C1:** Chỉ hiển thị các từ vựng thuộc nhóm **Chuyên ngành chuyên sâu** `spec-` (như `spec-tech` - công nghệ, `spec-science` - khoa học, `spec-social` - xã hội) hoặc từ tự thêm (`custom`).
*   **Trình độ C2:** Xem được toàn bộ tất cả mọi từ vựng hiện có trên hệ thống để nâng cao kỹ năng tối đa.

---

## 4. QUY ĐỊNH VỀ CÁCH XẾP LOẠI CÂU (SENTENCE SITUATION CATEGORIES)

Mẫu câu giao tiếp đàm thoại thực tế (`COMMUNICATIVE_SENTENCES`) không lọc theo thang điểm CEFR mà được phân loại khoa học theo **tình huống giao tiếp thực tế (Syllabus Categories)** để học viên học theo nhu cầu:
1.  `greeting` (Mẫu câu Chào hỏi, làm quen)
2.  `travel` (Mẫu câu Di chuyển, hỏi đường, sân bay)
3.  `dining` (Mẫu câu Ăn uống tại nhà hàng, gọi món, thanh toán)
4.  `work` (Mẫu câu Công việc, hội họp, đàm phán)
5.  `social` (Mẫu câu Giao tiếp xã hội, kết bạn, chia sẻ sở thích)

*   **Quy định xáo trộn sư phạm (Pedagogical Shuffle):** Để tối ưu hóa trải nghiệm học tập, khi tải danh sách câu giao tiếp:
    *   Hệ thống lọc ra nhóm câu chưa học (`unlearned`) và tiến hành **xáo trộn ngẫu nhiên hoàn toàn (Fisher-Yates Shuffle)** rồi đưa lên đầu danh sách để kích thích phản xạ mới.
    *   Các câu đã được học viên đánh dấu thuộc (`learned`) với nhãn *"Đã thuộc ✅"* sẽ được giữ nguyên trạng thái tĩnh và đẩy xuống cuối cùng danh sách.

---

## 5. QUY ĐỊNH VỀ CHUẨN NGỮ PHÁP (GRAMMAR DATABASE STANDARDS)

Toàn bộ các bài học ngữ pháp được tổ chức đồng nhất trong bộ dữ liệu `GRAMMAR_LESSONS` (`data/grammar-data.js`). Bất kỳ bài học ngữ pháp mới nào được thêm vào bắt buộc phải tuân thủ nghiêm ngặt cấu trúc thuộc tính sau:
*   `id`: Mã định danh duy nhất có tiền tố `gr-` (ví dụ: `gr-1`, `gr-2`...).
*   `title`: Tên bài học ngữ pháp bằng tiếng Việt (ví dụ: *Thì Hiện tại Đơn*).
*   `category`: Nhóm chủ điểm ngữ pháp (ví dụ: `tenses` - các thì, `clauses` - các loại mệnh đề...).
*   `description`: Định nghĩa khái niệm sư phạm ngắn gọn, súc tích.
*   `formula`: Công thức cấu trúc ngữ pháp chuẩn xác (ví dụ: `S + V(s/es) + O`).
*   `usage`: Mảng các trường hợp sử dụng cụ thể bằng tiếng Việt.
*   `examples`: Mảng các cặp câu ví dụ thực hành song ngữ trực quan dạng `{ en: "Câu tiếng Anh", vi: "Bản dịch tiếng Việt" }`.
*   `practice`: Mảng chứa các câu hỏi trắc nghiệm kiểm định bài học. Mỗi câu hỏi bắt buộc phải có đầy đủ:
    *   `q`: Câu hỏi tình huống tiếng Anh kèm gợi ý ngữ cảnh sư phạm rõ ràng (ví dụ: *Situation: Weekend hobbies. 'They ___ soccer...'*).
    *   `options`: Mảng gồm đúng **4 lựa chọn** đáp án.
    *   `answer`: Chỉ số index (0 đến 3) của đáp án chính xác trong mảng `options`.
    *   `explanation`: Lời giải thích ngữ pháp sư phạm chi tiết bằng tiếng Việt để học viên hiểu lý do chọn đáp án.

---

## 6. QUY ĐỊNH VỀ CÁCH TÍNH STREAK CHO HỌC VIÊN (DAILY STREAK)

Chỉ số Streak (chuỗi ngày học liên tục) được kiểm soát nghiêm ngặt qua hàm `checkAndUpdateStreak()` dựa trên múi giờ địa phương của thiết bị học viên:

*   **Học viên học nhiều lần trong cùng một ngày:**
    *   Nếu ngày học gần nhất (`state.lastStudyDate`) trùng với ngày hôm nay (`today = new Date().toDateString()`), chuỗi streak được **giữ nguyên không đổi**, hệ thống chỉ cập nhật UI hiển thị để tránh cộng dồn điểm streak vô lý.
*   **Học viên duy trì học liên tiếp:**
    *   Nếu ngày học gần nhất trùng với ngày hôm qua (`yesterday = new Date(Date.now() - 86400000).toDateString()`), hệ thống ghi nhận sự chăm chỉ: cộng dồn streak thêm 1 ngày (`state.streak += 1`), cập nhật `state.lastStudyDate` thành `today` và tiến hành đồng bộ hóa dữ liệu lên LocalStorage và Firebase.
*   **Học viên mới khởi tạo tài khoản:**
    *   Nếu là ngày học đầu tiên trong đời của học viên (`state.lastStudyDate === ''`), hệ thống kích hoạt streak ngày đầu tiên: đặt `state.streak = 1` và lưu ngày học gần nhất là `today`.
*   **Đứt mạch học tập (Reset Streak):**
    *   Nếu ngày học gần nhất trước đó xa hơn ngày hôm qua (học viên bỏ học từ 1 ngày trở lên), hệ thống tiến hành **phạt đứt chuỗi**: reset chỉ số streak về lại **1 ngày** để học viên xây dựng lại chuỗi streak mới từ ngày hôm nay.

---

## 7. QUY ĐỊNH VỀ CÁCH THƯỞNG ĐIỂM (GOLD STARS) CHO MỖI LOẠI BÀI HỌC

Hệ thống phần thưởng **Gold Stars ⭐** là cốt lõi của tính năng Gamification, giúp kích thích động lực học tập bền bỉ của học viên. Quy chuẩn thưởng sao cho từng hoạt động học tập được quy định chính xác như sau:

| Hoạt Động Học Tập | Số Sao Thưởng (Stars) | Điều Kiện Nhận Thưởng / Mô Tả Chi Tiết |
| :--- | :---: | :--- |
| **Học từ vựng qua Flashcards** | **+10 ⭐** | Hoàn thành ôn tập hết toàn bộ số lượng thẻ từ vựng có trong deck của phiên học hiện tại. |
| **Làm Trắc Nghiệm Từ Vựng** | **Tối đa +15 ⭐** | Công thức: `5 ⭐` (điểm cơ bản hoàn thành) + `(Số câu trả lời đúng * 1) ⭐`. Làm đúng 10/10 câu nhận trọn vẹn 15 sao (tránh lạm phát sao). |
| **Luyện Viết Đoạn Văn (Writing)** | **Dynamic Delta** | Áp dụng hệ thống thưởng sao dựa trên sự tiến bộ của bản thân vượt qua kỷ lục cũ (High Score Delta):<br>1. Điểm viết quy đổi ra sao: `stars = Math.round(Score / 2)` (Tối đa 50 sao cho bài viết đạt 100 điểm để tôn vinh chất xám).<br>2. Số sao thực nhận = `Math.max(0, newStars - prevStars)`. Học viên chỉ được nhận thêm sao khi điểm bài viết mới vượt qua điểm kỷ lục trước đó của chính họ ở chủ đề viết này. |
| **Học Bài Ngữ Pháp Mới** | **+10 ⭐** | Hoàn thành làm bài kiểm tra trắc nghiệm của bài học ngữ pháp đó lần đầu tiên để khuyến khích học sâu. |
| **Ôn Tập Bài Ngữ Pháp Cũ** | **+4 ⭐** | Học lại và làm bài trắc nghiệm của bài học ngữ pháp đã từng hoàn thành trước đó (củng cố trí nhớ dài hạn). |
| **Thuộc Câu Giao Tiếp Thực Tế** | **+1 ⭐** | Đánh dấu tích chọn "Đã thuộc ✅" cho một mẫu câu giao tiếp đàm thoại mới. |
| **Thêm Từ Vựng Vào Sổ Tay** | **+5 ⭐** | Nhập thủ công một từ vựng mới tự chọn kèm nghĩa vào Sổ tay từ vựng cá nhân (`customWords`). |
| **Hoàn Thành Nhiệm Vụ Ngày** | **+5 ⭐** hoặc **+10 ⭐** | Thực hiện thành công các mục tiêu học tập đề ra trong danh sách Checklist Roadmap hàng ngày (ví dụ: đạt 10/10 quiz học thuật thưởng +10 sao, ôn tập 15 thẻ flashcard thưởng +5 sao). |
| **Thi Đấu Đấu Trường (Arena)** | **+15 ⭐** | Đứng vị trí thứ nhất (Winner) hoặc solo luyện tập 1 mình hoàn thành 10 câu hỏi Arena để tăng tính cạnh tranh. |
| **Hòa Điểm Đấu Trường** | **+8 ⭐** | Đồng hạng nhất hoặc hòa điểm số cao nhất với người chơi khác trong phòng đấu Arena. |
| **Tham Gia Đấu Trường Khuyến Khích** | **+2 ⭐** | Chỉ số sao an ủi dành cho tất cả người chơi hoàn thành trận đấu Arena nhưng không đứng ở vị trí dẫn đầu. |
| **Luyện Dịch Đoạn Văn Xuất Sắc** | **+30 ⭐** | Đạt độ chính xác từ **80% trở lên** so với bản dịch chuẩn của câu chuyện/podcast (tôn vinh nỗ lực dịch thuật). |
| **Luyện Dịch Đoạn Văn Khá Tốt** | **+15 ⭐** | Đạt độ chính xác từ **50% đến dưới 80%** so với bản dịch mẫu. |
| **Thiết Lập Hồ Sơ Cá Nhân** | **+5 ⭐** | Cập nhật tên hiển thị hoặc thay đổi ảnh đại diện cá nhân lần đầu tiên. |
| **Đồng Bộ Ảnh Đại Diện Google** | **+2 ⭐** | Nhấn đồng bộ hóa lại ảnh đại diện chính chủ từ tài khoản Google của học viên. |

---

## 8. QUY TRÌNH SRS LẬP LỊCH ÔN TẬP PHÂN KỲ THÍCH ỨNG (LEITNER SRS ADAPTIVE SCHEDULING)

Quy trình quản lý các hộp Leitner (từ Hộp 1 đến Hộp 3) và cách tính thời gian ôn tập tiếp theo (`nextReview`) của một từ vựng được cài đặt trong hàm `handleFlashcardAction()` theo cơ chế thích ứng đường cong quên lãng như sau:

1.  **Nếu học viên trả lời SAI (Incorrect):**
    *   Hộp Leitner bị hạ ngay lập tức về **Hộp 1** (`box = 1`) (Hộp từ mới).
    *   Thời gian ôn tập tiếp theo được thiết lập là **ngay lập tức** (`nextReview = Date.now()`) để từ vựng xuất hiện lại liên tục trong các lượt học tiếp theo cho đến khi học thuộc.
2.  **Nếu học viên trả lời ĐÚNG (Correct):**
    *   Hộp Leitner được nâng thêm 1 cấp (tối đa là **Hộp 3** - Đã thuộc hoàn toàn).
    *   Thời gian ôn tập tiếp theo (`nextReview`) được kéo giãn ra dựa vào cấp độ hộp mới đạt được kết hợp với **Trình độ năng lực thích ứng (CEFR Level)** của học viên:
        *   **Học viên Sơ cấp (`A1`, `A2`, `A3`, `Beginner`):** Cần chu kỳ lặp lại dày đặc hơn để củng cố trí nhớ ngắn hạn:
            *   Đạt Hộp 2: Ôn tập lại sau **1.5 ngày** (`nextReview = Date.now() + 1.5 * 24 * 60 * 60 * 1000`).
            *   Đạt Hộp 3: Ôn tập lại sau **4 ngày** (`nextReview = Date.now() + 4 * 24 * 60 * 60 * 1000`).
        *   **Học viên Cao cấp (`C1`, `C2`, `Advanced`):** Khả năng ghi nhớ tốt hơn, chu kỳ lặp lại rộng hơn:
            *   Đạt Hộp 2: Ôn tập lại sau **5 ngày**.
            *   Đạt Hộp 3: Ôn tập lại sau **12 ngày**.
        *   **Học viên Trung cấp (Các trình độ còn lại):** Áp dụng khoảng cách tiêu chuẩn:
            *   Đạt Hộp 2: Ôn tập lại sau **3 ngày**.
            *   Đạt Hộp 3: Ôn tập lại sau **7 ngày**.
