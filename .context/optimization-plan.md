# LearningEnglish - Kế Hoạch Tối Ưu

> Cập nhật: 2026-07-11

---

## Trạng Thái Thực Hiện

| # | Task | Trạng Thái | Chi tiết |
|---|---|:---:|---|
| 1 | Bỏ forced popup placement test → opt-in banner | ✅ | `placement.js`, `index.html` — banner với "Bắt đầu" / "Để sau" |
| 2 | Sửa quiz.js không ghi đè userLevel | ✅ | `quiz.js:267` — removed `state.userLevel = level` |
| 3 | Mở rộng sentences-data.json ≥200 câu | ✅ | 250 câu, 10 categories × 25 |
| 4 | Fisher-Yates shuffle cho quiz/challenge/grammar | ✅ | `shuffleArray()` utility + all biased shuffles replaced |
| 5 | Thêm CEFR levels cho grammar lessons | ✅ | `GRAMMAR_LEVEL_MAP` + badges on lesson cards |
| 6 | Đổi tên reading.js → sentences.js | ✅ | File renamed + HTML reference updated |
| 7 | Streak không reset về 0 | ✅ | `state.js` — always increments on study day |

---

## Còn Lại (Chưa Làm)

| # | Task | Ưu Tiên | Ghi chú |
|---|---|:---:|---|
| 1 | Thêm CEFR levels cho sentences | TRUNG | Hiện sentences chưa có level field |
| 2 | ~~Mở rộng placement test bank~~ | ✅ | Đã mở rộng: 85 → 252 câu |
| 3 | Sửa vocabulary-data.json casing | THẤP | Inconsistent `A1` vs `a1` |
| 4 | Loại bỏ synthetic filler sentences | THẤP | "We value your Xness" patterns |
| 5 | Thêm adaptive practice cho grammar | TRUNG | Hiện calendar-based recommendation |
| 6 | Cross-module analytics | CAO | Writing errors, quiz failures, flashcard resets |
| 7 | writing.js AI integration | CAO | Hiện pure heuristic |
| 8 | challenge.js CEFR matchmaking | TRUNG | Hiện random pairing |
| 9 | Mở rộng listening placement bank | THẤP | Cần audio files — làm sau |

---

## Files Đã Sửa

| File | Thay Đổi |
|---|---|
| `js/state.js` | Thêm `shuffleArray()`, sửa streak logic (không reset) |
| `js/placement.js` | `triggerCEFRPlacementTestIfNew()` → banner opt-in |
| `js/quiz.js` | Bỏ `state.userLevel = level`, Fisher-Yates shuffle |
| `js/grammar.js` | Thêm `GRAMMAR_LEVEL_MAP`, level badges, Fisher-Yates |
| `js/challenge.js` | Fisher-Yates shuffle (7 vị trí) |
| `js/random-quiz.js` | Fisher-Yates shuffle (2 vị trí) |
| `js/sentences.js` | Đổi tên từ reading.js, Fisher-Yates shuffle |
| `index.html` | Thêm placement suggestion banner, cập nhật script ref |
| `json/sentences-data.json` | Mở rộng từ 50 → 250 câu (10 categories) |
