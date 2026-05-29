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
    const baseVocabSeed = Math.round((stats.vocab / 8) * 100);
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
    const quizAccPct = state.quizStats.totalAnswered > 0 ? Math.round((state.quizStats.correctAnswers / state.quizStats.totalAnswered) * 100) : 0;
    const writingPct = Math.min(100, Math.max(quizAccPct || 10, Math.round((score / 16) * 100) || 15));

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

// --- ADAPTIVE PLACEMENT TEST STATE ---
let isPlacementQuizRunning = false;
let currentPlacementRound = 1;
let adaptiveRoundQuestions = [];
let currentPlacementQuestionIndex = 0;
let adaptiveUserAnswers = [];
let adaptiveTotalStats = {
    grammar: 0, reading: 0, vocab: 0, listening: 0,
    totalCorrectRound1: 0, totalRound1: 0,
    totalCorrectRound2: 0, totalRound2: 0
};

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

    // Show dynamic loading spinner inside the question container
    const qTextEl = document.getElementById('placement-question-text');
    const optionsContainer = document.getElementById('placement-options-container');
    if (qTextEl && optionsContainer) {
        qTextEl.textContent = 'Đang tải bộ câu hỏi đánh giá...';
        optionsContainer.innerHTML = `
            <div class="loading-spinner-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; width: 100%;">
                <div class="spinner"></div>
            </div>`;
    }

    // Lazy load placement questions on demand
    if (!window.PLACEMENT_QUESTIONS || window.PLACEMENT_QUESTIONS.length === 0) {
        if (window.FirebaseSync) {
            window.PLACEMENT_QUESTIONS = await window.FirebaseSync.fetchAcademicQuizzes() || [];
        }
    }

    isPlacementQuizRunning = true;
    currentPlacementRound = 1;
    currentPlacementQuestionIndex = 0;
    adaptiveUserAnswers = [];
    adaptiveTotalStats = { grammar: 0, reading: 0, vocab: 0, listening: 0, totalCorrectRound1: 0, totalRound1: 0, totalCorrectRound2: 0, totalRound2: 0 };
    
    // Vòng 1: Khởi động (Mức B1 / B2)
    if (typeof PLACEMENT_QUESTIONS !== 'undefined' && PLACEMENT_QUESTIONS.length > 0) {
        let pool = PLACEMENT_QUESTIONS.filter(q => q.level.includes('B1') || q.level.includes('B2'));
        if (pool.length < 4) {
            pool = [...PLACEMENT_QUESTIONS]; // Fallback if DB too small
        }
        pool.sort(() => 0.5 - Math.random());
        adaptiveRoundQuestions = pool.slice(0, Math.min(10, pool.length));
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
    if (adaptiveRoundQuestions.length === 0) return;
    const q = adaptiveRoundQuestions[currentPlacementQuestionIndex];
    if (!q) return;

    // Update section indicator and progress bar
    const secIndicator = document.getElementById('placement-section-indicator');
    const progText = document.getElementById('placement-progress-text');
    const progBar = document.getElementById('placement-progress-bar');

    const totalQs = adaptiveRoundQuestions.length;
    const progressPct = ((currentPlacementQuestionIndex) / totalQs) * 100;
    if (progBar) progBar.style.width = `${progressPct}%`;
    if (progText) progText.textContent = `Vòng ${currentPlacementRound} - Câu ${currentPlacementQuestionIndex + 1} / ${totalQs}`;

    const sectionNames = {
        'grammar': '📚 NGỮ PHÁP (GRAMMAR)',
        'vocabulary': '🧩 TỪ VỰNG (VOCABULARY)',
        'reading': '📖 ĐỌC HIỂU (READING COMPREHENSION)',
        'listening': '🗣️ PHẢN XẠ & NGHE (REFLEX & LISTENING)'
    };
    if (secIndicator) secIndicator.textContent = sectionNames[q.section] || q.section.toUpperCase();

    // Show question text
    const qTextEl = document.getElementById('placement-question-text');
    if (qTextEl) qTextEl.textContent = q.question;

    // Build options
    const optionsContainer = document.getElementById('placement-options-container');
    if (optionsContainer) {
        optionsContainer.innerHTML = '';

        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option'; // Uses legacy beautiful quiz styling
            btn.style.cssText = 'width: 100%; text-align: left; padding: 14px 18px; margin: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: var(--text-main); font-size: 14px; cursor: pointer; transition: all 0.2s ease;';
            
            // Add hover triggers programmatically for rich feeling
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
    const q = adaptiveRoundQuestions[currentPlacementQuestionIndex];
    adaptiveUserAnswers.push({
        q: q,
        selected: selectedIdx,
        isCorrect: (selectedIdx === q.answer)
    });
    
    currentPlacementQuestionIndex++;
    if (currentPlacementQuestionIndex < adaptiveRoundQuestions.length) {
        showPlacementQuestion();
    } else {
        processRoundEnd();
    }
}

function processRoundEnd() {
    let roundCorrect = 0;
    adaptiveUserAnswers.forEach(ans => {
        if (ans.isCorrect) {
            roundCorrect++;
            if (ans.q.section === 'grammar') adaptiveTotalStats.grammar++;
            else if (ans.q.section === 'reading') adaptiveTotalStats.reading++;
            else if (ans.q.section === 'vocabulary') adaptiveTotalStats.vocab++;
            else if (ans.q.section === 'listening') adaptiveTotalStats.listening++;
        }
    });

    if (currentPlacementRound === 1) {
        adaptiveTotalStats.totalCorrectRound1 = roundCorrect;
        adaptiveTotalStats.totalRound1 = adaptiveRoundQuestions.length;
        let accuracy = roundCorrect / adaptiveRoundQuestions.length;
        
        // Vòng 2: Rẽ nhánh thích ứng
        currentPlacementRound = 2;
        currentPlacementQuestionIndex = 0;
        adaptiveUserAnswers = [];
        
        let pool = [];
        if (accuracy > 0.75) {
            // Nhóm 1: Khá/Giỏi -> B2, C1, C2
            pool = PLACEMENT_QUESTIONS.filter(q => q.level.includes('C1') || q.level.includes('C2') || q.level.includes('B2'));
        } else if (accuracy >= 0.40) {
            // Nhóm 2: Trung bình -> A2, B1
            pool = PLACEMENT_QUESTIONS.filter(q => q.level.includes('B1') || q.level.includes('A2'));
        } else {
            // Nhóm 3: Yếu -> A1, A2
            pool = PLACEMENT_QUESTIONS.filter(q => q.level.includes('A1') || q.level.includes('A2'));
        }
        
        if (pool.length < 3) {
            pool = [...PLACEMENT_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 5); // Fallback
        }
        
        pool.sort(() => 0.5 - Math.random());
        adaptiveRoundQuestions = pool.slice(0, Math.min(10, pool.length));
        
        const secIndicator = document.getElementById('placement-section-indicator');
        if (secIndicator) {
            secIndicator.innerHTML = '<span style="color:var(--primary)">🤖 AI Đang Phân Tích & Rẽ Nhánh...</span>';
        }
        
        setTimeout(() => { showPlacementQuestion(); }, 1500);
    } else {
        adaptiveTotalStats.totalCorrectRound2 = roundCorrect;
        adaptiveTotalStats.totalRound2 = adaptiveRoundQuestions.length;
        finishPlacementTest();
    }
}

function finishPlacementTest() {
    isPlacementQuizRunning = false;

    let totalCorrect = adaptiveTotalStats.totalCorrectRound1 + adaptiveTotalStats.totalCorrectRound2;
    let totalQuestions = adaptiveTotalStats.totalRound1 + adaptiveTotalStats.totalRound2;
    let finalAccuracy = totalCorrect / totalQuestions;
    
    // Classify Level (Vòng 3: Chốt trình độ)
    let finalLevel = 'A1';
    let r1Acc = adaptiveTotalStats.totalCorrectRound1 / adaptiveTotalStats.totalRound1;
    
    if (r1Acc > 0.75) {
        if (finalAccuracy > 0.80) finalLevel = 'C2';
        else if (finalAccuracy > 0.60) finalLevel = 'C1';
        else finalLevel = 'B2';
    } else if (r1Acc >= 0.40) {
        if (finalAccuracy > 0.65) finalLevel = 'B2';
        else finalLevel = 'B1';
    } else {
        if (finalAccuracy > 0.60) finalLevel = 'A2';
        else finalLevel = 'A1';
    }

    state.userLevel = finalLevel;
    // Map to pseudo score out of 16 for UI compatibility
    let mappedScore = Math.round((totalCorrect / totalQuestions) * 16);
    state.lastTestScore = mappedScore;
    
    state.placementStats = {
        grammar: adaptiveTotalStats.grammar,
        reading: adaptiveTotalStats.reading,
        vocab: adaptiveTotalStats.vocab,
        listening: adaptiveTotalStats.listening
    };

    saveStatsToStorage();

    // Show Results Screen
    document.getElementById('placement-intro-screen').classList.add('hidden');
    document.getElementById('placement-quiz-screen').classList.add('hidden');
    document.getElementById('placement-result-screen').classList.remove('hidden');

    // Populate score visualizers
    document.getElementById('placement-score-result').textContent = `${totalCorrect} / ${totalQuestions}`;
    document.getElementById('placement-level-result').textContent = finalLevel;

    // Section breakdown numbers
    let safeTotal = totalQuestions || 1;
    document.getElementById('breakdown-grammar').textContent = `${adaptiveTotalStats.grammar} câu`;
    document.getElementById('breakdown-reading').textContent = `${adaptiveTotalStats.reading} câu`;
    document.getElementById('breakdown-vocab').textContent = `${adaptiveTotalStats.vocab + adaptiveTotalStats.listening} câu`;

    // Section breakdown bars width
    // Normalize bar width relative to total questions
    document.getElementById('bar-grammar').style.width = `${(adaptiveTotalStats.grammar / safeTotal) * 200}%`;
    document.getElementById('bar-reading').style.width = `${(adaptiveTotalStats.reading / safeTotal) * 200}%`;
    document.getElementById('bar-vocab').style.width = `${((adaptiveTotalStats.vocab + adaptiveTotalStats.listening) / safeTotal) * 200}%`;
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
    const totalWordsCount = activeDashboardPool.length;
    let masteredCount = 0;
    let learningCount = 0;
    let newCount = 0;
    let reviewCount = 0;

    for (let i = 0; i < totalWordsCount; i++) {
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
    document.getElementById('stats-total-words').textContent = totalWordsCount;
    document.getElementById('stats-learned').textContent = masteredCount;
    document.getElementById('stats-review').textContent = reviewCount;
    document.getElementById('streak-count-val').textContent = state.streak;

    // Calculate Quiz accuracy
    let accuracyText = '100%';
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
    if (totalWordsCount > 0) {
        const weightedSum = (masteredCount * 100) + (learningCount * 50);
        progressPct = Math.round(weightedSum / totalWordsCount);
    }

    pctText.textContent = `${progressPct}%`;
    
    // Circle radius is 54, circumference is 2 * Math.PI * 54 = ~339.3
    const circumference = 2 * Math.PI * 54;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    const offset = circumference - (progressPct / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // --- UPDATE CEFR SKILL RADAR BARS ---
    updateCEFRSkillsRadarBars(score, masteredCount, totalWordsCount);

    // Render "Word of the Day"
    renderWordOfTheDay();

    // Render Dynamic Learning Roadmap
    renderRoadmap();
}

// Generate random "Word of the Day"
function renderWordOfTheDay(forceRefresh = false) {
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

    const wotd = state.currentWotd;

    document.getElementById('wotd-word').textContent = wotd.word;
    document.getElementById('wotd-type').textContent = wotd.type;
    document.getElementById('wotd-ipa').textContent = wotd.ipa || '';
    document.getElementById('wotd-meaning').textContent = wotd.meaning;
    document.getElementById('wotd-example-en').textContent = `"${wotd.example || ''}"`;
    document.getElementById('wotd-example-vi').textContent = `"${wotd.example_vi || ''}"`;

    // Attach click to voice
    const voiceBtn = document.getElementById('wotd-speak-btn');
    if (voiceBtn) {
        // Remove old listeners
        const newBtn = voiceBtn.cloneNode(true);
        voiceBtn.parentNode.replaceChild(newBtn, voiceBtn);
        newBtn.addEventListener('click', () => speakEnglish(wotd.word));
    }
}

