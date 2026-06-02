// --- RENDERING & UI SYNC ---
function getCEFRLevelDisplayName(level) {
    const map = {
        'A1': 'Sơ cấp (A1)',
        'A2': 'Sơ cấp (A2)',
        'B1': 'Trung cấp (B1)',
        'B2': 'Trung cấp (B2)',
        'C1': 'Cao cấp (C1)',
        'C2': 'Thành thạo (C2)'
    };
    return map[level] || 'Sơ cấp (A1)';
}

function filterWordsByLevel(allWords, level) {
    if (level === 'A1') {
        return allWords.filter(w => (w.category === 'oxford' && w.word.length < 6) || w.category === 'custom');
    } else if (level === 'A2') {
        return allWords.filter(w => (w.category === 'oxford' && w.word.length >= 6 && w.word.length <= 8) || w.category === 'custom');
    } else if (level === 'B1') {
        return allWords.filter(w => w.category === 'oxford' || w.category === 'idioms' || w.category === 'custom');
    } else if (level === 'B2') {
        return allWords.filter(w => w.category === 'academic' || w.category === 'custom');
    } else if (level === 'C1') {
        return allWords.filter(w => (w.category && w.category.startsWith('spec-')) || w.category === 'custom');
    } else {
        return allWords;
    }
}

function updateCEFRSkillsRadarBars(score, masteredVocab, totalVocab) {
    const stats = state.placementStats || { grammar: 0, reading: 0, vocab: 0, listening: 0 };
    
    // 1. Vocabulary Skill formula
    const rawVocabPct = totalVocab > 0 ? Math.round((masteredVocab / totalVocab) * 100) : 0;
    const baseVocabSeed = Math.round((stats.vocab / 4) * 100); // Sửa bug chia cho 8 thành chia cho 4 (vì stats.vocab tối đa là 4)
    const vocabPct = Math.min(100, Math.max(rawVocabPct, baseVocabSeed || 15));

    // 2. Grammar Skill formula
    const completedGrammarLessons = state.completedLessons ? state.completedLessons.length : 0;
    const rawGrammarPct = Math.round((completedGrammarLessons / 12) * 100);
    const baseGrammarSeed = Math.round((stats.grammar / 4) * 100);
    const grammarPct = Math.min(100, Math.max(rawGrammarPct, baseGrammarSeed || 15));

    // 3. Reading Skill formula
    const completedStories = state.stories_done ? state.stories_done.length : 0;
    const rawReadingPct = completedStories * 20; // 5 stories = 100%
    const baseReadingSeed = Math.round((stats.reading / 4) * 100);
    const readingPct = Math.min(100, Math.max(rawReadingPct, baseReadingSeed || 15));

    // 4. Listening Skill formula
    const completedSentences = state.completedSentences ? state.completedSentences.length : 0;
    const rawListeningPct = Math.round((completedSentences / 20) * 100);
    const baseListeningSeed = Math.round((stats.listening / 4) * 100);
    const listeningPct = Math.min(100, Math.max(rawListeningPct, baseListeningSeed || 15));

    // 5. Spoken & AI Essay formula
    // Áp dụng bộ lọc volume-weight để tránh việc mới làm 1 câu đúng đã nhảy vọt lên 100%
    const basePlacementSeed = Math.round((score / 16) * 100) || 15;
    const quizAccuracy = state.quizStats.totalAnswered > 0 ? (state.quizStats.correctAnswers / state.quizStats.totalAnswered * 100) : 0;
    // Cần trả lời tối thiểu 30 câu quiz đúng để đạt trọng số tối đa của phần trắc nghiệm
    const quizWeight = Math.min(1, state.quizStats.totalAnswered / 30);
    const quizFactor = quizAccuracy * quizWeight;
    
    // Kết hợp kết quả viết luận trung bình từ state.writingHighScores
    const essayScores = Object.values(state.writingHighScores || {});
    const averageEssayScore = essayScores.length > 0 ? Math.round(essayScores.reduce((a, b) => a + b, 0) / essayScores.length) : 0;
    
    // Tính toán điểm hỗn hợp: 60% từ quiz (có trọng số volume) + 40% từ trung bình viết luận
    const combinedFactor = Math.round(quizFactor * 0.6 + averageEssayScore * 0.4);
    const writingPct = Math.min(100, Math.max(basePlacementSeed, combinedFactor));

    // Render bars in DOM
    const barElements = {
        'vocab': { bar: 'dashboard-skill-bar-vocab', txt: 'dashboard-skill-vocab', val: vocabPct },
        'grammar': { bar: 'dashboard-skill-bar-grammar', txt: 'dashboard-skill-grammar', val: grammarPct },
        'reading': { bar: 'dashboard-skill-bar-reading', txt: 'dashboard-skill-reading', val: readingPct },
        'listening': { bar: 'dashboard-skill-bar-listening', txt: 'dashboard-skill-listening', val: listeningPct },
        'writing': { bar: 'dashboard-skill-bar-writing', txt: 'dashboard-skill-writing', val: writingPct }
    };

    Object.keys(barElements).forEach(key => {
        const item = barElements[key];
        const barEl = document.getElementById(item.bar);
        const txtEl = document.getElementById(item.txt);
        if (barEl) barEl.style.width = `${item.val}%`;
        if (txtEl) txtEl.textContent = `${item.val}%`;
    });
}

