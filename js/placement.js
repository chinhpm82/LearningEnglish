// --- ADAPTIVE PLACEMENT TEST ENGINE (Backend-powered) ---
let placementTestState = null;
let placementListeningPlayCount = 0;
const PLACEMENT_MAX_PLAYS = 3;

/**
 * Fetch questions from backend for a specific skill type.
 */
async function fetchPlacementQuestions(skill, count) {
    try {
        if (window.ApiClient && window.ApiClient.isLoggedIn()) {
            const data = await window.ApiClient.generatePlacement(skill, count);
            return data.data || [];
        }
    } catch (e) {
        console.warn(`Failed to load placement questions for ${skill}:`, e);
    }
    return [];
}

/**
 * Build the question sequence for a given phase using backend API.
 */
async function buildPhaseQuestions(skillConfigs) {
    const questions = [];
    for (const config of skillConfigs) {
        const pool = await fetchPlacementQuestions(config.skill, config.count || 1);
        for (const q of pool) {
            questions.push({
                ...q,
                _skill: config.skill,
                _level: config.level || q.level
            });
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

    const qTextEl = document.getElementById('placement-question-text');
    const optionsContainer = document.getElementById('placement-options-container');
    if (qTextEl) qTextEl.textContent = 'Đang tải bộ câu hỏi đánh giá...';
    if (optionsContainer) optionsContainer.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;width:100%;"><div class="spinner"></div></div>`;

    placementTestState = {
        currentPhase: 1,
        currentLevel: 'B1',
        questionIndex: 0,
        questions: [],
        allResults: [],
        allAnswers: [],     // For backend submission
        phaseResults: [],
        skillScores: {
            listening:     { correct: 0, total: 0 },
            reading:       { correct: 0, total: 0 },
            grammar_vocab: { correct: 0, total: 0 },
            writing:       { correct: 0, total: 0 }
        },
        startTime: Date.now()
    };

    // Phase 1: B1 level across all 4 skills (1 question each)
    const phase1Config = [
        { skill: 'grammar-vocab', level: 'B1', count: 1 },
        { skill: 'listening', level: 'B1', count: 1 },
        { skill: 'reading', level: 'B1', count: 1 },
        { skill: 'writing', level: 'B1', count: 1 }
    ];
    placementTestState.questions = await buildPhaseQuestions(phase1Config);

    if (placementTestState.questions.length === 0) {
        qTextEl.textContent = '⚠️ Không tải được ngân hàng câu hỏi. Vui lòng kiểm tra kết nối và thử lại.';
        optionsContainer.innerHTML = '';
        return;
    }

    showPlacementQuestion();
}

function skipPlacementTestQuiz() {
    state.userLevel = 'A1';
    state.lastTestScore = 1;
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

    const secIndicator = document.getElementById('placement-section-indicator');
    const sectionNames = {
        'grammar-vocab': '🔤 NGỮ PHÁP / TỪ VỰNG',
        'grammar_vocab': '🔤 NGỮ PHÁP / TỪ VỰNG',
        'listening': '🎧 NGHE (LISTENING)',
        'reading': '📖 ĐỌC HIỂU (READING)',
        'writing': '✍️ VIẾT (WRITING)'
    };
    if (secIndicator) secIndicator.textContent = sectionNames[q._skill] || q._skill;

    const progText = document.getElementById('placement-progress-text');
    const progBar = document.getElementById('placement-progress-bar');
    if (progText) progText.textContent = `Phase ${ts.currentPhase} — Câu ${ts.questionIndex + 1} / ${ts.questions.length}`;
    const progressPct = (currentGlobalIndex / Math.max(totalAllQuestions, 8)) * 100;
    if (progBar) progBar.style.width = `${Math.min(progressPct, 95)}%`;

    const levelIndicator = document.getElementById('placement-level-indicator');
    if (levelIndicator) levelIndicator.textContent = `Mức ${(q._level || q.level || '').toUpperCase()}`;

    const timerText = document.getElementById('placement-timer-text');
    if (timerText) {
        const elapsed = Math.round((Date.now() - ts.startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        timerText.textContent = `⏱️ ${mins}:${secs.toString().padStart(2, '0')}`;
    }

    const listeningArea = document.getElementById('placement-listening-area');
    const readingArea = document.getElementById('placement-reading-area');

    listeningArea.classList.add('hidden');
    readingArea.classList.add('hidden');

    if (q._skill === 'listening') {
        listeningArea.classList.remove('hidden');
        placementListeningPlayCount = 0;
        const playBtn = document.getElementById('placement-play-btn');
        const playRemaining = document.getElementById('placement-play-remaining');
        playBtn.disabled = false;
        playBtn.style.opacity = '1';
        playRemaining.textContent = `Còn ${PLACEMENT_MAX_PLAYS} lượt nghe`;

        const newPlayBtn = playBtn.cloneNode(true);
        playBtn.parentNode.replaceChild(newPlayBtn, playBtn);
        newPlayBtn.addEventListener('click', () => {
            if (placementListeningPlayCount < PLACEMENT_MAX_PLAYS) {
                if (q.audioUrl || q.audio_url) {
                    if (window.currentPlacementAudio) {
                        window.currentPlacementAudio.pause();
                        window.currentPlacementAudio.currentTime = 0;
                    }
                    window.currentPlacementAudio = new Audio(q.audioUrl || q.audio_url);
                    window.currentPlacementAudio.play().catch(e => {
                        console.warn('Failed to play MP3, falling back to TTS:', e);
                        speakEnglish(q.audioText || q.audio_text);
                    });
                } else {
                    speakEnglish(q.audioText || q.audio_text);
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
    } else if (q._skill === 'reading' && q.passage) {
        readingArea.classList.remove('hidden');
        document.getElementById('placement-passage-text').textContent = q.passage;
    }

    const qTextEl = document.getElementById('placement-question-text');
    if (qTextEl) qTextEl.textContent = q.question;

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

    const result = {
        questionId: q.id,
        skill: q._skill,
        level: q._level || q.level,
        isCorrect: isCorrect
    };
    ts.phaseResults.push(result);
    ts.allResults.push(result);

    // Store answer for backend submission
    ts.allAnswers.push({ questionId: q.id, selected: selectedIdx });

    const skillKey = q._skill === 'grammar-vocab' ? 'grammar_vocab' : q._skill;
    const skillScore = ts.skillScores[skillKey];
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
        ts.currentPhase = 2;
        ts.questionIndex = 0;
        ts.phaseResults = [];

        let phase2Config;
        if (accuracy >= 0.75) {
            ts.currentLevel = 'B2';
            phase2Config = [
                { skill: 'grammar-vocab', level: 'B2', count: 1 },
                { skill: 'listening', level: 'C1', count: 1 },
                { skill: 'reading', level: 'B2', count: 1 },
                { skill: 'writing', level: 'C1', count: 1 }
            ];
        } else if (accuracy >= 0.40) {
            ts.currentLevel = 'A2';
            phase2Config = [
                { skill: 'grammar-vocab', level: 'A2', count: 1 },
                { skill: 'listening', level: 'B1', count: 1 },
                { skill: 'reading', level: 'A2', count: 1 },
                { skill: 'writing', level: 'B1', count: 1 }
            ];
        } else {
            ts.currentLevel = 'A1';
            phase2Config = [
                { skill: 'grammar-vocab', level: 'A1', count: 1 },
                { skill: 'listening', level: 'A1', count: 1 },
                { skill: 'reading', level: 'A1', count: 1 },
                { skill: 'writing', level: 'A2', count: 1 }
            ];
        }

        const secIndicator = document.getElementById('placement-section-indicator');
        if (secIndicator) secIndicator.innerHTML = '<span style="color:var(--primary)">🤖 AI Đang Phân Tích & Rẽ Nhánh...</span>';
        const qTextEl = document.getElementById('placement-question-text');
        if (qTextEl) qTextEl.textContent = `Vòng 1: ${phaseCorrect}/${phaseTotal} đúng (${Math.round(accuracy * 100)}%). Đang điều chỉnh độ khó...`;
        document.getElementById('placement-options-container').innerHTML = '';
        document.getElementById('placement-listening-area').classList.add('hidden');
        document.getElementById('placement-reading-area').classList.add('hidden');

        ts.questions = await buildPhaseQuestions(phase2Config);

        setTimeout(() => { showPlacementQuestion(); }, 1500);

    } else if (ts.currentPhase === 2) {
        const phase2Accuracy = phaseTotal > 0 ? phaseCorrect / phaseTotal : 0;

        if (phase2Accuracy > 0.3 && phase2Accuracy < 0.7) {
            ts.currentPhase = 3;
            ts.questionIndex = 0;
            ts.phaseResults = [];

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

            const overallCorrect = ts.allResults.filter(r => r.isCorrect).length;
            const overallTotal = ts.allResults.length;
            const overallAcc = overallTotal > 0 ? overallCorrect / overallTotal : 0;
            let phase3Level = overallAcc >= 0.6 ? 'B2' : overallAcc >= 0.4 ? 'B1' : 'A2';

            const phase3Config = [
                { skill: weakestSkill, level: phase3Level, count: 1 },
                { skill: weakestSkill, level: phase3Level, count: 1 }
            ];

            const secIndicator = document.getElementById('placement-section-indicator');
            if (secIndicator) secIndicator.innerHTML = '<span style="color:var(--accent)">🔍 Xác nhận kết quả (2 câu bổ sung)...</span>';
            const qTextEl = document.getElementById('placement-question-text');
            if (qTextEl) qTextEl.textContent = `Kết quả chưa rõ ràng. Thêm 2 câu xác nhận về ${sectionDisplayName(weakestSkill)}...`;
            document.getElementById('placement-options-container').innerHTML = '';
            document.getElementById('placement-listening-area').classList.add('hidden');
            document.getElementById('placement-reading-area').classList.add('hidden');

            ts.questions = await buildPhaseQuestions(phase3Config);
            setTimeout(() => { showPlacementQuestion(); }, 1200);

        } else {
            finishPlacementTest();
        }
    } else {
        finishPlacementTest();
    }
}

function sectionDisplayName(skill) {
    const names = {
        'listening': 'Nghe',
        'reading': 'Đọc hiểu',
        'grammar_vocab': 'Ngữ pháp/Từ vựng',
        'grammar-vocab': 'Ngữ pháp/Từ vựng',
        'writing': 'Viết'
    };
    return names[skill] || skill;
}

async function finishPlacementTest() {
    const ts = placementTestState;
    const ss = ts.skillScores;

    const calcPct = (s) => s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
    const listeningPct = calcPct(ss.listening);
    const readingPct = calcPct(ss.reading);
    const grammarPct = calcPct(ss.grammar_vocab);
    const writingPct = calcPct(ss.writing);

    const weightedTotal = Math.round(
        (listeningPct * 0.30) + (readingPct * 0.30) +
        (grammarPct * 0.20) + (writingPct * 0.20)
    );

    const totalCorrect = ts.allResults.filter(r => r.isCorrect).length;
    const totalQuestions = ts.allResults.length;
    const rawPct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const finalPct = Math.round((weightedTotal + rawPct) / 2);

    const levelCounts = {};
    for (const result of ts.allResults) {
        if (result.isCorrect) {
            const level = (result.level || '').toUpperCase();
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
            if (i > maxLevelIdx) maxLevelIdx = i;
        } else if (levelCounts[lvl] && levelCounts[lvl] === 1 && ts.allResults.filter(r => (r.level || '').toUpperCase() === lvl).length === 1) {
            if (i > maxLevelIdx) maxLevelIdx = i;
        }
    }

    const maxLevelReached = levelOrder[maxLevelIdx];

    let finalLevel = 'A1';
    if (finalPct >= 80 && maxLevelIdx >= 4) finalLevel = 'C2';
    else if (finalPct >= 70 && maxLevelIdx >= 4) finalLevel = 'C1';
    else if (finalPct >= 60 && maxLevelIdx >= 3) finalLevel = 'B2';
    else if (finalPct >= 45) finalLevel = 'B1';
    else if (finalPct >= 30) finalLevel = 'A2';
    else finalLevel = 'A1';

    if (state.userLevel !== finalLevel) {
        if (typeof logActivity === 'function') {
            logActivity('milestone', `Đạt trình độ ${finalLevel} 🎓`, `Đã hoàn thành bài kiểm tra năng lực tiếng Anh và đạt chuẩn ${finalLevel}.`, 0);
        }
    }

    // Submit to backend
    if (window.ApiClient && window.ApiClient.isLoggedIn() && ts.allAnswers.length > 0) {
        try {
            // Determine the primary type for the session
            const primaryType = 'grammar-vocab';
            await window.ApiClient.submitPlacement(primaryType, ts.allAnswers, state.userLevel);
        } catch (err) {
            console.error('Failed to submit placement to backend:', err);
        }
    }

    state.userLevel = finalLevel;
    state.lastTestScore = Math.round((totalCorrect / totalQuestions) * 16);
    state.placementStats = {
        grammar: Math.round((grammarPct / 100) * 4),
        reading: Math.round((readingPct / 100) * 4),
        vocab: Math.round((grammarPct / 100) * 4),
        listening: Math.round((listeningPct / 100) * 4)
    };
    saveStatsToStorage();

    document.getElementById('placement-intro-screen').classList.add('hidden');
    document.getElementById('placement-quiz-screen').classList.add('hidden');
    document.getElementById('placement-result-screen').classList.remove('hidden');

    document.getElementById('placement-score-result').textContent = `${totalCorrect} / ${totalQuestions}`;
    document.getElementById('placement-weighted-result').textContent = `${finalPct}%`;
    document.getElementById('placement-level-result').textContent = finalLevel;

    document.getElementById('breakdown-listening').textContent = `${listeningPct}%`;
    document.getElementById('bar-listening').style.width = `${listeningPct}%`;
    document.getElementById('breakdown-reading').textContent = `${readingPct}%`;
    document.getElementById('bar-reading').style.width = `${readingPct}%`;
    document.getElementById('breakdown-grammar').textContent = `${grammarPct}%`;
    document.getElementById('bar-grammar').style.width = `${grammarPct}%`;
    document.getElementById('breakdown-vocab').textContent = `${writingPct}%`;
    document.getElementById('bar-vocab').style.width = `${writingPct}%`;

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

    const progBar = document.getElementById('placement-progress-bar');
    if (progBar) progBar.style.width = '100%';
}

function closePlacementTestModal() {
    const modal = document.getElementById('placement-test-modal');
    if (modal) modal.classList.add('hidden');

    placementTestState = null;
    currentPracticeSession = [];

    renderDashboard();
}
