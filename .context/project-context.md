# LearningEnglish - Project Context

## Overview
English learning SPA deployed on GitHub Pages. No build system — serve directly HTML/CSS/JS.

## Tech Stack
- Frontend: HTML5, CSS3, Vanilla JavaScript (ES6+)
- Backend/Storage: Firebase/Firestore (sync), Local JSON fallback
- AI: Google Generative AI (`@google/generative-ai`)
- PWA: Service Worker (`sw.js`), Web Manifest
- Deployment: GitHub Pages (static)

## Project Structure
- `index.html` — Main entry
- `admin.html` — Admin panel
- `js/` — 20 JavaScript modules
- `json/` — Data files (vocabulary, grammar, placement tests)
- `json/placement/` — Placement test banks (listening/reading/grammar/writing x A1-C2)
- `audio/listening/` — MP3 files for placement test
- `podcasts/` — Podcast MP3 + SRT
- `scripts/` — Utility scripts
- `.rules/` — Academic rules (CEFR framework, placement flow, academic standards)
- `agents/` — AI personas (code-reviewer, security-auditor, test-engineer)
- `references/` — Checklists (accessibility, security, performance, testing, orchestration)

---

## Recent Changes (2026-07-11)

### ✅ Completed
1. **Placement test → opt-in banner** — No more forced modal on first visit. Dashboard shows a soft suggestion banner with "Bắt đầu" / "Để sau" buttons. (`placement.js`, `index.html`)
2. **quiz.js no longer overwrites userLevel** — Assessment mode only sets `lastTestScore`, not `userLevel`. Level authority stays with placement.js. (`quiz.js:267`)
3. **Streak never resets to 0** — Logic changed: any study day increments streak, regardless of gap. No more "reset to 1" on missed days. (`state.js:242-262`)
4. **Fisher-Yates shuffle everywhere** — Added `shuffleArray()` utility to `state.js`. Replaced biased `sort(() => 0.5 - Math.random())` in quiz.js, challenge.js, grammar.js, random-quiz.js, sentences.js.
5. **CEFR levels for grammar lessons** — Added `GRAMMAR_LEVEL_MAP` mapping gr-1→A1 through gr-21→C2. Level badges now display on lesson cards. (`grammar.js`)
6. **Sentences expanded to 250** — From 50 (5 categories × 10) to 250 (10 categories × 25). New categories: healthcare, shopping, entertainment, education, workplace. (`json/sentences-data.json`)
7. **reading.js → sentences.js** — Renamed file and updated HTML reference. (`js/sentences.js`, `index.html`)

---

## Academic Framework Summary

### CEFR Levels (8-level system)
| Score Range | Level | Name |
|:---:|:---:|:---|
| 0-2 | A1 | Sơ cấp |
| 3-4 | A2 | Sơ cấp |
| 5-6 | A3 | Tiền trung cấp |
| 7-8 | B1 | Trung cấp |
| 9-10 | B2 | Trung cấp |
| 11-12 | B3 | Tiền cao cấp |
| 13-14 | C1 | Cao cấp |
| 15-16 | C2 | Thành thạo |

### Placement Test (Adaptive 3-Phase)
- **Phase 1:** 4 câu B1 (all skills) → branch based on accuracy
- **Phase 2:** Rẽ nhánh (≥75% up, 40-75% stay, <40% down)
- **Phase 3:** Tiebreaker 2 câu nếu kết quả mơ hồ (30-70%)
- **Weighted scoring:** Listening 30%, Reading 30%, Grammar/Vocab 20%, Writing 20%
- **Capping:** Must get ≥2 correct at target level to claim it
- **Trigger:** Opt-in banner on dashboard (not forced modal)

### Vocabulary Quiz
- 10 MCQ per session, 3 distractors from same pool
- Assessment mode: balanced oxford/academic/idioms
- Stars: 5 base + 1 per correct (max 15)
- **Note:** Assessment does NOT override userLevel

### Writing Assessment (100 points)
- Length (25pts): 50-80w beginner, 80-120w intermediate, 100-150w advanced
- Vocabulary usage (25pts): 5pts per suggested word
- Lexical diversity TTR (20pts)
- Structural connectors (15pts)
- Syntax/capitalization (15pts)
- Integrity penalties: copy-paste, WPM, tab-switch, ChatGPT phrases

### SRS Flashcards (Leitner 3-box)
- Box 1 → Box 2 → Box 3 (mastered)
- CEFR-adaptive intervals:
  - A1-A3: 1.5 days (Box 2), 4 days (Box 3)
  - B1-B2: 3 days, 7 days
  - C1-C2: 5 days, 12 days
- Pool: 70% current level, 20% prev, 10% next

### Gamification
- Streak: daily, **never resets** (increments on each study day)
- Stars: earned per activity type (see academic_rules.md §7)
- Leaderboard: Firebase RTDB, streak + stars
- Arena: multiplayer quiz, 15s/question, +10/correct

---

## Module Status

### placement.js ✅
- 3-phase adaptive, 4 skills, weighted scoring
- Opt-in banner instead of forced modal
- Remaining gaps: no listening variety, writing is MCQ, Phase 3 weak

### flashcards.js ✅
- Leitner SRS, CEFR-adaptive intervals, pool weighting
- Remaining gaps: no "hard" option, Box 3 terminal, hardcoded counts

### quiz.js ✅ Fixed
- No longer overwrites userLevel
- Fisher-Yates shuffle
- Remaining gaps: no SRS integration, no C2 path, arbitrary speed thresholds

### writing.js ⚠️
- Remaining gaps: pure heuristic, limited grammar rules, raw TTR, weak ChatGPT detection

### grammar.js ✅ Fixed
- CEFR levels added (A1-C2 badges on lesson cards)
- Fisher-Yates shuffle
- Remaining gaps: no adaptive practice, no weak-point tracking

### sentences.js ✅ Fixed (renamed from reading.js)
- 250 sentences across 10 categories
- Fisher-Yates shuffle
- Remaining gaps: no CEFR levels, no SRS, no comprehension tests

### gamification.js ⚠️
- Remaining gaps: kitchen sink file, crude translation scoring

### challenge.js ⚠️ Fixed
- Fisher-Yates shuffle
- Remaining gaps: no CEFR matchmaking, fixed timer, no anti-cheat

---

## Remaining Known Issues

1. **No cross-module analytics** — writing errors, quiz failures, flashcard resets never correlated
2. **writing.js heuristic limits** — no AI/NLP, limited grammar rules, raw TTR
3. **challenge.js** — no CEFR matchmaking, fixed 15s timer for all difficulties
4. **gamification.js** — kitchen sink file (600 lines, 3 unrelated modules)
5. **Placement test bank thin** — only 85 questions total

---

## Academic Rules Reference Files
- `.rules/academic.md` — CEFR framework, test matrix, scoring methods
- `.rules/academic_rules.md` — Detailed pedagogical rules (grading, SRS, gamification, integrity)
- `.rules/placement-test-flow.md` — Full adaptive flowchart + algorithm + JSON schemas
- `agents/` — Code review personas (code-reviewer, security-auditor, test-engineer)
- `references/` — Checklists for accessibility, security, performance, testing, orchestration