// --- ADAPTIVE PLACEMENT TEST ENGINE (v2 — Local JSON, 3-Phase) ---
let placementTestState = null;
let placementListeningPlayCount = 0;
const PLACEMENT_MAX_PLAYS = 3;
// Cache for loaded JSON question banks (avoids refetching)
const placementQuestionCache = {};

/**
 * Fetch questions for a specific skill + level from local JSON.
 * Caches results to avoid redundant network calls.
 */
async function fetchPlacementQuestions(skill, level) {
    const fileMap = {
        listening: `json/placement/listening-${level.toLowerCase()}.json`,
        reading: `json/placement/reading-${level.toLowerCase()}.json`,
        grammar_vocab: `json/placement/grammar-vocab-${level.toLowerCase()}.json`,
        writing: `json/placement/writing-placement.json`
    };
    const filePath = fileMap[skill];
    if (!filePath) return [];

    const cacheKey = `${skill}_${level}`;
    if (placementQuestionCache[cacheKey]) {
        return placementQuestionCache[cacheKey];
    }

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        placementQuestionCache[cacheKey] = data;
        return data;
    } catch (e) {
        console.warn(`Failed to load placement questions for ${skill}/${level}:`, e);
        return [];
    }
}

/**
 * Pick a random question from a pool, excluding already-used IDs.
 * For reading: returns a passage object with sub-questions.
 * For writing: filters by level.
 */
function pickRandomQuestion(pool, usedIds) {
    const available = pool.filter(q => !usedIds.includes(q.id));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}

/**
 * Build the question sequence for a given phase.
 * Phase config: { level, skills: [{ skill, level }] }
 */
async function buildPhaseQuestions(skillConfigs, usedIds) {
    const questions = [];
    for (const config of skillConfigs) {
        const pool = await fetchPlacementQuestions(config.skill, config.level);
        if (config.skill === 'reading') {
            // Pick a random passage, then flatten its sub-questions
            const passage = pickRandomQuestion(pool, usedIds);
            if (passage) {
                usedIds.push(passage.id);
                // Create individual question items from passage sub-questions
                for (const subQ of passage.questions) {
                    questions.push({
                        ...subQ,
                        _skill: 'reading',
                        _level: config.level,
                        _passage: passage.passage,
                        _passageId: passage.id
                    });
                }
            }
        } else if (config.skill === 'writing') {
            // Filter writing questions by level
            const levelPool = pool.filter(q => q.level.toUpperCase() === config.level.toUpperCase());
            const q = pickRandomQuestion(levelPool.length > 0 ? levelPool : pool, usedIds);
            if (q) {
                usedIds.push(q.id);
                questions.push({ ...q, _skill: 'writing', _level: config.level });
            }
        } else if (config.skill === 'listening') {
            const q = pickRandomQuestion(pool, usedIds);
            if (q) {
                usedIds.push(q.id);
                questions.push({ ...q, _skill: 'listening', _level: config.level });
            }
        } else {
            // grammar_vocab
            const q = pickRandomQuestion(pool, usedIds);
            if (q) {
                usedIds.push(q.id);
                questions.push({ ...q, _skill: 'grammar_vocab', _level: config.level });
            }
        }
    }
    return questions;
}

