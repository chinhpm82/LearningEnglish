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
        // Add cache-busting to ensure we get the latest JSON files with audioUrl
        const response = await fetch(`${filePath}?t=${new Date().getTime()}`, { cache: 'no-cache' });
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
    if (state.lastTestScore === 0 && !state.placementDismissed) {
        const banner = document.getElementById('placement-suggestion-banner');
        if (banner) banner.classList.remove('hidden');
    }
}

function dismissPlacementSuggestion() {
    state.placementDismissed = true;
    saveStatsToStorage();
    const banner = document.getElementById('placement-suggestion-banner');
    if (banner) banner.classList.add('hidden');
}

function openPlacementTestFromBanner() {
    const banner = document.getElementById('placement-suggestion-banner');
    if (banner) banner.classList.add('hidden');
    const modal = document.getElementById('placement-test-modal');
    if (modal) modal.classList.remove('hidden');
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
                if (q.audioUrl) {
                    if (window.currentPlacementAudio) {
                        window.currentPlacementAudio.pause();
                        window.currentPlacementAudio.currentTime = 0;
                    }
                    window.currentPlacementAudio = new Audio(q.audioUrl);
                    window.currentPlacementAudio.play().catch(e => {
                        console.warn('Failed to play MP3, falling back to TTS:', e);
                        speakEnglish(q.audioText);
                    });
                } else {
                    speakEnglish(q.audioText);
                }
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
    if (window.currentPlacementAudio) {
        window.currentPlacementAudio.pause();
        window.currentPlacementAudio.currentTime = 0;
    }
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

    // Calculate raw percentage
    const totalCorrect = ts.allResults.filter(r => r.isCorrect).length;
    const totalQuestions = ts.allResults.length;
    const rawPct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    // Blended score to prevent 1-question 100% inflation
    const finalPct = Math.round((weightedTotal + rawPct) / 2);

    // Get highest correct level with at least 2 correct answers (to avoid lucky guesses)
    // For C1/C2, we might only have 1 or 2 questions in an adaptive test, so we adjust:
    // Count correct answers by level
    const levelCounts = {};
    for (const result of ts.allResults) {
        if (result.isCorrect) {
            const level = result.level.toUpperCase();
            levelCounts[level] = (levelCounts[level] || 0) + 1;
        }
    }

    const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    let maxLevelIdx = 0;
    
    for (let i = levelOrder.length - 1; i >= 0; i--) {
        const lvl = levelOrder[i];
        if (levelCounts[lvl] && levelCounts[lvl] >= 2) {
            maxLevelIdx = i;
            break;
        } else if (levelCounts[lvl] && levelCounts[lvl] === 1 && i <= 2) {
             // allow A1, A2, B1 to be max level even with 1 correct
             if (i > maxLevelIdx) maxLevelIdx = i;
        } else if (levelCounts[lvl] && levelCounts[lvl] === 1 && ts.allResults.filter(r => r.level.toUpperCase() === lvl).length === 1) {
             // If there was ONLY 1 question of this level and they got it right, allow it
             if (i > maxLevelIdx) maxLevelIdx = i;
        }
    }
    
    const maxLevelReached = levelOrder[maxLevelIdx];

    // Determine final CEFR level based on adjusted Final Percentage
    let finalLevel = 'A1';
    if (finalPct >= 80 && maxLevelIdx >= 4) finalLevel = 'C2';
    else if (finalPct >= 70 && maxLevelIdx >= 4) finalLevel = 'C1';
    else if (finalPct >= 60 && maxLevelIdx >= 3) finalLevel = 'B2';
    else if (finalPct >= 45) finalLevel = 'B1';
    else if (finalPct >= 30) finalLevel = 'A2';
    else finalLevel = 'A1';

    // Log level milestone if level changed
    if (state.userLevel !== finalLevel) {
        if (typeof logActivity === 'function') {
            logActivity('milestone', `Đạt trình độ ${finalLevel} 🎓`, `Đã hoàn thành bài kiểm tra năng lực tiếng Anh và đạt chuẩn ${finalLevel}.`, 0);
        }
    }

    // Save to state (backward compatible)
    state.userLevel = finalLevel;
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
    document.getElementById('placement-weighted-result').textContent = `${finalPct}%`;
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