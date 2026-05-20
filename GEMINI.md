# PROJECT CONTEXT & INSTRUCTIONS: LEARNINGENGLISH

Chào mừng bạn đến với dự án LearningEnglish. Đây là hướng dẫn thường trực dành cho AI Agent trong suốt phiên làm việc.

## 1. THÔNG TIN CHUNG VÀ CẤU TRÚC DỰ ÁN
*   **Công nghệ sử dụng:** HTML5, Vanilla CSS (CSS thuần, thiết kế Premium HSL, Glassmorphism, Responsive), Vanilla JS, Firebase (Authentication, Realtime Database/Firestore).
*   **Trạng thái môi trường:** Đang chạy local server.

## 2. QUY TẮC HỌC THUẬT BẮT BUỘC (ACADEMIC RULES & STANDARDS)
> [!IMPORTANT]
> Toàn bộ logic nghiệp vụ liên quan đến:
> *   Tính điểm kiểm tra & trắc nghiệm (Placement Test, Quiz, AI Essay Writing với chỉ số TTR, Connectors, Syntax, Integrity telemetry).
> *   Xếp loại học viên theo khung CEFR (A1 - C2).
> *   Phân loại từ vựng thích ứng Leitner SRS & chu kỳ ôn tập.
> *   Quy tắc tính streak ngày, phần thưởng Gold Stars ⭐ gamification.
> 
> Tất cả các quy tắc trên **bắt buộc** phải tuân thủ tuyệt đối theo chỉ dẫn tại:
> [academic_rules.md](file:///.rules/academic_rules.md)
> **Nghiêm cấm tự ý thay đổi các công thức toán học hoặc logic nghiệp vụ học thuật trừ khi được yêu cầu trực tiếp từ người dùng.**

## 3. CORE AGENT-SKILLS (PERSISTENT CONTEXT)
Trong mọi tác vụ lập trình và chỉnh sửa mã nguồn của dự án này, Agent phải tuân thủ nghiêm ngặt hai quy trình kỹ thuật cốt lõi sau:

### A. Quy trình Phát triển Gia tăng (Incremental Implementation)
*   **Nguyên tắc:** Tránh thực hiện các chỉnh sửa lớn, dàn trải.
*   **Workflow:**
    1.  Nghiên cứu kiến trúc hiện tại của `app.js`, `challenge.js`, `firebase-sync.js`.
    2.  Chia nhỏ tác vụ thành các phần việc cực nhỏ (ví dụ: sửa đổi Firestore sync trước, sau đó sửa UI, rồi mới đồng bộ star/streak).
    3.  Thực hiện thay đổi trên từng file, chạy thử nghiệm, kiểm tra log lỗi rồi mới đi tiếp bước sau.

### B. Đảm bảo chất lượng và Đánh giá mã nguồn (Code Review & Quality)
*   **Nguyên tắc:** Mỗi khi hoàn thành một đoạn code, phải tự đánh giá lại theo 5 trục chất lượng:
    1.  *Tính đúng đắn học thuật (Pedagogical Fidelity):* Có đúng công thức tính star/streak/essay không?
    2.  *Tính đồng bộ dữ liệu (Firebase Integrity):* Đổi tên đã đồng bộ sang bảng xếp hạng chưa? Có bị race condition không?
    3.  *Giao diện responsive:* Đã hiển thị đẹp mắt trên cả Mobile lẫn Desktop chưa?
    4.  *Độ sạch của code:* Không lặp code, đặt tên biến rõ nghĩa.
    5.  *Xử lý ngoại lệ:* Đã có khối try-catch cho các lệnh gọi mạng Firebase chưa?

---

## 4. ON-DEMAND SKILLS & REFERENCES
Khi thực hiện các phần việc chuyên sâu, Agent sẽ chủ động nạp thêm các kỹ năng chuyên môn từ hệ thống:
*   Để tối ưu hóa giao diện: `@skills/frontend-ui-engineering/SKILL.md` và tham khảo `@references/accessibility-checklist.md`.
*   Để giải quyết các bài toán Firebase phức tạp: `@skills/doubt-driven-development/SKILL.md` và `@skills/security-and-hardening/SKILL.md`.
*   Để xây dựng các ca kiểm thử: `@skills/test-driven-development/SKILL.md` và tham khảo `@references/testing-patterns.md`.