function triggerCEFRPlacementTestIfNew() {
    if (state.lastTestScore === 0) {
        const modal = document.getElementById('placement-test-modal');
        if (modal) modal.classList.remove('hidden');
    }
}

async function startPlacementTestQuiz() {
    document.getElementById('placement-intro-screen').classList.add('hidden');
    document.getElementById('placement-quiz-screen').classList.remove('hidden');
    document.getElementById('placement-result-screen').classList.add('hidden');

    // Show loading state
    const qTextEl = document.getElementById('placement-question-text');
    const optionsContainer = document.getElementById('placement-options-container');
    if (qTextEl) qTextEl.textContent = 'Đang tải bộ câu hỏi đánh giá...';
    if (optionsContainer) optionsContainer.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;width:100%;"><div class="spinner"></div></div>`;

    // Initialize test state
    placementTestState = {
        currentPhase: 1,
        currentLevel: 'B1',
        questionIndex: 0,
        questions: [],         // Flat array of current phase questions
        allResults: [],        // { questionId, skill, level, isCorrect }
        usedQuestionIds: [],
        phaseResults: [],      // Results for current phase only
        skillScores: {
            listening:     { correct: 0, total: 0 },
            reading:       { correct: 0, total: 0 },
            grammar_vocab: { correct: 0, total: 0 },
            writing:       { correct: 0, total: 0 }
        },
        startTime: Date.now()
    };

    // Build Phase 1 questions (B1 level across all 4 skills)
    const phase1Config = [
        { skill: 'grammar_vocab', level: 'B1' },
        { skill: 'listening', level: 'B1' },
        { skill: 'reading', level: 'B1' },
        { skill: 'writing', level: 'B1' }
    ];
    placementTestState.questions = await buildPhaseQuestions(phase1Config, placementTestState.usedQuestionIds);

    if (placementTestState.questions.length === 0) {
        qTextEl.textContent = '⚠️ Không tải được ngân hàng câu hỏi. Vui lòng kiểm tra kết nối và thử lại.';
        optionsContainer.innerHTML = '';
        return;
    }

    showPlacementQuestion();
}

function skipPlacementTestQuiz() {
    state.userLevel = 'A1';
    state.lastTestScore = 1; // Seed a small score so it doesn't pop up again
    state.placementStats = { grammar: 0, reading: 0, vocab: 0, listening: 0 };
    saveStatsToStorage();
    const modal = document.getElementById('placement-test-modal');
    if (modal) modal.classList.add('hidden');
    renderDashboard();
}

function showPlacementQuestion() {
    const ts = placementTestState;
    if (!ts || ts.questionIndex >= ts.questions.length) return;

    const q = ts.questions[ts.questionIndex];
    const totalAllQuestions = ts.allResults.length + ts.questions.length;
    const currentGlobalIndex = ts.allResults.length + ts.questionIndex;

    // Update section indicator
    const secIndicator = document.getElementById('placement-section-indicator');
    const sectionNames = {
        'grammar_vocab': '🔤 NGỮ PHÁP / TỪ VỰNG',
        'listening': '🎧 NGHE (LISTENING)',
        'reading': '📖 ĐỌC HIỂU (READING)',
        'writing': '✍️ VIẾT (WRITING)'
    };
    if (secIndicator) secIndicator.textContent = sectionNames[q._skill] || q._skill;

    // Update progress
    const progText = document.getElementById('placement-progress-text');
    const progBar = document.getElementById('placement-progress-bar');
    if (progText) progText.textContent = `Phase ${ts.currentPhase} — Câu ${ts.questionIndex + 1} / ${ts.questions.length}`;
    const progressPct = (currentGlobalIndex / Math.max(totalAllQuestions, 8)) * 100;
    if (progBar) progBar.style.width = `${Math.min(progressPct, 95)}%`;

    // Update level indicator
    const levelIndicator = document.getElementById('placement-level-indicator');
    if (levelIndicator) levelIndicator.textContent = `Mức ${q._level}`;

    // Update timer
    const timerText = document.getElementById('placement-timer-text');
    if (timerText) {
        const elapsed = Math.round((Date.now() - ts.startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        timerText.textContent = `⏱️ ${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // --- Skill-specific UI ---
    const listeningArea = document.getElementById('placement-listening-area');
    const readingArea = document.getElementById('placement-reading-area');

    // Hide all skill-specific areas first
    listeningArea.classList.add('hidden');
    readingArea.classList.add('hidden');

    if (q._skill === 'listening') {
        // Show listening play button area
        listeningArea.classList.remove('hidden');
        placementListeningPlayCount = 0;
        const playBtn = document.getElementById('placement-play-btn');
        const playRemaining = document.getElementById('placement-play-remaining');
        playBtn.disabled = false;
        playBtn.style.opacity = '1';
        playRemaining.textContent = `Còn ${PLACEMENT_MAX_PLAYS} lượt nghe`;

        // Remove old listener and attach new
        const newPlayBtn = playBtn.cloneNode(true);
        playBtn.parentNode.replaceChild(newPlayBtn, playBtn);
        newPlayBtn.addEventListener('click', () => {
            if (placementListeningPlayCount < PLACEMENT_MAX_PLAYS) {
                speakEnglish(q.audioText);
                placementListeningPlayCount++;
                const remaining = PLACEMENT_MAX_PLAYS - placementListeningPlayCount;
                const remEl = document.getElementById('placement-play-remaining');
                if (remEl) remEl.textContent = remaining > 0 ? `Còn ${remaining} lượt nghe` : 'Đã hết lượt nghe';
                if (remaining === 0) {
                    newPlayBtn.disabled = true;
                    newPlayBtn.style.opacity = '0.5';
                }
            }
        });
    } else if (q._skill === 'reading' && q._passage) {
        // Show reading passage area
        readingArea.classList.remove('hidden');
        document.getElementById('placement-passage-text').textContent = q._passage;
    }

    // Show question text
    const qTextEl = document.getElementById('placement-question-text');
    if (qTextEl) qTextEl.textContent = q.question;

    // Build options
    const optionsContainer = document.getElementById('placement-options-container');
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.style.cssText = 'width:100%;text-align:left;padding:14px 18px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:var(--text-main);font-size:14px;cursor:pointer;transition:all 0.2s ease;';
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(255,255,255,0.06)';
                btn.style.borderColor = 'var(--primary)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(255,255,255,0.03)';
                btn.style.borderColor = 'rgba(255,255,255,0.08)';
            });
            btn.textContent = opt;
            btn.addEventListener('click', () => submitPlacementAnswer(idx));
            optionsContainer.appendChild(btn);
        });
    }
}

function submitPlacementAnswer(selectedIdx) {
    const ts = placementTestState;
    const q = ts.questions[ts.questionIndex];
    const isCorrect = selectedIdx === q.answer;

    // Record result
    const result = {
        questionId: q.id,
        skill: q._skill,
        level: q._level,
        isCorrect: isCorrect
    };
    ts.phaseResults.push(result);
    ts.allResults.push(result);

    // Update skill scores
    const skillScore = ts.skillScores[q._skill];
    if (skillScore) {
        skillScore.total++;
        if (isCorrect) skillScore.correct++;
    }

    ts.questionIndex++;
    if (ts.questionIndex < ts.questions.length) {
        showPlacementQuestion();
    } else {
        processPlacementPhaseEnd();
    }
}

async function processPlacementPhaseEnd() {
    const ts = placementTestState;
    const phaseCorrect = ts.phaseResults.filter(r => r.isCorrect).length;
    const phaseTotal = ts.phaseResults.length;
    const accuracy = phaseTotal > 0 ? phaseCorrect / phaseTotal : 0;

    if (ts.currentPhase === 1) {
        // Phase 1 complete → determine Phase 2 direction
        ts.currentPhase = 2;
        ts.questionIndex = 0;
        ts.phaseResults = [];

        let phase2Config;
        if (accuracy >= 0.75) {
            // Strong → test harder (B2 + C1)
            ts.currentLevel = 'B2';
            phase2Config = [
                { skill: 'grammar_vocab', level: 'B2' },
                { skill: 'listening', level: 'C1' },
                { skill: 'reading', level: 'B2' },
                { skill: 'writing', level: 'C1' }
            ];
        } else if (accuracy >= 0.40) {
            // Medium → test slightly lower (A2 + B1)
            ts.currentLevel = 'A2';
            phase2Config = [
                { skill: 'grammar_vocab', level: 'A2' },
                { skill: 'listening', level: 'B1' },
                { skill: 'reading', level: 'A2' },
                { skill: 'writing', level: 'B1' }
            ];
        } else {
            // Weak → test basic (A1 + A2)
            ts.currentLevel = 'A1';
            phase2Config = [
                { skill: 'grammar_vocab', level: 'A1' },
                { skill: 'listening', level: 'A1' },
                { skill: 'reading', level: 'A1' },
                { skill: 'writing', level: 'A2' }
            ];
        }

        // Show branching animation
        const secIndicator = document.getElementById('placement-section-indicator');
        if (secIndicator) secIndicator.innerHTML = '<span style="color:var(--primary)">🤖 AI Đang Phân Tích & Rẽ Nhánh...</span>';
        const qTextEl = document.getElementById('placement-question-text');
        if (qTextEl) qTextEl.textContent = `Vòng 1: ${phaseCorrect}/${phaseTotal} đúng (${Math.round(accuracy * 100)}%). Đang điều chỉnh độ khó...`;
        document.getElementById('placement-options-container').innerHTML = '';
        document.getElementById('placement-listening-area').classList.add('hidden');
        document.getElementById('placement-reading-area').classList.add('hidden');

        // Build Phase 2 questions
        ts.questions = await buildPhaseQuestions(phase2Config, ts.usedQuestionIds);

        setTimeout(() => { showPlacementQuestion(); }, 1500);

    } else if (ts.currentPhase === 2) {
        // Phase 2 complete → check if Phase 3 is needed
        const phase2Accuracy = phaseTotal > 0 ? phaseCorrect / phaseTotal : 0;

        if (phase2Accuracy > 0.3 && phase2Accuracy < 0.7) {
            // Ambiguous result → need Phase 3 (2 extra questions targeting weakest skill)
            ts.currentPhase = 3;
            ts.questionIndex = 0;
            ts.phaseResults = [];

            // Find weakest skill
            let weakestSkill = 'grammar_vocab';
            let lowestAccuracy = 1;
            for (const [skill, scores] of Object.entries(ts.skillScores)) {
                if (scores.total > 0) {
                    const acc = scores.correct / scores.total;
                    if (acc < lowestAccuracy) {
                        lowestAccuracy = acc;
                        weakestSkill = skill;
                    }
                }
            }

            // Determine level for Phase 3 based on overall trajectory
            const overallCorrect = ts.allResults.filter(r => r.isCorrect).length;
            const overallTotal = ts.allResults.length;
            const overallAcc = overallTotal > 0 ? overallCorrect / overallTotal : 0;
            let phase3Level = overallAcc >= 0.6 ? 'B2' : overallAcc >= 0.4 ? 'B1' : 'A2';

            const phase3Config = [
                { skill: weakestSkill, level: phase3Level },
                { skill: weakestSkill, level: phase3Level }
            ];

            const secIndicator = document.getElementById('placement-section-indicator');
            if (secIndicator) secIndicator.innerHTML = '<span style="color:var(--accent)">🔍 Xác nhận kết quả (2 câu bổ sung)...</span>';
            const qTextEl = document.getElementById('placement-question-text');
            if (qTextEl) qTextEl.textContent = `Kết quả chưa rõ ràng. Thêm 2 câu xác nhận về ${sectionDisplayName(weakestSkill)}...`;
            document.getElementById('placement-options-container').innerHTML = '';
            document.getElementById('placement-listening-area').classList.add('hidden');
            document.getElementById('placement-reading-area').classList.add('hidden');

            ts.questions = await buildPhaseQuestions(phase3Config, ts.usedQuestionIds);
            setTimeout(() => { showPlacementQuestion(); }, 1200);

        } else {
            // Clear result → finish
            finishPlacementTest();
        }
    } else {
        // Phase 3 complete → finish
        finishPlacementTest();
    }
}

function sectionDisplayName(skill) {
    const names = {
        'listening': 'Nghe',
        'reading': 'Đọc hiểu',
        'grammar_vocab': 'Ngữ pháp/Từ vựng',
        'writing': 'Viết'
    };
    return names[skill] || skill;
}

function finishPlacementTest() {
    const ts = placementTestState;
    const ss = ts.skillScores;

    // Calculate sub-scores (0-100)
    const calcPct = (s) => s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
    const listeningPct = calcPct(ss.listening);
    const readingPct = calcPct(ss.reading);
    const grammarPct = calcPct(ss.grammar_vocab);
    const writingPct = calcPct(ss.writing);

    // Weighted total score
    const weightedTotal = Math.round(
        (listeningPct * 0.30) + (readingPct * 0.30) +
        (grammarPct * 0.20) + (writingPct * 0.20)
    );

    // Get highest correct level
    const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    let maxLevelIdx = 0;
    for (const result of ts.allResults) {
        if (result.isCorrect) {
            const idx = levelOrder.indexOf(result.level.toUpperCase());
            if (idx > maxLevelIdx) maxLevelIdx = idx;
        }
    }
    const maxLevelReached = levelOrder[maxLevelIdx];

    // Determine final CEFR level
    let finalLevel = 'A1';
    if (weightedTotal >= 85 && maxLevelIdx >= 4) finalLevel = 'C2';
    else if (weightedTotal >= 75 && maxLevelIdx >= 4) finalLevel = 'C1';
    else if (weightedTotal >= 65 && maxLevelIdx >= 3) finalLevel = 'B2';
    else if (weightedTotal >= 55 && maxLevelIdx >= 2) finalLevel = 'B1';
    else if (weightedTotal >= 45 && maxLevelIdx >= 1) finalLevel = 'A2';
    else finalLevel = 'A1';

    // Save to state (backward compatible)
    state.userLevel = finalLevel;
    const totalCorrect = ts.allResults.filter(r => r.isCorrect).length;
    const totalQuestions = ts.allResults.length;
    state.lastTestScore = Math.round((totalCorrect / totalQuestions) * 16); // Map to /16 for UI compat
    state.placementStats = {
        grammar: Math.round((grammarPct / 100) * 4),
        reading: Math.round((readingPct / 100) * 4),
        vocab: Math.round((grammarPct / 100) * 4),
        listening: Math.round((listeningPct / 100) * 4)
    };
    saveStatsToStorage();

    // Show Results Screen
    document.getElementById('placement-intro-screen').classList.add('hidden');
    document.getElementById('placement-quiz-screen').classList.add('hidden');
    document.getElementById('placement-result-screen').classList.remove('hidden');

    // Populate results
    document.getElementById('placement-score-result').textContent = `${totalCorrect} / ${totalQuestions}`;
    document.getElementById('placement-weighted-result').textContent = `${weightedTotal}%`;
    document.getElementById('placement-level-result').textContent = finalLevel;

    // Skill breakdown bars
    document.getElementById('breakdown-listening').textContent = `${listeningPct}%`;
    document.getElementById('bar-listening').style.width = `${listeningPct}%`;
    document.getElementById('breakdown-reading').textContent = `${readingPct}%`;
    document.getElementById('bar-reading').style.width = `${readingPct}%`;
    document.getElementById('breakdown-grammar').textContent = `${grammarPct}%`;
    document.getElementById('bar-grammar').style.width = `${grammarPct}%`;
    document.getElementById('breakdown-vocab').textContent = `${writingPct}%`;
    document.getElementById('bar-vocab').style.width = `${writingPct}%`;

    // AI Feedback
    const feedbackEl = document.getElementById('placement-feedback-text');
    if (feedbackEl) {
        const strongSkill = [
            { name: 'Nghe', pct: listeningPct },
            { name: 'Đọc hiểu', pct: readingPct },
            { name: 'Ngữ pháp', pct: grammarPct },
            { name: 'Viết', pct: writingPct }
        ].sort((a, b) => b.pct - a.pct);

        const best = strongSkill[0];
        const worst = strongSkill[strongSkill.length - 1];
        feedbackEl.textContent = `💡 Kỹ năng ${best.name} của bạn rất tốt (${best.pct}%)! Hãy tập trung cải thiện kỹ năng ${worst.name} (${worst.pct}%) để nâng trình độ lên ${levelOrder[Math.min(maxLevelIdx + 1, 5)]}.`;
    }

    // Progress bar to 100%
    const progBar = document.getElementById('placement-progress-bar');
    if (progBar) progBar.style.width = '100%';
}

function closePlacementTestModal() {
    const modal = document.getElementById('placement-test-modal');
    if (modal) modal.classList.add('hidden');
    renderDashboard();
}

function renderDashboard() {
    // Proactively check if placement test needs to be triggered
    triggerCEFRPlacementTestIfNew();

    // Update Gold Stars counter
    const starsCountEl = document.getElementById('dashboard-stars-count');
    if (starsCountEl) {
        starsCountEl.textContent = state.stars;
    }

    // Update dynamic welcome greeting
    const welcomeUserEl = document.getElementById('welcome-username');
    if (welcomeUserEl) {
        if (isCloudMode) {
            welcomeUserEl.textContent = state.displayName ? state.displayName.split(' ')[0] : 'Học viên';
        } else {
            welcomeUserEl.textContent = 'Khách';
        }
    }

    // Update Private Assessment & Level (Confidential display for current student only)
    const level = state.userLevel || 'A1';
    const score = state.lastTestScore !== undefined ? state.lastTestScore : 0;
    
    const levelNameShort = getCEFRLevelDisplayName(level);
    
    const assessmentValEl = document.getElementById('dashboard-assessment-val');
    const assessmentLevelEl = document.getElementById('dashboard-assessment-level');
    if (assessmentValEl) assessmentValEl.textContent = `${score}/16`;
    if (assessmentLevelEl) assessmentLevelEl.textContent = `Trình độ: ${levelNameShort}`;
    
    const profileLevelText = document.getElementById('user-private-level-text');
    if (profileLevelText) {
        profileLevelText.textContent = `${levelNameShort} (${score}/16)`;
    }

    // Group all words (built-in + custom)
    const allWords = [...state.vocabulary, ...state.customWords];
    
    // Filter syllabus words based on student's current level
    const levelWords = filterWordsByLevel(allWords, level);

    // Bảng từ vựng hiển thị thống kê: Bao gồm tất cả các từ thuộc level hiện tại VÀ các từ đã học (box > 1) từ mọi trình độ trước đó!
    // Điều này giúp giữ vững lịch sử học tập (Lịch sử học từ vựng vẫn đếm dựa trên các từ cũ)
    const activeDashboardPoolMap = new Map();
    levelWords.forEach(w => activeDashboardPoolMap.set(w.id, w));
    allWords.forEach(w => {
        if (w.box > 1) {
            activeDashboardPoolMap.set(w.id, w);
        }
    });
    const activeDashboardPool = Array.from(activeDashboardPoolMap.values());

    // TỐI ƯU HÓA HIỆU NĂNG: Duyệt mảng 1 lần duy nhất để đếm các hộp Leitner và số lượng từ cần ôn tập
    const now = Date.now();
    const poolSize = activeDashboardPool.length;
    const displayTotalWordsCount = (poolSize < 500 && window.ACADEMIC_TOTAL) ? window.ACADEMIC_TOTAL : poolSize;
    let masteredCount = 0;
    let learningCount = 0;
    let newCount = 0;
    let reviewCount = 0;

    for (let i = 0; i < poolSize; i++) {
        const w = activeDashboardPool[i];
        if (w.box === 3) {
            masteredCount++;
        } else {
            if (w.box === 2) learningCount++;
            else if (w.box === 1) newCount++;
            
            if (w.nextReview <= now) {
                reviewCount++;
            }
        }
    }

    // Update Text Elements
    document.getElementById('stats-total-words').textContent = displayTotalWordsCount;
    document.getElementById('stats-learned').textContent = masteredCount;
    document.getElementById('stats-review').textContent = reviewCount;
    document.getElementById('streak-count-val').textContent = state.streak;

    // Calculate Quiz accuracy
    let accuracyText = '0%';
    if (state.quizStats.totalAnswered > 0) {
        const accPct = Math.round((state.quizStats.correctAnswers / state.quizStats.totalAnswered) * 100);
        accuracyText = `${accPct}%`;
    }
    document.getElementById('stats-accuracy').textContent = accuracyText;

    // Update Progress Circle Dashoffset
    const circle = document.getElementById('progress-circle-fg');
    const pctText = document.getElementById('progress-percentage-val');
    const legendMastered = document.getElementById('legend-mastered');
    const legendLearning = document.getElementById('legend-learning');
    const legendNew = document.getElementById('legend-new');

    legendMastered.textContent = masteredCount;
    legendLearning.textContent = learningCount;
    legendNew.textContent = newCount;

    // Compute progress based on weights: Box 3 = 100%, Box 2 = 50%, Box 1 = 0%
    let progressPct = 0;
    if (displayTotalWordsCount > 0) {
        const weightedSum = (masteredCount * 100) + (learningCount * 50);
        progressPct = Math.round(weightedSum / displayTotalWordsCount);
    }

    pctText.textContent = `${progressPct}%`;
    
    // Circle radius is 54, circumference is 2 * Math.PI * 54 = ~339.3
    const circumference = 2 * Math.PI * 54;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    const offset = circumference - (progressPct / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // --- UPDATE CEFR SKILL RADAR BARS ---
    updateCEFRSkillsRadarBars(score, masteredCount, displayTotalWordsCount);

    // Render "Word of the Day"
    renderWordOfTheDay();

    // Render Dynamic Learning Roadmap
    renderRoadmap();
}

// Generate random "Word of the Day"
async function renderWordOfTheDay(forceRefresh = false) {
    const allWords = [...state.vocabulary, ...state.customWords];
    if (allWords.length === 0) return;

    const level = state.userLevel || 'A1';
    let levelWords = filterWordsByLevel(allWords, level);

    if (levelWords.length === 0) levelWords = allWords; // Fallback

    const todayStr = new Date().toLocaleDateString('en-US');
    let storedWotdData = null;
    try {
        storedWotdData = JSON.parse(localStorage.getItem('le_wotd_data') || 'null');
    } catch (e) {
        storedWotdData = null;
    }

    if (forceRefresh || !state.currentWotd || !storedWotdData || storedWotdData.date !== todayStr) {
        const randomIndex = Math.floor(Math.random() * levelWords.length);
        state.currentWotd = levelWords[randomIndex];
        localStorage.setItem('le_wotd_data', JSON.stringify({
            date: todayStr,
            wordId: state.currentWotd.id
        }));
    } else if (storedWotdData && storedWotdData.date === todayStr && !state.currentWotd) {
        const foundWord = allWords.find(w => w.id === storedWotdData.wordId);
        state.currentWotd = foundWord || levelWords[Math.floor(Math.random() * levelWords.length)];
    }

    const wotdIndex = state.currentWotd;
    if (!wotdIndex) return;

    // Fetch full word details on-demand
    const wotd = await LearningDB.getFullWordData(wotdIndex.id);
    if (!wotd) {
        console.warn("Could not load details for Word of the Day:", wotdIndex);
        return;
    }

    document.getElementById('wotd-word').textContent = wotd.word;
    document.getElementById('wotd-type').textContent = wotd.type || '';
    document.getElementById('wotd-ipa').textContent = wotd.ipa || '';
    document.getElementById('wotd-meaning').textContent = wotd.meaning || '';
    document.getElementById('wotd-example-en').textContent = wotd.example ? `"${wotd.example}"` : '';
    document.getElementById('wotd-example-vi').textContent = wotd.example_vi ? `"${wotd.example_vi}"` : '';

    // Attach click to voice
    const voiceBtn = document.getElementById('wotd-speak-btn');
    if (voiceBtn) {
        // Remove old listeners
        const newBtn = voiceBtn.cloneNode(true);
        voiceBtn.parentNode.replaceChild(newBtn, voiceBtn);
        newBtn.addEventListener('click', () => speakEnglish(wotd.word));
    }
}

